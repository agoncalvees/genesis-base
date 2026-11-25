---
version: alpha
name: Aceiro
description: Carta de campo ao entardecer. Um mapa ilustrado do Cerrado em que o fogo é a única luz, ao lado de um caderno de instrumentos em giz sobre carvão.
colors:
  background: "#15110e"
  surface: "#1c1713"
  surface-raised: "#251f1a"
  foreground: "#efe6d2"
  muted: "#b5a78f"
  border: "#3d352e"
  primary: "#ff5a1f"
  on-primary: "#15110e"
  accent: "#e8b04a"
  on-accent: "#15110e"
  focus: "#f6efe0"
  success: "#9cbf7a"
  on-success: "#15110e"
  warning: "#ffb347"
  on-warning: "#15110e"
  danger: "#ff8a6b"
  on-danger: "#15110e"
  info: "#8fc3c0"
  on-info: "#15110e"
  control-border: "#8c7d68"
  data-1: "#ff5a1f"
  data-2: "#efe6d2"
  data-3: "#9cbf7a"
  data-4: "#e8b04a"
  data-5: "#8fc3c0"
  data-6: "#c99be0"
  data-grid: "#3d352e"
  data-axis: "#b5a78f"
typography:
  display:
    fontFamily: '"Instrument Serif", Georgia, serif'
    fontWeight: 400
    letterSpacing: -0.02em
  headline:
    fontWeight: 400
  body:
    fontFamily: '"Archivo Variable", system-ui, sans-serif'
    fontSize: 1rem
  label:
    fontWeight: 600
  mono:
    fontFamily: '"JetBrains Mono Variable", monospace'
rounded:
  sm: 2px
  md: 3px
  lg: 4px
  control: 3px
spacing:
  unit: 0.25rem
  control: 44px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-primary-hover:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
  button-ghost-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
  card-divider:
    backgroundColor: "{colors.border}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  input-outline:
    backgroundColor: "{colors.control-border}"
  badge-neutral:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  focus-ring:
    backgroundColor: "{colors.focus}"
  chart:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.data-axis}"
  chart-grid:
    backgroundColor: "{colors.data-grid}"
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
  alert-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
  badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
  alert-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
  badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
  alert-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
  badge-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.on-info}"
  alert-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.on-info}"
  chart-series-1:
    backgroundColor: "{colors.data-1}"
