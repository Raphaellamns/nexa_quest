import { adicionarAcao, adicionarCelula, api, iniciarPagina, mostrarMensagem } from './comum.js';

const formMissao = document.querySelector('#form-missao');
const formBusca = document.querySelector('#form-busca');
const botaoSalvar = formMissao.querySelector('[type="submit"]');
const botaoCancelar = document.querySelector('#cancelar-missao');
const botaoBuscar = document.querySelector('#botao-buscar');
const botaoAnterior = document.querySelector('#botao-anterior');
const botaoProxima = document.querySelector('#botao-proxima');
const lista = document.querySelector('#lista-missoes');
const mensagemMissao = document.querySelector('#mensagem-missao');
const mensagemLista = document.querySelector('#mensagem-lista');
const concluidas = new Set();
const concluindo = new Set();

let administrador = false;
let editando = null;
let pagina = 1;
let busca = '';
let temProxima = false;
let ultimaConsulta = 0;

function exibirFormulario(missao) {
  editando = missao?.id ?? null;
  formMissao.reset();
  if (missao) {
    for (const campo of ['titulo', 'jornada', 'descricao', 'pontos_recompensa']) {
      formMissao.elements[campo].value = missao[campo] ?? '';
    }
  }
  document.querySelector('#titulo-form-missao').textContent = missao ? 'Editar missão' : 'Cadastrar nova missão';
  botaoSalvar.textContent = missao ? 'Salvar alterações' : 'Cadastrar missão';
  botaoCancelar.hidden = !missao;
}

async function concluir(missao, botao) {
  botao.disabled = true;
  concluindo.add(missao.id);
  mostrarMensagem(mensagemLista);
  try {
    const { dados } = await api('/progressos', { metodo: 'POST', corpo: { missao_id: missao.id } });
    concluidas.add(missao.id);
    mostrarMensagem(mensagemLista, `Missão concluída! Você tem ${dados.pontos_totais} pontos e está no nível ${dados.nivel}.`, 'sucesso');
  } catch (erro) {
    mostrarMensagem(mensagemLista, erro.message);
  } finally {
    concluindo.delete(missao.id);
    const atual = lista.querySelector(`[data-concluir="${missao.id}"]`);
    if (atual) {
      atual.disabled = concluidas.has(missao.id);
      atual.textContent = atual.disabled ? 'Concluída' : 'Concluir';
    }
  }
}

async function excluir(missao, botao) {
  if (!window.confirm(`Excluir a missão “${missao.titulo}”?`)) return;
  botao.disabled = true;
  mostrarMensagem(mensagemLista);
  try {
    await api(`/missoes/${missao.id}`, { metodo: 'DELETE' });
    if (editando === missao.id) exibirFormulario();
    await carregarMissoes();
    mostrarMensagem(mensagemLista, 'Missão removida.', 'sucesso');
  } catch (erro) {
    mostrarMensagem(mensagemLista, erro.message);
  } finally {
    botao.disabled = false;
  }
}

function mostrarMissoes(missoes) {
  lista.replaceChildren();
  if (!missoes.length) {
    adicionarCelula(lista.insertRow(), busca ? 'Nenhuma missão encontrada para esta busca.' : 'Ainda não há missões cadastradas.').colSpan = 5;
  }

  missoes.forEach((missao) => {
    const linha = lista.insertRow();
    adicionarCelula(linha, missao.id);
    const titulo = adicionarCelula(linha, missao.titulo);
    if (missao.descricao) {
      const descricao = document.createElement('small');
      descricao.textContent = missao.descricao;
      titulo.append(descricao);
    }
    adicionarCelula(linha, missao.jornada);
    adicionarCelula(linha, missao.pontos_recompensa);

    const grupo = document.createElement('div');
    grupo.className = 'acoes-tabela';
    linha.insertCell().append(grupo);
    const concluida = concluidas.has(missao.id);
    const botao = adicionarAcao(grupo, concluida ? 'Concluída' : 'Concluir', (botao) => concluir(missao, botao),
      concluida || concluindo.has(missao.id));
    botao.dataset.concluir = missao.id;
    if (administrador) {
      adicionarAcao(grupo, 'Editar', () => {
        if (botaoSalvar.disabled) return;
        mostrarMensagem(mensagemMissao);
        exibirFormulario(missao);
        formMissao.elements.titulo.focus();
      });
      adicionarAcao(grupo, 'Excluir', (botao) => excluir(missao, botao));
    }
  });
}

