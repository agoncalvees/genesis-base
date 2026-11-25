# ADR 0004 — Orquestração de agentes fora do runtime
Status: aceito (aprovação humana em 2026-11-24)
Data: 2026-11-24
Contexto e restrições: desenvolvimento usa Claude Code, Codex e OpenCode coordenados pelo Orca. Princípio: nenhuma dependência de orquestração no runtime do Genesis.
Alternativas consideradas: (a) scripts/pacotes de orquestração no repo; (b) usar exclusivamente `orca orchestration` (ferramenta externa) + documentos/checkpoints em Markdown.
Decisão e justificativa: (b). O repositório guarda apenas políticas (`docs/engineering/ORCHESTRATION.md`, `MODEL-ROUTING.md`), specs e checkpoints. Nada em `package.json` relacionado a agentes.
Evidência: `orca orchestration --help` (Orca 1.4.272); Run `run_738dcd161d50` executado na fase 00 com workers reais.
Consequências e riscos: dependência de ferramenta local do desenvolvedor; mitigada pelo fallback manual (specs autocontidas). Checkpoints em `docs/` não devem ir para a submissão do hackathon se o regulamento vetar material prévio.
Rollback: distribuição manual das specs.
Responsável e aprovação: Claude; aprovação humana.
