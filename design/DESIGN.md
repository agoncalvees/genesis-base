---
version: alpha
name: Genesis Neutral
description: Identidade neutra da fundação Genesis.
colors:
  background: "#ffffff"
  surface: "#f7f7f8"
  surface-raised: "#ffffff"
  foreground: "#18181b"
  muted: "#52525b"
  border: "#d4d4d8"
  primary: "#27272a"
  on-primary: "#ffffff"
  accent: "#3f3f46"
  on-accent: "#ffffff"
  focus: "#1d4ed8"
  success: "#15803d"
  on-success: "#ffffff"
  warning: "#a16207"
  on-warning: "#ffffff"
  danger: "#b91c1c"
  on-danger: "#ffffff"
  info: "#1d4ed8"
  on-info: "#ffffff"
  control-border: "#52525b"
  data-1: "#1d4ed8"
  data-2: "#15803d"
  data-3: "#b91c1c"
  data-4: "#a16207"
  data-5: "#7e22ce"
  data-6: "#0e7490"
  data-grid: "#d4d4d8"
  data-axis: "#52525b"
typography:
  display:
    fontFamily: system-ui, -apple-system, "Segoe UI", sans-serif
    fontWeight: 600
    letterSpacing: -0.025em
  headline:
    fontWeight: 600
  body:
    fontFamily: system-ui, -apple-system, "Segoe UI", sans-serif
    fontSize: 1rem
  label:
    fontWeight: 500
  mono:
    fontFamily: ui-monospace, "SF Mono", Menlo, Consolas, monospace
rounded:
  sm: 0.25rem
  md: 0.5rem
  lg: 0.75rem
  control: "{rounded.md}"
spacing:
  unit: 0.25rem
  control: 2.5rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
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
    textColor: "{colors.muted}"
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
  chart-series-2:
    backgroundColor: "{colors.data-2}"
  chart-series-3:
    backgroundColor: "{colors.data-3}"
  chart-series-4:
    backgroundColor: "{colors.data-4}"
  chart-series-5:
    backgroundColor: "{colors.data-5}"
  chart-series-6:
    backgroundColor: "{colors.data-6}"
motion:
  instant: {duration: 100ms, timingFunction: "cubic-bezier(0.2, 0, 0, 1)", delay: 0ms}
  fast: {duration: 150ms, timingFunction: "cubic-bezier(0.3, 0, 1, 1)", delay: 0ms}
  normal: {duration: 250ms, timingFunction: "cubic-bezier(0.2, 0, 0, 1)", delay: 0ms}
  slow: {duration: 400ms, timingFunction: "cubic-bezier(0, 0, 0, 1)", delay: 0ms}
  showcase: {duration: 600ms, timingFunction: "cubic-bezier(0, 0, 0, 1)", delay: 0ms}
genesis:
  density: 1
  borderWidth: 1px
  surfaceStyle: border
  iconWeight: regular
  typeScale: 1
  displayWeight: 600
  displayTracking: -0.025em
  composition: neutral
  dialogScrim: "#18181b73"
  shadows:
    sm: 0 1px 2px rgb(0 0 0 / 0.06)
    md: 0 4px 12px rgb(0 0 0 / 0.08)
    lg: 0 12px 32px rgb(0 0 0 / 0.12)
  motionProfile:
    name: crisp
    intensity: 1
    scale: 1
    spring: { stiffness: 300, damping: 30, mass: 1 }
  data:
    data-1: "#1d4ed8"
    data-2: "#15803d"
    data-3: "#b91c1c"
    data-4: "#a16207"
    data-5: "#7e22ce"
    data-6: "#0e7490"
    data-grid: "#d4d4d8"
    data-axis: "#52525b"
  darkData:
    data-1: "#60a5fa"
    data-2: "#4ade80"
    data-3: "#f87171"
    data-4: "#facc15"
    data-5: "#c084fc"
    data-6: "#22d3ee"
    data-grid: "#3f3f46"
    data-axis: "#a1a1aa"
  darkColors:
    background: "#0b0b0c"
    surface: "#18181b"
    surface-raised: "#222225"
    foreground: "#fafafa"
    muted: "#a1a1aa"
    border: "#3f3f46"
    primary: "#fafafa"
    on-primary: "#18181b"
    accent: "#d4d4d8"
    on-accent: "#18181b"
    focus: "#60a5fa"
    success: "#4ade80"
    on-success: "#0b0b0c"
    warning: "#facc15"
    on-warning: "#0b0b0c"
    danger: "#f87171"
    on-danger: "#0b0b0c"
    info: "#60a5fa"
    on-info: "#0b0b0c"
    control-border: "#a1a1aa"
---

# Genesis Neutral

## Overview

Identidade neutra para a fundação Genesis e para as demonstrações do sistema de design.

## Colors

Superfícies em cinza neutro, foco azul e cores de estado reservadas a mensagens com significado. A borda de controles usa o contraste do texto secundário. A paleta categórica deve vir acompanhada de rótulos ou padrões.

## Typography

A fonte do sistema dá continuidade à plataforma. Use a família monoespaçada em trechos de código.

## Layout

A unidade de espaço é 4 px com densidade padrão. Espaço e altura dos controles usam a mesma configuração de densidade.

## Elevation & Depth

Bordas discretas delimitam os cartões. A sombra fica mais visível em camadas flutuantes.

## Shapes

Controles têm cantos moderadamente arredondados. Painéis usam o próximo tamanho da escala.

## Components

A ação primária usa fundo escuro e texto claro no modo claro. No modo escuro, os valores se invertem. O scrim escurece o fundo nos dois modos.

## Do's and Don'ts

- Preserve o foco visível e os estados com texto.
- Respeite a preferência de movimento reduzido.
