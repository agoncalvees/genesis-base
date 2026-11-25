# ADR 0006 — Adaptive design engine sobre DESIGN.md
Status: proposto (P09; execução autorizada pelo responsável em 2026-11-24)
Data: 2026-11-24

## Contexto e restrições
O design system atual (ADR 0005) já separa tokens neutros (`tokens/base.css`) e identidade (`themes/product.css`), mas só varia **cor e fonte**, aplica tema apenas por `data-theme` em `<html>` e não tem contrato visual legível por agentes. P09 pede um motor capaz de produzir produtos visualmente distintos — composição, densidade, geometria, superfícies, motion — sobre a mesma fundação, com DESIGN.md como contrato ativo.

## Fontes avaliadas (licença / uso)
| Fonte | Licença | Uso no Genesis |
|---|---|---|
| `google-labs-code/design.md` — spec `docs/spec.md`, CLI `@google/design.md` | Apache-2.0 (repositório; metadado npm sem campo `license` — conferir LICENSE no tarball) | **Formato normativo** e ferramenta de lint/diff/export, fixada em `@google/design.md@0.4.0` (spec `version: alpha`) |
| `VoltAgent/awesome-design-md`, getdesign.md | MIT (repo); arquivos são análises **inspiradas em marcas de terceiros**, uso nominativo, sem endosso | Somente referência de **estrutura**. Nenhuma identidade de marca é importada para os mundos |
| `VoltAgent/official-design-md` | MIT (índice) | Exemplos de adoção oficial; referência de formato |
| Robin (robin-dashboard-amber.vercel.app) | sem licença de reuso | Referência de **princípios** (escala editorial, grade de hairlines, evidência inline, contenção). Sem cópia de marca, cor, fonte, assets ou código |
| Fontes dos mundos (`@fontsource*`) | OFL-1.1 | Self-hosted, carregadas só onde usadas |

## Decisão
1. **DESIGN.md é o contrato de identidade.** `design/DESIGN.md` = identidade ativa do produto; `design/worlds/<id>/DESIGN.md` = mundos experimentais. Seguem a spec do Google (front matter YAML + seções na ordem canônica). Campos que a spec não cobre (densidade, superfície, iconografia, composição, dataviz, perfil de motion) vão numa chave de extensão **`genesis:`** — a spec aceita chaves de extensão silenciosamente.
2. **Regras permanentes de engenharia visual ficam fora do DESIGN.md**, em `docs/design/VISUAL-ENGINEERING.md` (contraste mínimo, foco, alvos, reduced motion, propriedades animáveis, arquitetura de tokens). Nenhum DESIGN.md pode relaxá-las.
3. **Adaptador isolado** em `tools/design-engine/` (tooling de build, nunca importado por `src/`): `parse/lint/diff` delegam ao `@google/design.md@0.4.0` (devDependency, versão exata); **normalização semântica** própria mapeia tokens do DESIGN.md → contrato semântico Genesis (`background, surface, surface-raised, foreground, muted, border, primary/on-primary, accent/on-accent, focus, success/warning/danger/info + on-*`, `data-1..data-6`) e eixos estruturais; **gerador** escreve CSS em `src/design-system/themes/generated/` com escopo `[data-world="<id>"]` (e `:root` para o produto ativo). O export `css-tailwind` oficial é usado como verificação cruzada, não como saída final (ele não conhece o contrato semântico Genesis).
4. **Escopo por container, não global.** Tema = atributo `data-world` em qualquer elemento; variáveis CSS cascateiam, permitindo dois mundos lado a lado sem vazamento. `data-theme` (claro/escuro) continua ortogonal dentro do mundo.
5. **Eixos estruturais como tokens**, consumidos pelos componentes via CSS vars / data-attributes (não por classes de marca): densidade (`--density`, alturas de controle, escala de espaço), geometria (`--radius-*`, forma de botão), superfície (`--surface-style: border|elevation|tint`), tipografia contextual (família, peso de display, tracking, razão de escala), iconografia (peso Phosphor), motion (perfil: durações, easing, spring, intensidade), dataviz (paleta categórica validada, estilo de eixo/grade) e **composição** (preset de layout usado pela vitrine do mundo).
6. **Importação nunca aplica automaticamente.** `design:import` copia a referência para `design/imports/<nome>/` (quarentena), roda lint + normalização + contraste e emite relatório; aplicar exige `design:apply` explícito e falha se houver erro de contraste/estrutura.
7. **Detecção de drift:** `design:check` regenera em memória e falha se o CSS commitado divergir do DESIGN.md; roda no CI.

## Alternativas consideradas
- Style Dictionary / DTCG como fonte primária: mais maduro, porém sem prosa/racional para agentes; o export `dtcg` do CLI do Google cobre interoperabilidade se necessário.
- Temas só via `@theme` global do Tailwind: impede mundos lado a lado e vaza estilos.
- CSS-in-JS por tema: custo de runtime e quebra do SSR atual.

## Consequências e riscos
- Spec em `alpha` evolui: adaptador isolado + versão exata + teste de contrato sobre fixtures permitem atualizar em um ponto.
- `@google/design.md` depende de `zod@^3` (o app usa zod 4): só devDependency, sem impacto no bundle.
- Fontes adicionam peso: carregadas apenas pela rota dos mundos e pelo produto que as escolher.

## Rollback
Remover `tools/design-engine/` e `themes/generated/`; `product.css` manual (ADR 0005) continua funcional.

## Responsável e aprovação
Claude (proposta). Execução autorizada pelo responsável (P09).
