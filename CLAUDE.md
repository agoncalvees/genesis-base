# Genesis no Claude Code

@AGENTS.md

`AGENTS.md` é a fonte canônica. Se a importação estiver desabilitada, abra o arquivo. Retome pelo checkpoint mais recente em `docs/STATUS.md`.

## Específico do Claude Code
- **Figma MCP** (conector claude.ai): use `create_new_file`/`use_figma` para compor o conceito e `get_screenshot`/`get_design_context` para ler frames. Carregue a skill `figma-use` antes de `use_figma`. `generate_image`, `generate_vector_illustration` e shaders **consomem créditos de IA do Figma**: só com autorização explícita do responsável.
- **Geração de imagens**: o Claude Code não gera raster nativamente. Caminhos: (1) delegar ao Codex (`image_gen`, incluído no plano) com um brief autocontido (enquadramento, técnica, paleta em hex, proibições, uso); (2) Figma `generate_image` com autorização; (3) sem nenhum dos dois, registre a limitação e use SVG/Canvas autorais — não finja que é ilustração.
- **Navegador**: `bun run design:verify <url>` gera capturas e verifica estilos; use `Read` nas PNGs de `design/evidence/` para inspecionar visualmente. Para interação manual, use Playwright ou o navegador do Orca quando disponível.
- Skills úteis quando instaladas: `frontend-design`/`impeccable` (direção e crítica), `animate`/`choreograph` (motion), `webapp-testing` (Playwright).
