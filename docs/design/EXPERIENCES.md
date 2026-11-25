# Experience Registry

Onde procurar antes de escrever do zero. Organizado por **mecanismo a comunicar**, não por tipo de componente. Nada aqui é obrigatório: se uma implementação própria servir melhor à direção, use-a. Todas as versões e licenças abaixo foram conferidas no npm/GitHub em 24/11/2026; confira de novo antes de instalar e registre a dependência no produto, não na fundação.

## Por mecanismo

| Para mostrar… | Recurso preferido | Alternativa | Genesis |
|---|---|---|---|
| Simulação, autômato, partículas, campo | Canvas 2D próprio + `requestAnimationFrame` (camada de dados separada da de pintura). Pinte a grade em canvas na resolução do modelo e amplie com suavização + passe de brilho desfocado; traços do usuário como caminho contínuo, rasterizado só para o modelo. Blocos de pixel só se a direção pedir | OGL (Unlicense) / three 0.187 (MIT) para GPU | — |
| Rede, grafo, relações | `d3-force` 3 (ISC) com render próprio em SVG/Canvas | `@xyflow/react` 13 (MIT) quando o usuário edita nós | — |
| Mapa geográfico real | `maplibre-gl` 6 (BSD-3) com estilo próprio | `d3-geo` 3 (ISC) para cartogramas/projeções em SVG | — |
| Território/diagrama ilustrado e selecionável | SVG autoral com regiões focáveis + legenda por faixas | Imagem gerada como base + máscara/grade de dados | — |
| Série temporal, distribuição, comparação de barras | Módulo `dataviz` (tabela acessível, `maxValue`, locale; `--with dataviz`) | `d3-shape`/`@visx/shape` 4 (MIT) para formas sob medida; ECharts 6 (Apache-2.0) para volume | `src/design-system/dataviz` |
| Antes/depois, contrafactual | Máscara `clip-path` arrastável sobre o mesmo quadro | Lado a lado sincronizado | `CompareMask` (headless, teclado, `--compare`) |
| Número que muda | `AnimatedNumber` (pt-BR, reduced motion) | `@number-flow/react` 0.6 (MIT) para rolagem por dígito | `src/design-system/motion` |
| Traço desenhado à mão, anotação | `perfect-freehand` 1.2 (MIT) | `roughjs` 4.6 (MIT) para estilo esboço | — |
| Transições de layout, elemento compartilhado, springs, gestos | Motion 14 (MIT, já instalado): `layout`, `layoutId`, `AnimatePresence`, `useSpring`, `drag` | View Transitions API nativa | presets/perfis em `motion/presets.ts` |
| Linha do tempo coreografada, SVG morph, scroll narrativo | GSAP 3.15 (licença própria "standard no-charge": gratuita, não OSI) | Motion `useScroll` + `useTransform` | — |
| Ruído orgânico, terreno procedural, textura | `simplex-noise` 4 (MIT) | Shader OGL | — |
| Cor perceptual, rampas | `culori` 4 (MIT) | OKLCH em CSS | motor valida contraste |
| Processamento em etapas observáveis | O próprio mecanismo em ação + `Progress` medido | Indicador próprio | `Progress` |
| Diálogo, popover, select, tabs, toast acessíveis | Primitivas Genesis (Base UI) | Base UI direto | `src/design-system/primitives`, `components` |

## Bibliotecas de componentes animados (copiar para o produto)

| Fonte | Modelo | Licença verificada | Regra |
|---|---|---|---|
| Motion Primitives | copiar/registry shadcn | MIT | Livre no produto |
| Magic UI | copiar/registry shadcn | MIT (Pro pago à parte — não usar) | Livre no produto |
| React Bits | registry shadcn (`@react-bits/...`) ou cópia | **MIT + Commons Clause** | Usar dentro do produto; **não** redistribuir na fundação nem como pacote |
| Animate UI | CLI npm | **MIT + Commons Clause** | Idem |
| Aceternity UI | copiar/CLI | Licença própria; gratuitos "para qualquer projeto React/Next" | Usar no produto com nota de origem; nunca Pro |

Use-as como ponto de partida de **comportamento** (física, timing, máscara), reestilizando com os tokens do produto. Efeitos de vitrine (spotlight, beams, meteors, marquee de logos, cards 3D com tilt) só entram se comunicarem o mecanismo. Registre origem e licença em `PROVENANCE.md` do produto.

## Primitivas Genesis que valem a pena

Comportamento confiável e testado — use quando o caso couber, estilize livremente:
`Button` (hidratação), `CompareMask`, `Field`, `Dialog`/`Popover`/`Tooltip`/`Select` (portais com tema), `Tabs`, `Toast`, `AnimatedNumber`, dataviz com tabela acessível, `useHydrated`, `ResizablePanels`.

Módulos opcionais (`bun run new -- --with ...`): `ai` (IA server-only, `PromptComposer`, `StreamingText`, `Citation`, `AiStatus`), `dataviz` (gráficos acessíveis). Importe por caminho.

## Promover para a fundação

Só quando: (1) foi usado em um produto real, (2) tem outro uso plausível fora do domínio, (3) não carrega texto, cor ou fonte fixos, (4) tem teste de teclado e reduced motion. Caso contrário fica no produto.
