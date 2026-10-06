// Programa 3 - Cálculo de juros por atraso (lógica pura, sem DOM).

const TAXA_DIARIA = 0.025; // Aquie esta a regra dos Juros, 2,5% ao dia

const MS_POR_DIA = 24 * 60 * 60 * 1000; 

/**
 * Dias corridos entre duas datas, ignorando horário e fuso
 */
function diasEntre(inicio, fim) {
  const a = Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  const b = Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate());
  return Math.round((b - a) / MS_POR_DIA);
}

function parseDataISO(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto || ''));
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // Rejeita datas inexistentes (ex.: 2026-02-31)
  if (d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) return null;
  return d;
}

function formulaJuros(valor, taxa, dias) {
  return valor * taxa * dias;
}

/**
 * Calcula os juros de um título na data de referência (padrão: hoje).
 * @returns {{diasAtraso:number, juros:number, total:number}} valores arredondados em centavos
 */
function calcularJuros(valor, vencimento, hoje = new Date(), taxa = TAXA_DIARIA) {
  const v = Number(valor);
  if (!Number.isFinite(v) || v <= 0) throw new Error('Informe um valor maior que zero.');
  if (!(vencimento instanceof Date) || isNaN(vencimento)) throw new Error('Data de vencimento inválida.');

  const diasAtraso = Math.max(0, diasEntre(vencimento, hoje));
  const juros = diasAtraso > 0 ? Math.round(formulaJuros(v, taxa, diasAtraso) * 100) / 100 : 0;
  const total = Math.round((v + juros) * 100) / 100;
  return { diasAtraso, juros, total };
}

if (typeof module !== 'undefined') {
  module.exports = { TAXA_DIARIA, diasEntre, parseDataISO, formulaJuros, calcularJuros };
}
