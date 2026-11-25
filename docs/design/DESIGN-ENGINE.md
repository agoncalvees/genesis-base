# Design engine — contrato (P09)

Decisão: ADR 0006. Regras permanentes: `VISUAL-ENGINEERING.md`. Este documento é o contrato entre DESIGN.md, gerador, componentes e mundos.

## Arquivos
```
design/
  DESIGN.md                    # identidade ativa do produto (hoje: Genesis Neutral)
  examples/<id>/DESIGN.md      # identidades de referência (ex.: aceiro), aplicáveis com design:apply example/<id>
  imports/<nome>/              # quarentena de DESIGN.md externos (gitignored exceto README)
tools/design-engine/           # adaptador + normalizador + gerador (build-time; nunca importado por src/)
src/design-system/themes/generated/
  product.css                  # :root ← design/DESIGN.md
  worlds.css, worlds.ts        # vazios na Base; usados só se design/worlds/ existir
```
Scripts: `design:lint`, `design:build`, `design:check` (drift, CI), `design:diff <a> <b>`, `design:import <arquivo|url>`, `design:apply <id|import>`.

`design/DESIGN.md` mostra a estrutura completa aceita pela versão 0.4.0 do motor. `design:apply example/<id>` aplica um exemplo. `design:import <arquivo|url> [nome]` guarda a referência em quarentena mesmo quando a validação encontra erros. Para promover uma importação válida, use `design:apply import/<nome>`. O comando atualiza a identidade ativa e o CSS gerado.

## Contrato semântico (saída do normalizador)
Toda identidade precisa produzir **todas** estas variáveis, para claro e, se declarado, escuro:

| Grupo | Variáveis CSS |
|---|---|
| Superfícies | `--background --surface --surface-raised --border --control-border` |
| Texto | `--foreground --muted` |
| Ação | `--primary --on-primary --accent --on-accent --focus` |
| Estado | `--success/--on-success --warning/--on-warning --danger/--on-danger --info/--on-info` |
| Dados | `--data-1 … --data-6`, `--data-grid`, `--data-axis` |
| Tipografia | `--typeface-display --typeface-body --typeface-mono`, `--display-weight`, `--display-tracking`, `--heading-weight`, `--section-heading-*`, `--type-scale` (razão), `--text-base` |
| Geometria | `--radius-sm --radius-md --radius-lg --radius-control` (forma de botão/input), `--border-width` |
| Densidade | `--density` (0.75 compacto · 1 padrão · 1.25 amplo), `--control-height`, `--space-unit` |
| Superfície | `--surface-style` (`border` · `elevation` · `tint`), `--shadow-sm/md/lg`, `--dialog-scrim` |
| Motion | `--duration-*` e `--delay-*` (escalados pelo perfil), `--ease-standard/enter/exit`, `--motion-intensity` (0–1), spring (`--spring-stiffness`, `--spring-damping`, `--spring-mass`) |
| Ícones | `--icon-weight` (Phosphor: thin/light/regular/bold) |

Mapeamento a partir da spec do Google: `colors.*` → superfícies/texto/ação/estado por nome canônico (`primary`, `on-primary`, `surface`, …; nomes ausentes → erro, não autogeração); `typography.display|headline|body|label|mono` → tipografia; `rounded` → geometria; `spacing` → escala; `motion` → durações/easing. Chave de extensão **`genesis:`** carrega: `density`, `surfaceStyle`, `iconWeight`, `typeScale`, `displayWeight`, `displayTracking`, `motionProfile` (`still|calm|crisp|lively` + spring), `data` (paleta categórica), `composition`, `darkColors` (variante escura).

Declare `motion.instant|fast|normal|slow|showcase` com `duration`, `timingFunction` e `delay`. O motor multiplica duração e atraso por `genesis.motionProfile.scale` e limita a soma a 400 ms nas interações e 600 ms nas revelações. `normal`, `showcase` e `fast` fornecem as curvas semânticas padrão, de entrada e de saída, respectivamente. O lint do Google 0.4.0 verifica cores, tipografia e componentes e sinaliza `motion` e `genesis` como extensões fora de seu exportador.

Use `rounded.sm|md|lg|control` e `spacing.unit|control` em px ou rem. `genesis.darkColors` exige todas as cores semânticas quando declarado. `genesis.darkData` permite uma paleta de dados escura independente. `genesis.metricTypeface: mono` escolhe a família monoespaçada para métricas.

O eixo opcional `genesis.sectionHeading` define tamanho mínimo, escala fluida em unidades de largura do contêiner (`fluid`), tamanho máximo, peso e tracking para títulos de seção. A manchete segue os tokens de display.

A validação rejeita identidades que falham nos pares de `VISUAL-ENGINEERING.md` ou usam fontes fora do registro licenciado em `tools/design-engine/fonts.ts`. As seis séries precisam de contraste ≥ 3:1 contra `--surface` e distância ΔE OK ≥ 0,07 entre si, calculada em OKLab na escala 0–1. `--control-border` passa pelo contraste de controles e `--border` fica disponível para divisores decorativos.

Aplique `data-world="<id>"` a um elemento para escopar a identidade. `data-theme="light|dark"` pode ficar no escopo ou em um descendente. Dialog, Popover, Select, Tooltip e Toast buscam o contêiner temático ancestral para manter os tokens nos portais.

## Fontes

Famílias aceitas estão em `tools/design-engine/fonts.ts` (pacote e licença). A Base não instala fontes: ao escolher uma família registrada, `design:build` pede `bun add <pacote>` se faltar. Para uma família nova, registre pacote, licença OFL/Apache e arquivos CSS.