motion:
  instant: {duration: 90ms, timingFunction: "cubic-bezier(0.2, 0, 0, 1)", delay: 0ms}
  fast: {duration: 140ms, timingFunction: "cubic-bezier(0.4, 0, 1, 1)", delay: 0ms}
  normal: {duration: 220ms, timingFunction: "cubic-bezier(0.2, 0, 0, 1)", delay: 0ms}
  slow: {duration: 320ms, timingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", delay: 0ms}
  showcase: {duration: 560ms, timingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", delay: 0ms}
genesis:
  density: 1
  borderWidth: 1px
  surfaceStyle: border
  iconWeight: light
  metricTypeface: mono
  typeScale: 1.2
  displayWeight: 400
  displayTracking: -0.02em
  sectionHeading: { size: 0.75rem, fluid: 0.9, maxSize: 0.8125rem, weight: 650, tracking: 0.08em }
  composition: immersive
  dialogScrim: "#0a0807cc"
  shadows:
    sm: 0 0 0 transparent
    md: 0 0 0 transparent
    lg: 0 24px 48px rgb(0 0 0 / 0.45)
  motionProfile:
    name: crisp
    intensity: 0.8
    scale: 1
    spring: { stiffness: 520, damping: 38, mass: 0.8 }
  data:
    data-1: "#ff5a1f"
    data-2: "#efe6d2"
    data-3: "#9cbf7a"
    data-4: "#e8b04a"
    data-5: "#8fc3c0"
    data-6: "#c99be0"
    data-grid: "#3d352e"
    data-axis: "#b5a78f"
---

# Aceiro

## Direção
- Metáfora: **carta de campo ao entardecer** — o caderno de um brigadista aberto sobre uma carta topográfica do Cerrado, na estação seca. O fogo é a única fonte de luz da tela.
- Atributos: preciso, tátil, sóbrio. Antiatributos: alarmista, gamificado, painel administrativo.
- Mecanismo em tela: o usuário vê **vento, umidade e combustível transformarem um foco em uma cicatriz de queimada**, e vê **o aceiro que ele desenhou mudar essa cicatriz** — comparado com o mesmo foco sem aceiro (mesma semente).
- Referências:
  - Cartas topográficas impressas (IBGE/DSG) → linhas de construção finas, anotações pequenas em versalete, hachura como linguagem de área. Aplicar: área queimada hachurada, rótulos de eixo/anotações do mapa.
  - Gravura em metal botânica (pranchas de naturalistas) → traço creme fino sobre fundo escuro, densidade de linha em vez de sombra. Aplicar: espécime, ícones de ferramenta em traço, regras horizontais.
  - Infografia de incêndios de grandes redações (frente de fogo por hora) → camadas temporais, anotação direta sobre o mapa, uma única cor quente. Aplicar: frente luminosa, marcas de hora simulada, comparação contrafactual sobre o próprio mapa.

## Composição
- Desktop (≥ 1024 px): **mapa sangrando à esquerda, 68 % da largura e 100 % da altura da janela** (sem moldura, sem raio). Coluna de instrumentos à direita, 32 %, fundo `background`, com régua vertical de 1 px `border` separando.
- Título de exibição **sobreposto ao mapa** no canto superior esquerdo, sobre um véu escuro radial muito suave apenas atrás do texto (não um card).
- O mapa mantém proporção 4:3 do terreno com `object-fit: cover`; a grade de simulação acompanha a imagem (mesmo recorte).
- Instrumentos em sequência vertical: cabeçalho (eyebrow + subtítulo) → vento | umidade lado a lado → ferramentas → ação "Acender foco" → leituras queimada/preservada → espécime + nota editorial no rodapé da coluna.
- Quebras permitidas: título invade o mapa; marcador de comparação (alça vertical) atravessa o mapa de cima a baixo; anotações em giz sobre o mapa.
- Mobile (< 768 px): título acima do mapa sobre `background`; mapa em largura total 4:3; instrumentos abaixo; barra fixa inferior com ferramentas + "Acender". Nada de gaveta escondendo o mecanismo.
- Tablet (768–1023): mapa em cima, largura total; instrumentos em duas colunas abaixo.

## Ritmo, proporção e escala
- Unidade 4 px; coluna de instrumentos com padding 32 px (desktop), 20 px (mobile); blocos separados por regra 1 px `border` + 24 px.
- Escala: exibição `clamp(3rem, 6.2vw, 6.5rem)` line-height 0.92; subtítulo 15 px itálico serifado; rótulos 12–13 px versalete (`text-transform: uppercase`, tracking 0.08em, Archivo condensado `font-stretch: 75%`, peso 650); corpo 15 px; leituras numéricas 28–34 px mono tabular; microanotações do mapa 11 px mono.
- Proporção dominante 2:1 (mapa : instrumentos).

## Tipografia
- Exibição: Instrument Serif 400; a palavra-sinal ("vento") em itálico na cor `--ember`. Nunca negrito na serifa.
- Corpo e rótulos: Archivo Variable; rótulos e botões em largura condensada (`font-stretch: 75%`) e caixa alta.
- Leituras: JetBrains Mono, `font-variant-numeric: tabular-nums`, unidade em tamanho menor e `muted` ("ha", "%", "km/h").
- Números em pt-BR (vírgula decimal, ponto de milhar).

## Cor e materiais
- Material dominante: carvão quente (`background`) com grão de papel sutil (ruído SVG `feTurbulence` em 4–6 % de opacidade, estático); giz (`foreground`) para traço e texto.
- Tokens do produto (definir em CSS em `:root`):
  - `--ember: #ff5a1f` (frente de fogo, palavra-sinal, ação Acender) · `--ember-hot: #ffb347` (núcleo da chama, brilho) · `--ash: #3a332e` (área queimada) · `--chalk: #efe6d2` (aceiro, anotações) · `--vereda: #2f5552` (água) · `--hatch: rgb(239 230 210 / 0.18)` (hachura).
- Cor de sinal: `--ember` **somente** para fogo, a palavra-sinal do título e a ação de ignição. Nada decorativo em laranja.
- Escala de risco (inspetor de célula): sequencial `#3d352e → #8c6a3a → #e8b04a → #ff5a1f`.

## Profundidade
- Camadas: terreno (imagem) → cicatriz (cinza `--ash` com hachura diagonal de 45° em giz a 18 %) → aceiros (traço de giz com borda irregular) → fogo (aditivo, brilho `--ember-hot` com `globalCompositeOperation: lighter`) → anotações → controles. Sem sombras em painéis; separação só por régua e luz do fogo.

## Densidade
- Média-baixa: público geral e brigadistas em formação. Máximo 35 palavras por bloco de texto. Cada instrumento tem rótulo + uma linha de instrução.

## Recursos gráficos
- `public/art/terrain.webp` — mapa base **e fonte de dados**: a cor de cada célula define o combustível (água/mata úmida, cerrado arbustivo, campo seco, rocha/estrada).
- `public/art/specimen.webp` — pequizeiro rebrotando, rodapé da coluna, com legenda editorial.
- `design/concept.webp` — conceito de referência (não usar na interface).
- Ícones de ferramenta: Phosphor `light`, ou traço SVG próprio. Sem emoji.

## Narrativa
- Primeiros 5 s: título "O fogo lê o **vento**." sobre o mapa; partículas de vento cruzando o campo na direção atual; três anotações em giz numeradas sobre o mapa: "1 Trace um aceiro", "2 Marque o foco", "3 Acenda".
- Fluxo: desenhar aceiro(s) → marcar foco(s) (máx. 3) → ajustar vento/umidade → Acender → frente avança (hora simulada no canto do mapa) → resultado com comparação.
- **Momento-assinatura**: ao terminar, uma alça vertical aparece no meio do mapa; arrastá-la revela, de um lado, a cicatriz **sem aceiros** e, do outro, **com aceiros** (mesma semente). A leitura "Área preservada" conta até o valor.

## Comportamento e motion
- Vazio: anotações de instrução; botão Acender desabilitado com motivo textual se não houver foco.
- Executando: o fogo é a animação principal (células acesas cintilam; a frente avança em passos de simulação, ~12 passos/s). Controles de vento/umidade continuam ajustáveis e afetam o próximo passo. Botão vira "Pausar"; "Recomeçar" disponível.
- Resultado: máscara de comparação entra com `clip-path` de 0 → 50 % (560 ms, `--ease-enter`); leituras rolam até o valor.
- Desatualizado: alterar aceiro, foco, vento ou umidade após o resultado marca as leituras com "desatualizado" e esmaece a comparação, sem apagá-la.
- Erro: sem foco → mensagem inline em giz junto ao botão.
- Vento: rosa dos ventos arrastável (rotação segue o ponteiro 1:1; soltar assenta com spring rígido em múltiplos de 5°); teclado ←/→ 15°, ↑/↓ velocidade 0–40 km/h. Partículas de vento correm na direção e velocidade definidas.
- Umidade: escala vertical 10–80 %, arrastável e por teclado; o líquido da escala transita 220 ms.
- Aceiro: traço segue o ponteiro 1:1, largura constante de 1 célula, giz com bordas levemente irregulares.
- Inspetor: ao passar ou focar uma célula, anotação pequena em mono mostra classe de combustível e probabilidade de ignição atual com o vento.
- Reduced motion: sem partículas de vento (setas estáticas), simulação mostra o resultado final de uma vez (com os mesmos números), comparação aparece em 50 % sem transição, leituras sem contagem.

## Não fazer
- Cards com sombra, cantos arredondados > 4 px, gradientes decorativos, glassmorphism, emoji, ícones coloridos.
- Laranja fora do fogo/ignição. Texto em inglês. Números sem unidade.
- Dizer que o modelo prevê incêndios reais: rotular como **modelo didático**.
