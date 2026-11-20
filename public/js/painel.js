import { api, iniciarPagina, mostrarMensagem } from './comum.js';

try {
  const usuario = await iniciarPagina();
  document.querySelector('#nome-perfil').textContent = `Olá, ${usuario.nome}!`;
  document.querySelector('#email-perfil').textContent = usuario.email;
  document.querySelector('#nivel-perfil').textContent = usuario.nivel;
  document.querySelector('#pontos-perfil').textContent = usuario.pontos_totais;
  document.querySelector('#perfil').hidden = false;

  const { dados: historico } = await api('/progressos?meus=1');
  const itens = historico.map(({ Missao }) => {
    const item = document.createElement('li');
    item.textContent = Missao?.titulo ?? 'Missão removida';
    return item;
  });
  document.querySelector('#lista-missoes-concluidas').replaceChildren(...itens);
  document.querySelector('#historico-vazio').hidden = itens.length > 0;
  document.querySelector('#historico').hidden = false;
} catch (erro) {
  mostrarMensagem(document.querySelector('#mensagem-perfil'), erro.message);
}
