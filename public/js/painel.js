import { iniciarPagina, mostrarMensagem } from './comum.js';

try {
  const usuario = await iniciarPagina();
  document.querySelector('#nome-perfil').textContent = `Olá, ${usuario.nome}!`;
  document.querySelector('#email-perfil').textContent = usuario.email;
  document.querySelector('#nivel-perfil').textContent = usuario.nivel;
  document.querySelector('#pontos-perfil').textContent = usuario.pontos_totais;
  document.querySelector('#perfil').hidden = false;
} catch (erro) {
  mostrarMensagem(document.querySelector('#mensagem-perfil'), erro.message);
}
