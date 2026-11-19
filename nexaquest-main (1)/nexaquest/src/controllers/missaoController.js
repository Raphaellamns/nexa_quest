const Missao = require('../models/Missao');
const { Op } = require('sequelize');

async function cadastrar(req, res) {
  try {
    const { titulo, jornada, descricao, pontos_recompensa } = req.body;
    const missao = await Missao.create({
      titulo,
      jornada,
      descricao,
      pontos_recompensa,
    });
    res.status(201).json(missao);
  } catch (erro) {
    res.status(400).json({
      mensagem: 'Erro ao cadastrar missão',
      erro: erro.message,
    });
  }
}

async function listar(req, res) {
  try {
    const { pagina = 1, limite = 5, nome } = req.query;
    const filtro = {};

    if (nome) {
      filtro.titulo = { [Op.like]: `%${nome}%` };
    }

    const missoes = await Missao.findAll({
      where: filtro,
      limit: Number(limite),
      offset: (Number(pagina) - 1) * Number(limite),
    });

    res.json(missoes);
  } catch (erro) {
    res.status(400).json({
      mensagem: 'Erro ao listar missões',
      erro: erro.message,
    });
  }
}

async function editar(req, res) {
  try {
    const { id } = req.params;
    const { titulo, jornada } = req.body;

    const missao = await Missao.findByPk(id);
    if (!missao) {
      return res.status(404).json({ mensagem: 'Missão não encontrada' });
    }

    await missao.update({ titulo, jornada });
    res.status(200).json(missao);
  } catch (erro) {
    res.status(400).json({
      mensagem: 'Erro ao editar missão',
      erro: erro.message,
    });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    const missao = await Missao.findByPk(id);
    if (!missao) {
      return res.status(404).json({ mensagem: 'Missão não encontrada' });
    }

    await missao.destroy();
    res.status(200).json({ mensagem: 'Missão removida com sucesso' });
  } catch (erro) {
    res.status(400).json({
      mensagem: 'Erro ao remover missão',
      erro: erro.message,
    });
  }
}

module.exports = { cadastrar, listar, editar, deletar };