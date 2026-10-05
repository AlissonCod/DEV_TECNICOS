// Questão 2 - Movimentação de estoque (lógica pura, sem DOM).

const TIPOS_MOVIMENTACAO = ['Entrada', 'Saída'];

/**
 * Cria um controle de estoque a partir do JSON {estoque:[{codigoProduto, descricaoProduto, estoque}]}.
 * Os dados de entrada não são alterados (é feita uma cópia).
 * @returns {{itens: Array, mov: Array, lancar: Function}}
 */
function criarEstoque(dados) {
  if (!dados || !Array.isArray(dados.estoque)) {
    throw new Error('O JSON deve conter a propriedade "estoque" como uma lista.');
  }

  const itens = dados.estoque.map((p) => ({
    codigoProduto: p.codigoProduto,
    descricaoProduto: p.descricaoProduto,
    estoque: p.estoque,
  }));
  const mov = [];
  let proximoId = 1;

  /**
   * Lança uma movimentação. Lança erro se algum dado for inválido
   * ou se a saída for maior que o saldo disponível.
   * @returns {object} a movimentação registrada (inclui saldoAnterior e saldoFinal)
   */
  function lancar(codigo, tipo, qtd, descricao) {
    const produto = itens.find((p) => p.codigoProduto === Number(codigo));
    if (!produto) throw new Error(`Produto ${codigo} não encontrado.`);

    if (!TIPOS_MOVIMENTACAO.includes(tipo)) {
      throw new Error('Tipo de movimentação inválido (use "Entrada" ou "Saída").');
    }

    const quantidade = Number(qtd);
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error('A quantidade deve ser um número inteiro maior que zero.');
    }

    const desc = typeof descricao === 'string' ? descricao.trim() : '';
    if (!desc) throw new Error('Informe a descrição da movimentação.');

    if (tipo === 'Saída' && quantidade > produto.estoque) {
      throw new Error(
        `Saldo insuficiente: "${produto.descricaoProduto}" possui ${produto.estoque} unidade(s) e a saída é de ${quantidade}.`
      );
    }

    const saldoAnterior = produto.estoque;
    produto.estoque += tipo === 'Entrada' ? quantidade : -quantidade;

    const registro = {
      id: proximoId++,
      data: new Date(),
      codigoProduto: produto.codigoProduto,
      descricaoProduto: produto.descricaoProduto,
      tipo,
      quantidade,
      descricao: desc,
      saldoAnterior,
      saldoFinal: produto.estoque,
    };
    mov.push(registro);
    return registro;
  }

  return { itens, mov, lancar };
}

if (typeof module !== 'undefined') {
  module.exports = { TIPOS_MOVIMENTACAO, criarEstoque };
}
