# ADR 0001 — Stack e versões candidatas
Status: aceito (aprovação humana em 2026-11-24)
Data: 2026-11-24

## Contexto e restrições
BLUEPRINT propõe TanStack Start + React + TS strict + Bun, Tailwind v4, Base UI, Motion, Convex, AI SDK + OpenRouter, Biome, Vitest, Playwright. Fase 00 não instala nada. Evidência completa: `docs/engineering/phase-00/compat-matrix.md` (P00-CDX-01, Codex), com versões lidas do registro npm em 2026-11-24. Núcleo, qualidade, Tailwind, Base UI, Motion e opcionais (convex, ai, openrouter, zod — só import) **testados** em scaffold isolado por P00-CDX-02; TS 7.0.2 aprovado.

## Decisão
Instalação inicial da fase 01 limitada ao núcleo; demais pacotes entram quando usados.

| Grupo | Pacotes e versão candidata | Entra em |
|---|---|---|
| Núcleo | `@tanstack/react-start@1.169.7`, `@tanstack/react-router@1.170.46`, `react@19.3.1`, `react-dom@19.3.1`, `vite@8.3.8`, `@vitejs/plugin-react@6.3.0`, `typescript@7.0.2`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `@types/node@24.19.2` | 01 |
| Qualidade | `@biomejs/biome@2.6.9`, `vitest@5.1.1`, `@playwright/test@1.65.1` | 01 |
| Estilo | `tailwindcss@4.3.5`, `@tailwindcss/vite@4.3.5` | 01 ou 02 |
| UI | `@base-ui/react@1.9.0` (**não** `@base-ui-components/react`, deprecado), `class-variance-authority@0.7.1`, `tailwind-merge@3.7.1`, `@phosphor-icons/react@2.1.10` | 02 |
| Motion | `motion@14.14.0` | 03 |
| IA | `ai@7.0.181`, `@openrouter/ai-sdk-provider@3.1.0`, `zod@4.6.7` | 04 |
| Dados (opcional) | `convex@1.51.0`; `@convex-dev/react-query@0.1.0` + `@tanstack/react-query@5.108.4` + `@tanstack/react-router-ssr-query@1.167.3` só se SSR com React Query for necessário | quando houver persistência |
| Deploy | preset Vercel via `nitro` (só pré-release disponível) — **deploy na Vercel aprovado pelo responsável em 2026-11-24**, mesmo com Nitro pré-release | fase 01, após build local |

Runtime: Bun 1.4.5 para instalação/lockfile e scripts; Node 24.x para ferramentas e para Functions na Vercel (Bun Functions é beta — não usar). Scaffold: `@tanstack/cli@0.72.16 create ... --blank` em diretório temporário, migrando manualmente só config, router, rotas mínimas e testes; nunca sobrescrever docs existentes.

## Alternativas consideradas
- `create-convex -t tanstack-start` (Convex-first): rejeitado como padrão — torna Convex obrigatório no arranque, contra BLUEPRINT.
- TypeScript 5.x/6.x em vez de 7.0.2: **fallback** se TS 7 quebrar typecheck, tipos gerados do Router ou do Convex. Decidir com evidência na fase 01.
- Deploy Vercel com Nitro pré-release vs adiar hospedagem: responsável escolheu Vercel; demo local permanece como contingência.

## Consequências e riscos
- TS 7 é major recente (risco alto de incompatibilidade com tooling).
- Nitro sem release estável compatível com Vite 8 (risco alto para deploy, nulo para local).
- `@convex-dev/react-query` é 0.x.
- Bun 1.4.5 e Node 24.22.3 instalados em 2026-11-24 (aprovação do responsável).

## Rollback
Fase 01 em commits pequenos; reverter manifesto + lockfile; trocar TS para a linha anterior; adiar deploy.

## Responsável e aprovação
Proposta: Claude (lead) com evidência de Codex. Aprovação humana requerida.
