const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { once } = require('node:events');
const { after, before, test } = require('node:test');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = randomBytes(32).toString('hex');
const app = require('../src/app');
const Usuario = require('../src/models/Usuario');
const Progresso = require('../src/models/Progresso');

let servidor;
let origem;
const operador = { id: 1, nome: 'Pessoa de teste', email: 'pessoa@example.com', tipo: 'operador', nivel: 1, pontos_totais: 0 };

before(async () => {
  servidor = app.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  origem = `http://127.0.0.1:${servidor.address().port}`;
});

after(() => new Promise((resolve, reject) => servidor.close((erro) => erro ? reject(erro) : resolve())));

function enviarJson(caminho, corpo, metodo = 'POST', headers = {}) {
  return fetch(`${origem}${caminho}`, {
    method: metodo,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
}

function autenticarOperador(t) {
  t.mock.method(Usuario, 'findByPk', async (id, opcoes) => {
    assert.equal(id, operador.id);
    assert.deepEqual(opcoes.attributes, Object.keys(operador));
    return operador;
  });
  const token = jwt.sign({ id: operador.id }, process.env.JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
}

test('as páginas e os arquivos JavaScript da área de jogo são servidos', async () => {
  for (const caminho of ['/', '/login.html', '/cadastro.html', '/painel.html', '/missoes.html', '/js/painel.js', '/js/missoes.js']) {
    const resposta = await fetch(`${origem}${caminho}`);
    assert.equal(resposta.status, 200, caminho);
    if (caminho === '/painel.html') {
      assert.match(await resposta.text(), /id="lista-missoes-concluidas"/);
    } else {
      await resposta.body.cancel();
    }
  }
  const removida = await fetch(`${origem}/conquistas.html`);
  assert.equal(removida.status, 404);
  await removida.body.cancel();
});

test('cadastro e login inválidos têm resposta JSON legível', async () => {
  for (const caminho of ['/usuarios', '/login']) {
    const resposta = await enviarJson(caminho, {});
    assert.equal(resposta.status, 400);
    assert.equal(typeof (await resposta.json()).mensagem, 'string');
  }
  const resposta = await fetch(`${origem}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(resposta.status, 400);
  assert.match((await resposta.json()).mensagem, /JSON/);
});

test('cadastro salva o hash e devolve apenas a identificação pública da conta', async (t) => {
  const senha = 'senha-de-teste';
  t.mock.method(Usuario, 'create', async (dados) => {
    assert.deepEqual(Object.keys(dados), ['nome', 'email', 'senha']);
    assert.notEqual(dados.senha, senha);
    return { ...dados, id: operador.id, tipo: 'operador' };
  });
  const resposta = await enviarJson('/usuarios', { nome: operador.nome, email: operador.email, senha });
  assert.equal(resposta.status, 201);
  assert.deepEqual(await resposta.json(), { id: operador.id, nome: operador.nome, email: operador.email, tipo: 'operador' });
});

test('rotas protegidas exigem login e restringem criação de missões ao administrador', async (t) => {
  const semSessao = await fetch(`${origem}/usuarios/perfil`);
  assert.equal(semSessao.status, 401);
  await semSessao.body.cancel();

  const headers = autenticarOperador(t);
  const resposta = await enviarJson('/missoes', { titulo: 'Missão', jornada: 'Libras' }, 'POST', headers);
  assert.equal(resposta.status, 403);
  await resposta.body.cancel();
});

test('o histórico do operador é filtrado pela sua conta e carrega só o nome e ID dos usuários', async (t) => {
  const headers = autenticarOperador(t);
  const consulta = t.mock.method(Progresso, 'findAll', async (opcoes) => {
    assert.deepEqual(opcoes.where, { usuario_id: operador.id });
    assert.deepEqual(opcoes.include[1].attributes, ['id', 'nome']);
    return [];
  });
  const resposta = await fetch(`${origem}/progressos`, { headers });
  assert.equal(resposta.status, 200);
  assert.deepEqual(await resposta.json(), []);
  assert.equal(consulta.mock.callCount(), 1);
});

test('paginação, conclusão e datas inválidas são rejeitadas antes de gravar', async (t) => {
  const headers = autenticarOperador(t);
  const respostas = await Promise.all([
    fetch(`${origem}/missoes?pagina=0`, { headers }),
    enviarJson('/progressos', { missao_id: 0 }, 'POST', headers),
    enviarJson('/progressos/1', { data: '2026-02-30' }, 'PUT', headers),
  ]);
  for (const resposta of respostas) {
    assert.equal(resposta.status, 400);
    await resposta.body.cancel();
  }
});
