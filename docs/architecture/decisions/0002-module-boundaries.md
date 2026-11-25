# ADR 0002 — Fronteiras de módulo e núcleo agnóstico
Status: aceito (aprovação humana em 2026-11-24)
Data: 2026-11-24
Contexto e restrições: tema desconhecido; BLUEPRINT define `core/`, `design-system/`, `layouts/`, `features/`, `ai/`, `evidence/`, `integrations/`, `studio/`. AGENTS.md exige que o núcleo não importe `features/` e que capacidades opcionais não sejam requisito de arranque.
Alternativas consideradas: (a) monorepo com pacotes; (b) app único com fronteiras por diretório e regra de lint; (c) sem regras.
Decisão e justificativa: (b). Menor complexidade para hackathon. Direção de dependência permitida: `routes -> features -> {layouts, design-system, ai, evidence, integrations} -> core`. `core` e `design-system` nunca importam `features`, `ai`, `integrations` ou `studio`. `ai/` é server-only. `studio/` é dev-only e não é importado por rotas de produção. Diretórios sem uso real na fase são removidos/não criados (BLUEPRINT "evitar diretórios sem uso").
Evidência: regras textuais em AGENTS.md e BLUEPRINT; enforcement proposto via Biome `noRestrictedImports` (disponibilidade da regra a verificar na fase 01) ou teste Vitest que varre imports.
Consequências e riscos: monorepo descartado; se o tema exigir backend Python, ele vive em `recipes/` ou serviço separado documentado em novo ADR.
Rollback: remover a regra de lint; sem impacto em runtime.
Responsável e aprovação: Claude (proposta); aprovação humana no gate da fase 00.
