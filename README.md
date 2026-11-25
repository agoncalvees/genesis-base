# Genesis Base

Fundação enxuta para transformar um tema desconhecido numa experiência digital de alto nível. Processo primeiro: protocolo de direção artística, DESIGN.md validado, verificação de fidelidade no navegador. Código mínimo: scaffold, motor de design, primitivas de comportamento e módulos opcionais.

## Comece aqui
1. Abra no Claude Code ou no Codex e peça para continuar a partir de [AGENTS.md](AGENTS.md).
2. Crie o produto: `bun run new -- --name "Nome" --slug nome --dir /abs/nome [--with ai,dataviz]` ([guia](docs/NEW-PRODUCT.md)).
3. No produto, siga o [protocolo de direção artística](docs/design/CREATIVE-DIRECTION.md). Referência de nível: [`design/examples/aceiro`](design/examples/aceiro/).

## Scripts
Bun 1.4.5 e Node 24. `bun install --frozen-lockfile`.
- `bun run dev` (http://127.0.0.1:3000), `build` (Vercel), `build:local` + `serve` (Node)
- `bun run check`, `typecheck`, `test`, `test:e2e`, `test:e2e:prod`
- `bun run design:lint|build|check|diff|import|apply|verify`
- `bun run new` — cria um produto

Mantenha os produtos privados até confirmar as regras do evento. Não manipule datas de commits nem esconda autoria.
