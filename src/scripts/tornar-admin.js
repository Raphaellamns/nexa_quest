const sequelize = require('../config/database');
const Usuario = require('../models/Usuario');

async function tornarAdmin() {
  try {
    const email = process.argv[2]?.trim();
    if (!email) throw new Error('Use npm run tornar-admin -- seu-email@exemplo.com');

    const usuario = await Usuario.findOne({ where: { email }, attributes: ['id', 'tipo'] });
    if (!usuario) throw new Error('Cadastre a conta no site antes de promovê-la.');

    await usuario.update({ tipo: 'administrador' });
    console.log('Conta com acesso de administrador.');
  } finally {
    await sequelize.close();
  }
}

tornarAdmin().catch((erro) => {
  console.error(erro.message);
  process.exitCode = 1;
});
