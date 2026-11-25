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

## 24/11/2026 · protocolo de pitch

Feedback do responsável: o app era bonito, mas o jurado não entendia a dor sem explorar. Adicionados `docs/product/PITCH-PROTOCOL.md` (dor com número, critérios → evidência, estrutura obrigatória do app, pitch de 3 min, teste dos 5 segundos), modelos de brief e roteiro, `PitchTour`/`usePitchMode` (`?demo=1`, passador de slides) e `firstViewport` no `design:verify`. Aplicado no Senha: abertura com público, dor (1h03), promessa e ação; tour de 5 passos que executa a demo; bloco "Como funciona" e próximos passos; roteiro de 3 min. Senha: 124 testes, 11 e2e, `design:verify` 1017/1017.

## 24/11/2026 · padrões de vencedores e estrutura padrão

Pesquisa (OpenAI Build Week 2026, TreeHacks 2025/2026, Gemini API Competition, relatos de jurados, Hackathon Cognition SP, Hack Brasil 2026) consolidada em `docs/product/WINNING-PATTERNS.md`. Hack IA Brasil verificado: 28/11, João Pessoa, 8h–18h, ~6 h úteis; critérios e regras não publicados (perguntas em `PLAYBOOK.md`). Novo: `PLAYBOOK.md` (linha do tempo, método da dor, pontuação de ideias, papéis), `prompts/JUDGE.md` (avaliação cega), estrutura padrão gerada em todo produto (`features/story/content.ts` + seções `data-story` + `?demo=1` + e2e). Verificação: check, typecheck, test, build = 0; e2e 5; `design:verify` do esqueleto 6/6.
