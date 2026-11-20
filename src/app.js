const express = require('express');
const path = require('node:path');
const { once } = require('node:events');
const sequelize = require('./config/database');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const missaoRoutes = require('./routes/missaoRoutes');
const progressoRoutes = require('./routes/progressoRoutes');
const { inteiroPositivo } = require('./validacao');

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(usuarioRoutes);
app.use(authRoutes);
app.use(missaoRoutes);
app.use(progressoRoutes);

app.use((erro, req, res, next) => {
  if (res.headersSent) return next(erro);

  if (erro.status >= 400 && erro.status < 500) {
    const mensagem = erro.type === 'entity.parse.failed'
      ? 'Os dados enviados não são um JSON válido.'
      : 'Não foi possível ler os dados enviados.';
    return res.status(erro.status).json({ mensagem });
  }

  console.error(`${req.method} ${req.path}: ${erro.name}`);
  res.status(500).json({ mensagem: 'Ocorreu um erro no servidor. Tente novamente.' });
});

async function iniciar() {
  const porta = inteiroPositivo(process.env.PORT || '3000', 65_535);
  if (!porta) throw new Error('PORT deve ser uma porta válida (1 a 65535).');
  if (!inteiroPositivo(process.env.DB_PORT || '3306', 65_535)) {
    throw new Error('DB_PORT deve ser uma porta válida (1 a 65535).');
  }
  if ((process.env.JWT_SECRET?.trim().length ?? 0) < 32) {
    throw new Error('Defina JWT_SECRET com pelo menos 32 caracteres no arquivo .env. Veja LEIA-ME.md.');
  }

  await sequelize.sync();
  const servidor = app.listen(porta);
  await once(servidor, 'listening');
  console.log(`Nexa Quest disponível em http://localhost:${porta}`);
}

if (require.main === module) {
  iniciar().catch(async (erro) => {
    const codigo = erro.original?.code ?? erro.code;
    const orientacoes = {
      ECONNREFUSED: 'Inicie o MySQL e confira DB_HOST e DB_PORT no arquivo .env.',
      ER_ACCESS_DENIED_ERROR: 'Confira DB_USER e DB_PASSWORD no arquivo .env.',
      ER_BAD_DB_ERROR: 'Crie o banco informado em DB_NAME antes de iniciar o projeto.',
      EADDRINUSE: 'A porta do servidor já está em uso. Troque PORT no arquivo .env.',
    };
    console.error(`Não foi possível iniciar o Nexa Quest. ${orientacoes[codigo] ?? erro.message}`);
    await sequelize.close().catch(() => {});
    process.exitCode = 1;
  });
}

module.exports = app;
