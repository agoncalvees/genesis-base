# ADR 0005 — Design system por tokens semânticos sem identidade final
Status: aceito (aprovação humana em 2026-11-24)
Data: 2026-11-24
Contexto e restrições: DESIGN-SYSTEM.md e FIGMA-WORKFLOW.md: identidade visual só após o tema; Robin é referência de acabamento, não de marca; Tailwind v4 + Base UI sem estilo.
Alternativas consideradas: (a) tema pronto de biblioteca (shadcn etc.); (b) tokens CSS custom properties consumidos via `@theme` do Tailwind v4; (c) CSS-in-JS.
Decisão e justificativa: (b). Dois níveis: `tokens/base.css` (escala 4px, raios, durações de motion 100/150/250/400/600 ms, easing) neutro; `themes/product.css` (cores semânticas, fontes display/body/mono) preenchido no Creative Sprint. Componentes só referenciam tokens semânticos. Resolve a referência indefinida a `product.css` em FIGMA-WORKFLOW.md. Fonte de sistema como fallback de desenvolvimento.
Evidência: sintaxe `@theme` do Tailwind v4 a confirmar com a versão fixada em P00-CDX-01.
Consequências e riscos: sem visual "bonito" antes do tema — aceito. Contraste AA verificado por teste por par on-color quando `product.css` for preenchido.
Rollback: tokens são CSS puro; migráveis.
Responsável e aprovação: Claude; aprovação humana.
