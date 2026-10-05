# Desafio Técnico

Projeto web estático (HTML + CSS + JS puro, sem frameworks, sem build e sem dependências).
Para usar, basta abrir o `index.html` no navegador.

## Estrutura

```
desafio/
├─ index.html          Marcação (sem CSS/JS inline)
├─ css/style.css       Estilos, variáveis em :root, dark mode via prefers-color-scheme
└─ js/
   ├─ comissoes.js     Questão 1 - lógica pura (sem DOM)
   ├─ estoque.js       Questão 2 - lógica pura (sem DOM)
   ├─ juros.js         Questão 3 - lógica pura (sem DOM)
   ├─ dados.js         JSONs de exemplo (VENDAS e ESTOQUE)
   └─ app.js           Interface: abas, eventos e renderização
```

Os arquivos de lógica também podem ser carregados no Node:

```js
const { calcularComissoes } = require('./js/comissoes.js');
const { VENDAS } = require('./js/dados.js');
console.log(calcularComissoes(VENDAS));
```

## Premissas

**Questão 1 - Comissões**
- A regra é aplicada **por venda**: abaixo de R$ 100,00 = 0%; abaixo de R$ 500,00 = 1%; a partir de R$ 500,00 = 5%.
- **R$ 500,00 exato cai na faixa de 5%.**
- Cálculos feitos em centavos (inteiros); a comissão de cada venda é arredondada meio para cima.

**Questão 2 - Estoque**
- IDs de movimentação são sequenciais a partir de 1 (em memória, reiniciam ao recarregar a página).
- Quantidade deve ser inteiro maior que zero; descrição é obrigatória.
- Saída maior que o saldo atual é bloqueada.

**Questão 3 - Juros**
- **Juros simples**: `valor × 0,025 × dias de atraso`, contando dias corridos até hoje.
- Dias calculados com `Date.UTC` (ignora horário e fuso/horário de verão). Sem atraso, juros = 0.
- A fórmula está isolada em `formulaJuros()` (`js/juros.js`) para facilitar a troca por juros compostos.
- Valores de juros e total arredondados para centavos.
