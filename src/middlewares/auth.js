const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { inteiroPositivo } = require('../validacao');

async function autenticar(req, res, next) {
  const [, token] = /^Bearer\s+([^\s]+)$/i.exec(req.get('Authorization') ?? '') ?? [];
  if (!token) {
    return res.status(401).json({ mensagem: 'Entre na sua conta para continuar.' });
  }

  let id;
  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    id = inteiroPositivo(dados.id);
  } catch {
    return res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Entre novamente.' });
  }

  const usuario = id && await Usuario.findByPk(id, {
    attributes: ['id', 'nome', 'email', 'tipo', 'nivel', 'pontos_totais'],
  });
  if (!usuario) {
    return res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Entre novamente.' });
  }

  res.set('Cache-Control', 'no-store');
  req.usuario = usuario;
  next();
}

module.exports = autenticar;
