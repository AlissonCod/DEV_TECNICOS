// Interface (DOM): abas, eventos e renderização.
// Depende de: dados.js, comissoes.js, estoque.js, juros.js (carregados antes, com defer).

(function () {
  'use strict';

  // ===== Utilitários =====
  const $ = (id) => document.getElementById(id);

  const fmtMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtNumero = new Intl.NumberFormat('pt-BR');
  const fmtDataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
  const fmtData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });

  const moeda = (reais) => fmtMoeda.format(reais);
  const moedaCentavos = (centavos) => fmtMoeda.format(centavos / 100);

  function escapeHtml(texto) {
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function mostrarMsg(el, texto, tipo) {
    el.textContent = texto;
    el.classList.remove('erro', 'sucesso');
    if (tipo) el.classList.add(tipo);
    el.hidden = false;
  }

  function esconderMsg(el) {
    el.hidden = true;
    el.textContent = '';
  }

  // ===== Abas =====
  function iniciarAbas() {
    const abas = Array.from(document.querySelectorAll('.aba'));

    function ativar(aba) {
      abas.forEach((a) => {
        const ativa = a === aba;
        a.classList.toggle('ativa', ativa);
        a.setAttribute('aria-selected', String(ativa));
        a.tabIndex = ativa ? 0 : -1;
        $(a.getAttribute('aria-controls')).hidden = !ativa;
      });
    }

    abas.forEach((aba, i) => {
      aba.addEventListener('click', () => ativar(aba));
      aba.addEventListener('keydown', (e) => {
        let alvo = null;
        if (e.key === 'ArrowRight') alvo = abas[(i + 1) % abas.length];
        else if (e.key === 'ArrowLeft') alvo = abas[(i - 1 + abas.length) % abas.length];
        else if (e.key === 'Home') alvo = abas[0];
        else if (e.key === 'End') alvo = abas[abas.length - 1];
        if (alvo) {
          e.preventDefault();
          ativar(alvo);
          alvo.focus();
        }
      });
    });
  }

  // ===== Questão 1 - Comissões =====
  function iniciarComissoes() {
    const textarea = $('json-vendas');
    const erro = $('erro-comissoes');
    const resultado = $('resultado-comissoes');
    const exemplo = JSON.stringify(VENDAS, null, 2);

    textarea.value = exemplo;

    function calcular() {
      esconderMsg(erro);
      let dados;
      try {
        dados = JSON.parse(textarea.value);
      } catch (e) {
        resultado.hidden = true;
        mostrarMsg(erro, 'JSON inválido: ' + e.message, 'erro');
        return;
      }

      let r;
      try {
        r = calcularComissoes(dados);
      } catch (e) {
        resultado.hidden = true;
        mostrarMsg(erro, e.message, 'erro');
        return;
      }

      $('tbody-comissoes').innerHTML = r.vendedores.length
        ? r.vendedores.map((v) => `
          <tr>
            <td>${escapeHtml(v.vendedor)}</td>
            <td class="num">${fmtNumero.format(v.qtdVendas)}</td>
            <td class="num">${moedaCentavos(v.totalCentavos)}</td>
            <td class="num">${moedaCentavos(v.comissaoCentavos)}</td>
          </tr>`).join('')
        : '<tr><td colspan="4">Nenhuma venda informada.</td></tr>';

      $('tfoot-comissoes').innerHTML = `
        <tr>
          <td>Total geral</td>
          <td class="num">${fmtNumero.format(r.qtdVendas)}</td>
          <td class="num">${moedaCentavos(r.totalCentavos)}</td>
          <td class="num">${moedaCentavos(r.comissaoCentavos)}</td>
        </tr>`;

      resultado.hidden = false;
    }

    $('form-comissoes').addEventListener('submit', (e) => {
      e.preventDefault();
      calcular();
    });

    $('btn-restaurar-vendas').addEventListener('click', () => {
      textarea.value = exemplo;
      calcular();
    });

    calcular();
  }

  // ===== Questão 2 - Estoque =====
  function iniciarEstoque() {
    const estoque = criarEstoque(ESTOQUE);
    const form = $('form-estoque');
    const selProduto = $('mov-produto');
    const selTipo = $('mov-tipo');
    const inpQtd = $('mov-qtd');
    const inpDesc = $('mov-descricao');
    const msg = $('msg-estoque');

    selProduto.innerHTML = estoque.itens
      .map((p) => `<option value="${p.codigoProduto}">${p.codigoProduto} - ${escapeHtml(p.descricaoProduto)}</option>`)
      .join('');

    function renderEstoque(codigoDestacado) {
      $('tbody-estoque').innerHTML = estoque.itens.map((p) => `
        <tr${p.codigoProduto === codigoDestacado ? ' class="destacado"' : ''}>
          <td class="num">${p.codigoProduto}</td>
          <td>${escapeHtml(p.descricaoProduto)}</td>
          <td class="num">${fmtNumero.format(p.estoque)}</td>
        </tr>`).join('');
    }

    function renderHistorico() {
      const vazio = estoque.mov.length === 0;
      $('historico-vazio').hidden = !vazio;
      $('historico-wrap').hidden = vazio;

      $('tbody-historico').innerHTML = estoque.mov.slice().reverse().map((m) => `
        <tr>
          <td class="num">${m.id}</td>
          <td>${fmtDataHora.format(m.data)}</td>
          <td>${m.codigoProduto} - ${escapeHtml(m.descricaoProduto)}</td>
          <td class="${m.tipo === 'Entrada' ? 'tipo-entrada' : 'tipo-saida'}">${escapeHtml(m.tipo)}</td>
          <td class="num">${fmtNumero.format(m.quantidade)}</td>
          <td class="quebra">${escapeHtml(m.descricao)}</td>
          <td class="num">${fmtNumero.format(m.saldoFinal)}</td>
        </tr>`).join('');
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const m = estoque.lancar(Number(selProduto.value), selTipo.value, inpQtd.value, inpDesc.value);
        mostrarMsg(
          msg,
          `Movimentação #${m.id} lançada (${m.tipo} de ${fmtNumero.format(m.quantidade)}). ` +
          `Estoque final de "${m.descricaoProduto}": ${fmtNumero.format(m.saldoFinal)} unidade(s).`,
          'sucesso'
        );
        renderEstoque(m.codigoProduto);
        renderHistorico();
        inpQtd.value = '';
        inpDesc.value = '';
        inpQtd.focus();
      } catch (err) {
        mostrarMsg(msg, err.message, 'erro');
      }
    });

    renderEstoque();
    renderHistorico();
  }

  // ===== Questão 3 - Juros =====
  function iniciarJuros() {
    const erro = $('erro-juros');
    const resultado = $('resultado-juros');

         // ===== Pra pegar a data de hoje =====
    $('data-hoje').textContent = fmtData.format(new Date());

    $('form-juros').addEventListener('submit', (e) => {
      e.preventDefault();
      esconderMsg(erro);

      const vencimento = parseDataISO($('juros-vencimento').value);
      if (!vencimento) {
        resultado.hidden = true;
        mostrarMsg(erro, 'Informe uma data de vencimento válida.', 'erro');
        return;
      }

      try {
        const r = calcularJuros($('juros-valor').value, vencimento, new Date());
        $('res-dias').textContent = fmtNumero.format(r.diasAtraso) + (r.diasAtraso === 1 ? ' dia' : ' dias');
        $('res-juros').textContent = moeda(r.juros);
        $('res-total').textContent = moeda(r.total);
        resultado.hidden = false;
      } catch (err) {
        resultado.hidden = true;
        mostrarMsg(erro, err.message, 'erro');
      }
    });
  }

  // ===== Inicialização =====
  iniciarAbas();
  iniciarComissoes();
  iniciarEstoque();
  iniciarJuros();
})();
