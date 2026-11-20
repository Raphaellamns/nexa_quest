const bcrypt = require('bcrypt');
const { UniqueConstraintError } = require('sequelize');
const Usuario = require('../models/Usuario');

async function cadastrar(req, res) {
  const { nome, email, senha } = req.body ?? {};
  const nomeAjustado = typeof nome === 'string' ? nome.trim() : '';
  const emailAjustado = typeof email === 'string' ? email.trim() : '';

  if (!nomeAjustado || nomeAjustado.length > 255) {
    return res.status(400).json({ mensagem: 'Informe um nome com até 255 caracteres.' });
  }
  if (emailAjustado.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAjustado)) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }
  if (typeof senha !== 'string' || senha.length < 8 || Buffer.byteLength(senha, 'utf8') > 72) {
    return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 8 caracteres e ocupar até 72 bytes.' });
  }

  try {
    const usuario = await Usuario.create({
      nome: nomeAjustado,
      email: emailAjustado,
      senha: await bcrypt.hash(senha, 10),
    });

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    });
  } catch (erro) {
    if (erro instanceof UniqueConstraintError) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }
    throw erro;
  }
}

function perfil(req, res) {
  res.json(req.usuario);
}

module.exports = { cadastrar, perfil };
