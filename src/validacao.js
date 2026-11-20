function inteiroPositivo(valor, maximo = 2_147_483_647) {
  if (typeof valor === 'string' && /^\d+$/.test(valor)) valor = Number(valor);
  return Number.isInteger(valor) && valor >= 1 && valor <= maximo ? valor : null;
}

module.exports = { inteiroPositivo };
