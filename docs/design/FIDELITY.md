# Fidelidade ao DESIGN.md

`bun run design:verify <url>` abre a página no Chromium (360/768/1440 px por padrão), espera as fontes, e compara estilos computados com o que o DESIGN.md e o CSS do produto declaram. Também reporta fontes declaradas que não carregaram, overflow horizontal e erros de página, e salva capturas de página inteira e `fidelity.json` em `design/evidence/`. Sai com código 1 se houver divergência.

Motivação: no ISOTERMA o motor garantiu tokens, mas o CSS autoral desviou da escala de títulos e da regra de numerais mono sem que nenhum teste percebesse.

## `design/fidelity.json`

```json
{
  "url": "http://127.0.0.1:3000/",
  "viewports": [360, 768, 1440],
  "waitFor": "main",
  "states": [{ "name": "resultado", "actions": [{ "click": "button[data-action=run]" }] }],
  "probes": [
    { "name": "Manchete", "selector": "h1", "expect": { "font-family": "{typeface-display}", "font-size": ">= 64px" }, "viewports": [1440] },
    { "name": "Leituras", "selector": "[data-reading]", "all": true, "expect": { "font-family": "{typeface-mono}", "font-variant-numeric": "~tabular-nums" } },
    { "name": "Sinal", "selector": "[data-signal]", "expect": { "color": "{--signal}" } },
    { "name": "Fundo", "selector": "body", "expect": { "background-color": "{background}" } }
  ]
}
```

Valores esperados:
- `{token}` — token normalizado do DESIGN.md (`foreground`, `typeface-display`, `radius-control`…; ver tabela em [DESIGN-ENGINE](DESIGN-ENGINE.md)).
- `{--var}` — propriedade customizada lida do `:root` da página (tokens do produto fora do contrato).
- `>= 64px`, `<= 300ms`, `= 1.2` — comparação numérica (px↔rem, s↔ms).
- `~texto` — o valor computado contém o texto.
- qualquer outro texto — igualdade.

Cores são normalizadas pelo navegador antes da comparação; famílias comparam a primeira da lista.

## O que escrever

5–10 regras que expressam a identidade e costumam escapar: família e tamanho da manchete, numerais, cor de sinal reservada, fundo/material, raio dos controles, peso dos títulos de seção, duração das transições principais. `design:verify` não substitui olhar a captura: use as imagens para comparar com o conceito (passo 8 do [protocolo](CREATIVE-DIRECTION.md)).
