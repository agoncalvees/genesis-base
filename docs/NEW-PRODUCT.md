# Criar um produto

```sh
bun run new -- --name "Nome" --slug nome --dir /caminho/absoluto/nome [--with ai,dataviz] [--e2e] [--dry-run]
```

- A Base precisa estar sem alterações rastreadas; o destino, ausente ou vazio e fora dela.
- Copia os arquivos versionados para um repositório **novo** (histórico próprio, sem remoto), sem o gerador e sem os módulos não pedidos (arquivos, testes e dependências).
- Módulos: `ai` (IA server-only com AI SDK + OpenRouter, padrões de interface de IA; ver `.env.example`), `dataviz` (gráficos acessíveis).
- Escreve nome em `src/core/app-config.ts`, `package.json`, `README.md`, `docs/STATUS.md` e `PROVENANCE.md`; instala, roda `design:build`, `check`, `typecheck`, `design:check`, `test` (e `test:e2e` com `--e2e`) e faz o commit inicial local.
- Fontes não vêm instaladas: escolha no DESIGN.md e rode `bun add` do pacote indicado pelo `design:build`.
- Para começar de uma identidade pronta: `bun run design:apply example/aceiro`.

O produto nasce com a estrutura padrão de história (`src/features/story/content.ts` para preencher, `src/routes/index.tsx` com as seções marcadas, `tests/e2e/story.spec.ts` e `design/fidelity.json` com `firstViewport`).

Depois: siga [AGENTS.md](../AGENTS.md) e o [protocolo](design/CREATIVE-DIRECTION.md). Deploy na Vercel: `bun run build` (preset Vercel); localmente, `bun run build:local` e `bun run serve`.
