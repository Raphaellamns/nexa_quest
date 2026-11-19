const Progresso = require('../models/Progresso');
const Missao = require('../models/Missao');
const Usuario = require('../models/Usuario');

async function registrar(req, res) {
  try {
    const { missao_id } = req.body;
    const usuario_id = req.usuario.id;

    const missao = await Missao.findByPk(missao_id);
    if (!missao) {
      return res.status(404).json({ mensagem: 'Missão não encontrada' });
    }

    const usuario = await Usuario.findByPk(usuario_id);
    const jaConcluiu = await Progresso.findOne({ where: { usuario_id, missao_id } });
    if (jaConcluiu) {
      return res.status(400).json({ mensagem: 'Você já concluiu esta missão!' });
    }

    const progresso = await Progresso.create({
      usuario_id,
      missao_id,
    });

    const novosPontos = usuario.pontos_totais + missao.pontos_recompensa;
    const novoNivel = Math.floor(novosPontos / 100) + 1;
    await usuario.update({ pontos_totais: novosPontos, nivel: novoNivel });

    res.status(201).json({
      progresso,
      pontos_totais: novosPontos,
      nivel: novoNivel,
    });
  } catch (erro) {
    res.status(400).json({
      mensagem: 'Erro ao registrar conclusão da missão',
      erro: erro.message,
    });
  }
}

async function listar(req, res) {
  try {
    const historico = await Progresso.findAll({
      include: [Missao, Usuario],
      order: [['data', 'DESC']],
    });
    res.json(historico);
  } catch (erro) {
    res.status(400).json({
      mensagem: 'Erro ao listar histórico de conquistas',
      erro: erro.message,
    });
  }
}

async function editarData(req, res) {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const progresso = await Progresso.findByPk(id);
    if (!progresso) {
      return res.status(404).json({ mensagem: 'Registro não encontrado' });
    }

    await progresso.update({ data });
    res.status(200).json(progresso);
  } catch (erro) {
    res.status(400).json({
      mensagem: 'Erro ao corrigir data',
      erro: erro.message,
    });
  }
}

module.exports = { registrar, listar, editarData };
