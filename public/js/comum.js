const chaveToken = 'nexaquest.token';
const paginasProtegidas = ['painel.html', 'missoes.html'];

export function destinoAposLogin() {
  const destino = new URLSearchParams(location.search).get('destino');
  return paginasProtegidas.includes(destino) ? destino : 'painel.html';
}

export function abrirLogin() {
  sessionStorage.removeItem(chaveToken);
  const pagina = location.pathname.split('/').pop();
  const destino = paginasProtegidas.includes(pagina) ? `?destino=${pagina}` : '';
  location.replace(`login.html${destino}`);
}

export function guardarSessao(token) {
  sessionStorage.setItem(chaveToken, token);
}

export function mostrarMensagem(elemento, texto = '', tipo = 'erro') {
  elemento.textContent = texto;
  elemento.dataset.tipo = tipo;
}

export async function api(caminho, { metodo = 'GET', corpo, autenticada = true } = {}) {
  const cabecalhos = { Accept: 'application/json' };
  if (autenticada) {
    const token = sessionStorage.getItem(chaveToken);
    if (!token) {
      abrirLogin();
      throw new Error('Entre na sua conta para continuar.');
    }
    cabecalhos.Authorization = `Bearer ${token}`;
  }
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';

  let resposta;
  try {
    resposta = await fetch(caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new Error('Não foi possível acessar o servidor do Nexa Quest. Confira se ele está rodando.');
  }

  if (autenticada && resposta.status === 401) abrirLogin();
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok || dados === null) {
    throw new Error(dados?.mensagem || 'Não foi possível completar a ação. Tente novamente.');
  }
  return { dados, resposta };
}

export async function iniciarPagina() {
  document.querySelectorAll('[data-sair]').forEach((link) => {
    link.addEventListener('click', (evento) => {
      evento.preventDefault();
      sessionStorage.removeItem(chaveToken);
      location.replace('login.html');
    });
  });
  window.addEventListener('pageshow', (evento) => {
    if (evento.persisted) location.reload();
  });

  const { dados } = await api('/usuarios/perfil');
  return dados;
}

export function adicionarCelula(linha, texto) {
  const celula = linha.insertCell();
  celula.textContent = texto;
  return celula;
}

export function adicionarAcao(grupo, rotulo, acao, desativado = false) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'btn btn-soft btn-compacto';
  botao.textContent = rotulo;
  botao.disabled = desativado;
  botao.addEventListener('click', () => acao(botao));
  grupo.append(botao);
  return botao;
}
