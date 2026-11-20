const sequelize = require('../config/database');
const Progresso = require('../models/Progresso');
const Missao = require('../models/Missao');
const Usuario = require('../models/Usuario');
const { inteiroPositivo } = require('../validacao');

async function registrar(req, res) {
  const missao_id = inteiroPositivo(req.body?.missao_id);
  if (!missao_id) return res.status(400).json({ mensagem: 'ID da missão inválido.' });
  const usuario_id = req.usuario.id;

  const resultado = await sequelize.transaction(async (transaction) => {
    // A trava do usuário serializa conclusões simultâneas e protege o saldo.
    const usuario = await Usuario.findByPk(usuario_id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!usuario) return { status: 401, mensagem: 'Entre na sua conta para continuar.' };

    const missao = await Missao.findByPk(missao_id, { transaction, lock: transaction.LOCK.SHARE });
    if (!missao) return { status: 404, mensagem: 'Missão não encontrada.' };

    const jaConcluiu = await Progresso.findOne({ where: { usuario_id, missao_id }, transaction });
    if (jaConcluiu) return { status: 409, mensagem: 'Você já concluiu esta missão.' };

    const pontos_totais = usuario.pontos_totais + missao.pontos_recompensa;
    if (pontos_totais > 2_147_483_647) {
      return { status: 409, mensagem: 'O total de pontos atingiu o limite permitido.' };
    }
    const nivel = Math.floor(pontos_totais / 100) + 1;
    const progresso = await Progresso.create({ usuario_id, missao_id }, { transaction });
    await usuario.update({ pontos_totais, nivel }, { transaction });

    return { status: 201, progresso, pontos_totais, nivel };
  });

  const { status, ...dados } = resultado;
  res.status(status).json(dados);
}

async function listar(req, res) {
  const verTodos = req.usuario.tipo === 'administrador' && req.query.meus !== '1';
  const historico = await Progresso.findAll({
    where: verTodos ? undefined : { usuario_id: req.usuario.id },
    include: [Missao, { model: Usuario, attributes: ['id', 'nome'] }],
    order: [['data', 'DESC'], ['id', 'DESC']],
  });
  res.json(historico);
}

function lerData(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(valor)) {
    return null;
  }

  const dia = valor.slice(0, 10);
  const calendario = new Date(`${dia}T00:00:00.000Z`);
  const data = new Date(valor);
  if (!Number.isFinite(data.getTime()) || !Number.isFinite(calendario.getTime()) ||
      calendario.toISOString().slice(0, 10) !== dia || data.getUTCFullYear() < 1000 || data.getUTCFullYear() > 9999) {
    return null;
  }
  return data;
}

async function editarData(req, res) {
  const id = inteiroPositivo(req.params.id);
  const data = lerData(req.body?.data);
  if (!id || !data) return res.status(400).json({ mensagem: 'Informe um ID e uma data válidos.' });

  const filtro = { id };
  if (req.usuario.tipo !== 'administrador') filtro.usuario_id = req.usuario.id;
  const progresso = await Progresso.findOne({ where: filtro });
  if (!progresso) return res.status(404).json({ mensagem: 'Registro não encontrado.' });

  await progresso.update({ data });
  res.json(progresso);
}

module.exports = { registrar, listar, editarData };
