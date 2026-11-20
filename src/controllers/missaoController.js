const { Op, col, fn, where } = require('sequelize');
const Missao = require('../models/Missao');
const { inteiroPositivo } = require('../validacao');

function validarMissao(corpo, parcial = false) {
  const { titulo, jornada, descricao, pontos_recompensa } = corpo ?? {};
  const dados = {};

  for (const [campo, valor] of Object.entries({ titulo, jornada })) {
    if (parcial && valor === undefined) continue;
    const texto = typeof valor === 'string' ? valor.trim() : '';
    if (!texto || texto.length > 255) {
      const rotulo = campo === 'titulo' ? 'o título' : 'a jornada';
      return { mensagem: `Informe ${rotulo} com até 255 caracteres.` };
    }
    dados[campo] = texto;
  }

  if (descricao !== undefined) {
    if (descricao !== null && (typeof descricao !== 'string' || Buffer.byteLength(descricao, 'utf8') > 65_535)) {
      return { mensagem: 'A descrição deve ser um texto de até 65.535 bytes.' };
    }
    dados.descricao = descricao?.trim() || null;
  }

  if (pontos_recompensa !== undefined) {
    dados.pontos_recompensa = inteiroPositivo(pontos_recompensa);
    if (!dados.pontos_recompensa) return { mensagem: 'Informe uma recompensa em pontos inteiros positivos.' };
  }

  if (!Object.keys(dados).length) return { mensagem: 'Informe os dados da missão que deseja editar.' };
  return { dados };
}

async function cadastrar(req, res) {
  const { dados, mensagem } = validarMissao(req.body);
  if (mensagem) return res.status(400).json({ mensagem });

  const missao = await Missao.create(dados);
  res.status(201).json(missao);
}

async function listar(req, res) {
  const pagina = inteiroPositivo(req.query.pagina ?? 1);
  const limite = inteiroPositivo(req.query.limite ?? 5, 100);
  const nome = req.query.nome ?? '';
  if (!pagina || !limite || typeof nome !== 'string' || nome.length > 255) {
    return res.status(400).json({ mensagem: 'Informe página e limite válidos (até 100 itens) e um título de até 255 caracteres.' });
  }

  const busca = nome.trim();
  const missoes = await Missao.findAll({
    where: busca ? where(fn('LOCATE', busca, col('titulo')), { [Op.gt]: 0 }) : undefined,
    order: [['id', 'DESC']],
    limit: limite + 1,
    offset: (pagina - 1) * limite,
  });

  res.set('X-Tem-Proxima-Pagina', String(missoes.length > limite));
  res.json(missoes.slice(0, limite));
}

async function editar(req, res) {
  const id = inteiroPositivo(req.params.id);
  if (!id) return res.status(400).json({ mensagem: 'ID da missão inválido.' });

  const { dados, mensagem } = validarMissao(req.body, true);
  if (mensagem) return res.status(400).json({ mensagem });

  const missao = await Missao.findByPk(id);
  if (!missao) return res.status(404).json({ mensagem: 'Missão não encontrada.' });

  await missao.update(dados);
  res.json(missao);
}

async function deletar(req, res) {
  const id = inteiroPositivo(req.params.id);
  if (!id) return res.status(400).json({ mensagem: 'ID da missão inválido.' });

  const removidas = await Missao.destroy({ where: { id } });
  if (!removidas) return res.status(404).json({ mensagem: 'Missão não encontrada.' });

  res.json({ mensagem: 'Missão removida com sucesso.' });
}

module.exports = { cadastrar, listar, editar, deletar };
