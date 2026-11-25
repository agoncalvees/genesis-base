# Visual engineering — regras permanentes

Valem para **qualquer** identidade (DESIGN.md do produto ou exemplo). Um DESIGN.md não pode relaxá-las; o gerador falha se forem violadas.

## Contraste (WCAG 2.2 AA mínimo)
- Texto normal ≥ 4.5:1: `foreground`/`background|surface|surface-raised`, `muted`/`background|surface`, todo `on-*`/`*`.
- Texto grande e componentes não textuais ≥ 3:1: `focus`/`background|surface`, `border` de controles interativos/`background`, cada `data-n`/`surface`.
- Informação nunca depende só de cor (rótulo, forma ou padrão junto).

## Interação
- Foco visível em todo elemento interativo (`:focus-visible`, anel ≥ 2px, contraste ≥ 3:1). Nunca `outline: none` sem substituto.
- Alvos ≥ 24×24 CSS px (2.5.8); densidade compacta não reduz abaixo disso.
- Teclado completo; ordem de foco = ordem visual; Escape fecha camadas; foco volta ao gatilho.

## Motion
- `prefers-reduced-motion: reduce` zera durações e desliga movimento não essencial; estado nunca depende de animação.
- Animar apenas `opacity`, `transform`, `clip-path`, `filter` leve; layout via técnicas FLIP do Motion. Proibido animar `width/height/top/left` diretamente.
- Nenhuma animação bloqueia clique; durações de interação ≤ 400 ms; revelações de apresentação ≤ 600 ms.
- Progresso reflete medida real; desconhecido = indeterminado.

## Tokens e componentes
- Componentes referenciam só variáveis semânticas e eixos (`DESIGN-ENGINE.md`). Literais de cor, fonte, raio, sombra ou duração em componentes são erro (teste automatizado).
- Temas são escopados (`data-world` / `:root`); nenhum estilo escopado pode afetar elemento fora do seu escopo.
- Fontes: apenas de `tools/design-engine/fonts.ts` (pacote + licença registrados), self-hosted, com fallback de sistema.

## Responsividade e performance
- Sem overflow horizontal em 360 / 768 / 1440 px e zoom 200%.
- Imagens com dimensões e `alt`; SVG informativo com `title`/`desc`.
- Fontes carregadas apenas quando a identidade as usa.

## Direção artística e recursos gerados

Siga o protocolo de 9 passos em [CREATIVE-DIRECTION](CREATIVE-DIRECTION.md) (referências, conceito visual, assets gerados, ferramentas por ambiente) e valide com `bun run design:verify` ([FIDELITY](FIDELITY.md)): estilos computados contra o DESIGN.md, fontes efetivamente carregadas, overflow e capturas 360/768/1440. Inspecione as capturas e compare com o conceito antes de entregar.