async function carregarMissoes(paginaAlvo = pagina, termo = busca) {
  const consulta = ++ultimaConsulta;
  botaoBuscar.disabled = botaoAnterior.disabled = botaoProxima.disabled = true;
  lista.setAttribute('aria-busy', 'true');
  try {
    const filtros = new URLSearchParams({ pagina: paginaAlvo, nome: termo });
    let resultado = await api(`/missoes?${filtros}`);
    if (!resultado.dados.length && paginaAlvo > 1) {
      paginaAlvo = 1;
      filtros.set('pagina', paginaAlvo);
      resultado = await api(`/missoes?${filtros}`);
    }
    if (consulta !== ultimaConsulta) return;
    pagina = paginaAlvo;
    busca = termo;
    temProxima = resultado.resposta.headers.get('X-Tem-Proxima-Pagina') === 'true';
    document.querySelector('#numero-pagina').textContent = pagina;
    mostrarMissoes(resultado.dados);
  } catch (erro) {
    if (consulta === ultimaConsulta) throw erro;
  } finally {
    if (consulta === ultimaConsulta) {
      botaoBuscar.disabled = false;
      botaoAnterior.disabled = pagina === 1;
      botaoProxima.disabled = !temProxima;
      lista.removeAttribute('aria-busy');
    }
  }
}

async function navegar(paginaAlvo, termo) {
  mostrarMensagem(mensagemLista);
  try {
    await carregarMissoes(paginaAlvo, termo);
  } catch (erro) {
    mostrarMensagem(mensagemLista, erro.message);
  }
}

formBusca.addEventListener('submit', (evento) => {
  evento.preventDefault();
  navegar(1, formBusca.elements.nome.value.trim());
});
botaoAnterior.addEventListener('click', () => navegar(pagina - 1));
botaoProxima.addEventListener('click', () => navegar(pagina + 1));
botaoCancelar.addEventListener('click', () => {
  if (botaoSalvar.disabled) return;
  mostrarMensagem(mensagemMissao);
  exibirFormulario();
});

formMissao.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (botaoSalvar.disabled) return;
  botaoSalvar.disabled = true;
  mostrarMensagem(mensagemMissao);
  const dados = Object.fromEntries(new FormData(formMissao));
  const id = editando;
  try {
    if (id) {
      await api(`/missoes/${id}`, { metodo: 'PUT', corpo: dados });
    } else {
      await api('/missoes', { metodo: 'POST', corpo: dados });
    }
    exibirFormulario();
    mostrarMensagem(mensagemMissao, id ? 'Missão atualizada.' : 'Missão cadastrada.', 'sucesso');
    if (!id) formBusca.reset();
    await navegar(id ? pagina : 1, id ? busca : '');
  } catch (erro) {
    mostrarMensagem(mensagemMissao, erro.message);
  } finally {
    botaoSalvar.disabled = false;
  }
});

try {
  const usuario = await iniciarPagina();
  administrador = usuario.tipo === 'administrador';
  const { dados: historico } = await api('/progressos?meus=1');
  historico.forEach(({ missao_id }) => concluidas.add(missao_id));
  document.querySelector('#formulario-missao').hidden = !administrador;
  document.querySelector('#painel-missoes').hidden = false;
  await carregarMissoes();
} catch (erro) {
  const alvo = document.querySelector('#painel-missoes').hidden ? document.querySelector('#mensagem-pagina') : mensagemLista;
  mostrarMensagem(alvo, erro.message);
}
