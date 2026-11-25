# Motion

Movimento é linguagem: cada animação precisa responder "o que mudou, de onde veio, para onde foi". Se a resposta for "nada, é enfeite", remova. A animação principal de uma experiência é a do **mecanismo**; a interface ao redor fica quase parada.

## Por intenção

| Comunicar | Técnica | Referência de timing |
|---|---|---|
| Mudança de estado de um controle | transição CSS de cor/transform, sem atraso | 120–180 ms, `--ease-standard` |
| Feedback de interação direta (arrastar, girar, desenhar) | seguir o ponteiro 1:1; spring só na soltura | spring rígido (stiffness 400–600, damping 30–40) |
| Continuidade espacial (item vira detalhe, seleção move) | `layoutId`/`layout` do Motion, View Transitions | 250–400 ms |
| Relação entre informações | linha/traço desenhado entre origem e destino (`pathLength`), destaque cruzado em hover | 300–500 ms |
| Transformação de dados | interpolar valores (não reposicionar DOM): barras crescem do valor anterior, números rolam, cores fluem na rampa | 400–600 ms |
| Processamento | o próprio mecanismo em ação (passos da simulação, partículas, frente de propagação) ou progresso medido; nunca spinner genérico quando o processo é visualizável | contínuo, ligado ao dado |
| Hierarquia na entrada | **um** gesto de revelação para o protagonista (máscara/clip-path, escala do título); o resto aparece já pronto | ≤ 600 ms total |
| Resultado | máscara revelando a comparação, contagem até o valor, marca de destaque que se desenha | 500–800 ms, uma vez |

## Regras

- Fade-in e stagger não são padrão. `FadeIn`/`StaggerGroup` existem para listas que realmente chegam aos poucos (ex.: resultados em streaming).
- Anime `transform`, `opacity`, `clip-path`, `filter` leve; layout só via FLIP (Motion). Canvas/WebGL para muitos elementos.
- Interrompível: uma nova interação cancela a anterior sem salto. Nenhuma animação bloqueia clique.
- Interação ≤ 400 ms; revelação de apresentação ≤ 600 ms (validado pelo motor nos tokens).
- `prefers-reduced-motion: reduce`: sem deslocamento, sem loops decorativos; simulações avançam em passos discretos ou mostram o estado final, com o mesmo resultado. Estado nunca depende de animação.
- Progresso reflete medida real; desconhecido = indeterminado.
- Meça: 60 fps no Chromium com 4× CPU throttle para a animação principal; se cair, reduza resolução do canvas ou passos por quadro antes de cortar o efeito.

## No Genesis

Tokens `--duration-*`, `--ease-*`, `--spring-*` e perfis `still|calm|crisp|lively` vêm do DESIGN.md (`motion/presets.ts`). `AnimatedNumber`, `AnimatedTabsIndicator` e `Expandable` são primitivas confiáveis. Para o resto, use Motion diretamente — ver [Experience Registry](EXPERIENCES.md).
