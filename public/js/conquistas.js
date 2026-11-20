import { adicionarAcao, adicionarCelula, api, iniciarPagina, mostrarMensagem } from './comum.js';

const lista = document.querySelector('#lista-conquistas');
const mensagem = document.querySelector('#mensagem-conquistas');
const formulario = document.querySelector('#form-data');
const botaoSalvar = formulario.querySelector('[type="submit"]');
const formatador = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
let editando = null;

function editarData(id, data) {
  if (botaoSalvar.disabled) return;
  const dataLocal = new Date(data.getTime() - data.getTimezoneOffset() * 60_000);
  editando = id;
  formulario.elements.data.value = dataLocal.toISOString().slice(0, 19);
  formulario.hidden = false;
  formulario.elements.data.focus();
  mostrarMensagem(mensagem);
}

async function carregarConquistas() {
  const { dados: historico } = await api('/progressos?meus=1');
  lista.replaceChildren();
  if (!historico.length) {
    adicionarCelula(lista.insertRow(), 'Você ainda não concluiu nenhuma missão.').colSpan = 4;
  }

  historico.forEach((progresso) => {
    const linha = lista.insertRow();
    adicionarCelula(linha, progresso.Missao?.titulo ?? 'Missão removida');
    adicionarCelula(linha, progresso.Missao?.jornada ?? '—');
    const data = progresso.data && new Date(progresso.data);
    const dataValida = data && Number.isFinite(data.getTime());
    adicionarCelula(linha, dataValida ? formatador.format(data) : '—');
    adicionarAcao(linha.insertCell(), 'Editar data', () => editarData(progresso.id, dataValida ? data : new Date()));
  });
}

async function carregarResumo() {
  const { dados } = await api('/progressos/resumo');
  const listas = {
    badges: dados.badges.length ? dados.badges : ['Conclua uma missão para ganhar a primeira medalha.'],
    jornadas: dados.jornadas.map(({ nome, concluidas, total }) =>
      `${nome} — ${concluidas}/${total} missões${concluidas === total ? ' · Concluída' : ''}`),
    'conteudos-extras': dados.conteudos.map(({ titulo, texto, nivel_minimo }) =>
      `${titulo} — ${texto ?? `Disponível no nível ${nivel_minimo}.`}`),
  };
  for (const [id, textos] of Object.entries(listas)) {
    const itens = textos.map((texto) => {
      const item = document.createElement('li');
      item.textContent = texto;
      return item;
    });
    document.getElementById(id).replaceChildren(...itens);
  }
  if (dados.badges.length) {
    adicionarAcao(document.querySelector('#acoes-compartilhar'), 'Compartilhar conquistas', async () => {
      const texto = `No Nexa Quest cheguei ao nível ${dados.nivel}, fiz ${dados.pontos_totais} pontos e ganhei as medalhas ${dados.badges.join(', ')}.`;
      try {
        if (navigator.share) await navigator.share({ title: 'Nexa Quest', text: texto });
        else {
          await navigator.clipboard.writeText(texto);
          mostrarMensagem(mensagem, 'Conquistas copiadas para compartilhar.', 'sucesso');
        }
      } catch (erro) {
        if (erro.name !== 'AbortError') mostrarMensagem(mensagem, texto, 'sucesso');
      }
    });
  }
  document.querySelector('#resumo-conquistas').hidden = false;
}

document.querySelector('#cancelar-data').addEventListener('click', () => {
  if (botaoSalvar.disabled) return;
  formulario.hidden = true;
  editando = null;
  mostrarMensagem(mensagem);
});
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!editando || botaoSalvar.disabled) return;
  const data = new Date(formulario.elements.data.value);
  if (!Number.isFinite(data.getTime())) {
    mostrarMensagem(mensagem, 'Informe uma data e hora válidas.');
    return;
  }

  botaoSalvar.disabled = true;
  try {
    await api(`/progressos/${editando}`, { metodo: 'PUT', corpo: { data: data.toISOString() } });
    editando = null;
    formulario.hidden = true;
    await carregarConquistas();
    mostrarMensagem(mensagem, 'Data atualizada.', 'sucesso');
  } catch (erro) {
    mostrarMensagem(mensagem, erro.message);
  } finally {
    botaoSalvar.disabled = false;
  }
});

try {
  await iniciarPagina();
  await Promise.all([carregarConquistas(), carregarResumo()]);
  document.querySelector('#historico').hidden = false;
} catch (erro) {
  mostrarMensagem(mensagem, erro.message);
}
