# Componentes da Base

A direção artística escolhe os componentes. Estas peças garantem **comportamento** (teclado, foco, portais com tema, hidratação); aparência e composição são do produto. Para visualizações, simulações, redes, mapas e motion avançado, consulte o [Experience Registry](EXPERIENCES.md). Importe de `src/design-system` ou pelo caminho do arquivo.

| Necessidade | Peças | Notas |
|---|---|---|
| Ação | [Button, IconButton](../../src/design-system/primitives/button.tsx) | `Button` pode ficar desabilitado até a hidratação (`useHydrated`). |
| Formulário | [Field, Input, Textarea](../../src/design-system/primitives/field.tsx), [Select](../../src/design-system/primitives/select.tsx), [Checkbox, Switch](../../src/design-system/primitives/toggles.tsx), [FileDrop](../../src/design-system/patterns/file-drop.tsx) | `Field` liga rótulo, ajuda e erro textual. Controles nativos também servem. |
| Camadas | [Dialog, Popover, Tooltip](../../src/design-system/components/overlays.tsx), [Toast](../../src/design-system/components/toast.tsx) | Portais herdam o tema do contêiner. Escape fecha e devolve o foco. |
| Navegação local | [Tabs](../../src/design-system/components/tabs.tsx), [AnimatedTabsIndicator](../../src/design-system/motion/animated-tabs-indicator.tsx), [Expandable](../../src/design-system/motion/expandable.tsx) | Setas, Home/End, disclosure nativo. |
| Demonstração para pitch | [PitchTour, usePitchMode](../../src/design-system/patterns/pitch-tour.tsx) | 3–5 passos que executam a demo e destacam o elemento (`target`); teclado e passador de slides (PageDown/PageUp); `?demo=1`; `autoAdvanceMs` para gravação. |
| Comparação | [CompareMask](../../src/design-system/patterns/compare-mask.tsx) | Headless: arrasto direto sobre o conteúdo, teclado, `--compare` para estilizar. |
| Número que muda | [AnimatedNumber](../../src/design-system/motion/animated-number.tsx) | Intl/pt-BR e reduced motion. |
| Estado | [Badge, Progress, Skeleton, Spinner](../../src/design-system/primitives/feedback.tsx) | `Progress` só com medida real; senão indeterminado. |
| Áreas ajustáveis | [ResizablePanels](../../src/design-system/components/resizable-panels.tsx) | Teclado com limites. |
| Texto e estrutura | [Heading, Text, Code](../../src/design-system/primitives/typography.tsx), [Container, Stack, Grid, Card](../../src/design-system/primitives/layout.tsx) | Opcionais; CSS autoral com tokens costuma servir melhor à direção. |

Módulos (`bun run new -- --with ai,dataviz`): `src/design-system/dataviz` (BarChart, LineChart, Sparkline, Legend com tabela acessível) e `src/design-system/patterns/ai-interface.tsx` + `src/ai` (IA server-only).
