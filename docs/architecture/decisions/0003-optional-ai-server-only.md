# ADR 0003 — IA opcional, server-only e removível
Status: aceito (aprovação humana em 2026-11-24)
Data: 2026-11-24
Contexto e restrições: INTELLIGENCE.md e BLUEPRINT exigem que a aplicação inicie sem chave de IA, segredos nunca no cliente, OpenRouter via AI SDK como primeira integração.
Alternativas consideradas: (a) chamadas diretas do cliente; (b) server functions/rotas de servidor do TanStack Start; (c) Convex actions como único caminho de IA.
Decisão e justificativa: (b) como padrão; (c) apenas quando o resultado precisa ser persistido/reativo no Convex. Um único adaptador em `src/ai/` lê `OPENROUTER_API_KEY`, `AI_MODEL_PRIMARY`, `AI_MODEL_FALLBACK` (nomes sujeitos à verificação de P00-CDX-01), expõe estado `unavailable` explícito quando ausentes, e aplica timeout, AbortSignal, limite de tokens e orçamento por execução. Fallback de modelo só é ativado após teste real (fase 04).
Evidência: pendente da matriz de compatibilidade (`docs/engineering/phase-00/compat-matrix.md`); teste de "nenhum segredo no bundle" definido em `test-strategy.md`.
Consequências e riscos: provider OpenRouter é comunitário — risco de quebra em upgrade do AI SDK; fixar versões juntas.
Rollback: remover `src/ai/` e as rotas que o importam; UI continua funcional em modo indisponível.
Responsável e aprovação: Claude; aprovação humana para qualquer gasto de crédito de API.
