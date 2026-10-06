// Programa 1 - Cálculo de comissões.


/** Converte um valor em reais (número) para centavos inteiros. */
function paraCentavos(valor) {
  return Math.round(Number(valor) * 100);
}

/** Percentual de comissão (inteiro) aplicável a uma venda, em centavos. */
function percentualComissao(centavos) {
  if (centavos < 10000) return 0;  // < R$ 100,00
  if (centavos < 50000) return 1;  // < R$ 500,00
  return 5;                        // >= R$ 500,00
}

/** Comissão de uma venda em centavos, arredondando meio para cima. */
function comissaoVenda(centavos) {
  const pct = percentualComissao(centavos);
  return Math.floor((centavos * pct + 50) / 100);
}

/**
 * Recebe o objeto {vendas:[{vendedor, valor}]} e retorna o resumo por vendedor.
 * @returns {{vendedores: Array<{vendedor:string, qtdVendas:number, totalCentavos:number, comissaoCentavos:number}>,
 *            totalCentavos:number, comissaoCentavos:number, qtdVendas:number}}
 */
function calcularComissoes(dados) {
  if (!dados || !Array.isArray(dados.vendas)) {
    throw new Error('O JSON deve conter a propriedade "vendas" como uma lista.');
  }

  const mapa = new Map();
  dados.vendas.forEach((venda, i) => {
    const nome = venda && typeof venda.vendedor === 'string' ? venda.vendedor.trim() : '';
    const valor = venda ? Number(venda.valor) : NaN;
    if (!nome) throw new Error(`Venda #${i + 1}: "vendedor" ausente ou inválido.`);
    if (!Number.isFinite(valor) || valor < 0) throw new Error(`Venda #${i + 1}: "valor" inválido.`);

    const centavos = paraCentavos(valor);
    if (!mapa.has(nome)) {
      mapa.set(nome, { vendedor: nome, qtdVendas: 0, totalCentavos: 0, comissaoCentavos: 0 });
    }
    const r = mapa.get(nome);
    r.qtdVendas += 1;
    r.totalCentavos += centavos;
    r.comissaoCentavos += comissaoVenda(centavos);
  });

  const vendedores = Array.from(mapa.values());
  return {
    vendedores,
    qtdVendas: vendedores.reduce((s, v) => s + v.qtdVendas, 0),
    totalCentavos: vendedores.reduce((s, v) => s + v.totalCentavos, 0),
    comissaoCentavos: vendedores.reduce((s, v) => s + v.comissaoCentavos, 0),
  };
}

if (typeof module !== 'undefined') {
  module.exports = { paraCentavos, percentualComissao, comissaoVenda, calcularComissoes };
}
