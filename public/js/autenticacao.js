import { api, destinoAposLogin, guardarSessao, mostrarMensagem } from './comum.js';

const formulario = document.querySelector('[data-autenticacao]');
const botao = formulario.querySelector('button[type="submit"]');
const mensagem = document.querySelector('#mensagem-auth');
const cadastro = formulario.dataset.autenticacao === 'cadastro';
const parametros = new URLSearchParams(location.search);
const destino = destinoAposLogin();

if (parametros.has('destino')) {
  const link = document.querySelector('.auth-switch a');
  link.search = new URLSearchParams({ destino }).toString();
}

if (!cadastro && parametros.get('cadastro') === 'ok') {
  mostrarMensagem(mensagem, 'Conta criada! Entre com seu e-mail e senha.', 'sucesso');
}

botao.disabled = false;
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (botao.disabled) return;
  mostrarMensagem(mensagem);
  const { nome, email, senha, confirmacao } = Object.fromEntries(new FormData(formulario));

  if (cadastro && senha !== confirmacao) {
    mostrarMensagem(mensagem, 'As senhas precisam ser iguais.');
    formulario.elements.confirmacao.focus();
    return;
  }

  botao.disabled = true;
  try {
    if (cadastro) {
      await api('/usuarios', { metodo: 'POST', corpo: { nome, email, senha }, autenticada: false });
      const retorno = new URLSearchParams({ cadastro: 'ok' });
      if (parametros.has('destino')) retorno.set('destino', destino);
      location.replace(`login.html?${retorno}`);
      return;
    }

    const { dados } = await api('/login', { metodo: 'POST', corpo: { email, senha }, autenticada: false });
    guardarSessao(dados.token);
    location.replace(destino);
  } catch (erro) {
    mostrarMensagem(mensagem, erro.message);
  } finally {
    botao.disabled = false;
  }
});
