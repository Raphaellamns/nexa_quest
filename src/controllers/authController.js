const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function login(req, res) {
  const { email, senha } = req.body ?? {};
  if (typeof email !== 'string' || !email.trim() || email.length > 255 || typeof senha !== 'string' || !senha) {
    return res.status(400).json({ mensagem: 'Informe o e-mail e a senha.' });
  }

  const usuario = await Usuario.findOne({ where: { email: email.trim() } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
  }

  const token = jwt.sign(
    { id: usuario.id, tipo: usuario.tipo },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '8h' }
  );

  res.set('Cache-Control', 'no-store').json({
    token,
    nome: usuario.nome,
    tipo: usuario.tipo,
    nivel: usuario.nivel,
    pontos_totais: usuario.pontos_totais,
  });
}

module.exports = { login };
