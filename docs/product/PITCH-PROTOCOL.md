# Produto, julgamento e pitch

O jurado não explora o app. Em hackathon, ele decide com o que vê em **3 minutos de pitch** e nos **5 primeiros segundos de tela**. Este protocolo vem **antes** da direção artística: a arte serve à história, não o contrário.

## 1. Dor antes de tudo (passo 0, 10 min)

Preencha `PRODUCT-BRIEF.md` com estas frases. Se alguma não couber em uma linha, o produto ainda não está claro.

| Campo | Formato | Exemplo (ensaio Senha) |
|---|---|---|
| Quem sofre | uma pessoa concreta, com papel e contexto | Coordenadora de atenção básica de um município médio |
| Dor | o que dá errado hoje, com **um número** | A escala de plantões é fixa; enquanto uma UBS tem 2h de fila, a do lado tem médico ocioso |
| Custo da dor | quem perde o quê | Pacientes esperam horas; o município "falta médico" sem faltar |
| Promessa | verbo + resultado mensurável | Redistribuir os mesmos plantões pela demanda prevista e cortar a espera pela metade |
| Prova na tela | o que o jurado **vê** acontecer | Arrastar 2 plantões: 1h03 → 21 min, sem contratar ninguém |
| Por que agora / por que nós | o mecanismo que torna possível | Simulação de fila com prioridade de risco sobre as chegadas por hora |

**One-liner** (vai no topo do app, no pitch e no README): *"[Produto] ajuda [quem] a [resultado] sem [custo atual]."*

## 2. Critérios de julgamento → evidência

Leia os critérios oficiais (`CHALLENGE.md`). Para cada um, decida **onde** na tela e **em que segundo** do pitch ele é provado. Sem critério oficial, use estes, que cobrem a maioria dos hackathons:

| Critério | O jurado pergunta | Evidência que precisa existir |
|---|---|---|
| Problema e impacto | "Isso dói para alguém de verdade? Para quantos?" | Dor com número na primeira tela; fonte citada ou rotulada como estimativa |
| Solução e inovação | "Por que isso e não uma planilha?" | O mecanismo funcionando na demo; o "antes × depois" |
| Execução técnica | "Funciona ou é slide?" | Demo ao vivo do fluxo principal; nada de tela estática |
| Experiência e design | "Alguém usaria sem treinamento?" | Primeira tela autoexplicativa; ação principal óbvia |
| Viabilidade / negócio | "Quem paga, quem adota, o que falta?" | Um slide final ou bloco "Próximos passos" no app |
| Uso de IA / tecnologia exigida | "A tecnologia é essencial ou enfeite?" | O ponto da demo em que a tecnologia decide algo |
| Pitch | "Entendi em 3 minutos?" | Roteiro cronometrado (`DEMO-SCRIPT.md`) e modo demonstração |

## 3. Estrutura obrigatória do app

A experiência pode ser tão original quanto a direção pedir, mas precisa conter estas camadas, nesta ordem de leitura:

1. **Abertura (primeira tela, sem rolar, em 360 e 1440 px):** one-liner, a dor com número e **uma** ação principal, que é o botão "Ver demonstração" ou a própria interação. Marque com `data-story="problem"`, `data-story="promise"` e `data-story="action"`; o `design:verify` confere se estão visíveis na primeira dobra.
2. **Demonstração guiada (≤ 60 s):** `PitchTour` da Base, com 3 a 5 passos que contam dor → mecanismo → resultado e executam a interação sozinhos. Abre com `?demo=1`, para o apresentador ou o jurado.
3. **Momento-assinatura:** o antes × depois com número grande.
4. **Como funciona:** uma frase e um diagrama do mecanismo; limites honestos (dados fictícios, modelo didático).
5. **Exploração livre:** o resto do app, para quem quiser fuçar.

Se o tempo apertar, corte a exploração livre, nunca as camadas 1 a 3.

## 4. Pitch de 3 minutos

| Tempo | Bloco | Na tela |
|---|---|---|
| 0:00–0:20 | **Dor**: uma pessoa, uma cena, um número | Abertura do app |
| 0:20–0:35 | **Promessa**: o one-liner | Mesma tela; aponte para a ação |
| 0:35–1:50 | **Demo**: o `PitchTour` ao vivo, um único caminho, sem desvios | `?demo=1` |
| 1:50–2:20 | **Como funciona e por que é difícil**: o mecanismo e a tecnologia exigida | Bloco "Como funciona" |
| 2:20–2:45 | **Impacto e viabilidade**: quem adota, quanto economiza, próximo passo | Bloco final ou slide |
| 2:45–3:00 | **Fecho**: repita o número do antes × depois | Momento-assinatura |

Regras: nada de login, de carregamento real sem plano B nem de dado que pode falhar ao vivo. Ensaie três vezes cronometrando. Grave um vídeo de 60 s da demo como plano B.

## 5. Teste dos 5 segundos (antes de entregar)

Mostre a primeira tela por 5 segundos a alguém (ou a um agente sem contexto, só com a captura) e pergunte: *para quem é, qual a dor, o que eu faço agora?* Se uma das três respostas falhar, reescreva a abertura antes de polir qualquer outra coisa.
