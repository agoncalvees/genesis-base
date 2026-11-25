# Status — Genesis Base

## 24/11/2026 · criação (ADR 0007)

Base extraída do Genesis (Lab) `8984f6c` após a P10. Contém scaffold TanStack Start + Vercel, motor de design + `design:verify`, `core`, primitivas de comportamento, motion essencial, `CompareMask`, protocolo de direção artística e o exemplo Aceiro. Módulos opcionais: `ai`, `dataviz`. Sem Studio, mundos, demos, ensaios ou histórico de fases (ficam no Lab: https://github.com/agoncalvees/genesis).

Retomada: para um tema novo, `AGENTS.md` → `docs/NEW-PRODUCT.md` → `docs/design/CREATIVE-DIRECTION.md`.

## 24/11/2026 · ensaio "Senha" (tema surpresa, Claude Code sozinho)

Produto criado com `bun run new` (sem módulos) e implementado inteiramente no Claude Code, porque o Codex atingiu o limite de uso. Correções levadas à Base a partir do ensaio:
- `lang` padrão do documento passa a ser `pt-BR` (era `en`).
- Bricolage Grotesque carrega `wdth.css` (permite a largura condensada).
- `CompareMask`: a camada `before` fica no fluxo, então a comparação herda a altura do conteúdo (antes colapsava para 0 sem altura explícita).
- Biome ignora `design/evidence/` (relatório gerado pelo `design:verify` quebrava `bun run check`; o Aceiro teve o mesmo problema).

Pendente: `FileDrop` ainda usa locale e textos padrão em inglês.
