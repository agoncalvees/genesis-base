# Playbook do dia

**Hack IA Brasil** (verificado em hackiabrasil.com em 24/11/2026): sábado 28/11, presencial em João Pessoa (Miramar), das 8h às 18h. O tema é revelado às 09:00 ("Um problema difícil"), o desenvolvimento vai das 09:30 às 16:30 com almoço às 12:30, os pitches começam às 16:30 e o júri às 17:30. São **cerca de 6 horas úteis**. Público de 12 a 25 anos, times de 3 ou 4. O site não publica critérios, duração do pitch, regras de submissão nem regras sobre código prévio ou IA.

**Perguntar à organização às 08:00 e registrar no `CHALLENGE.md`:** critérios e pesos; duração do pitch e se há julgamento assíncrono; formato de entrega (repositório, link, vídeo); **ferramentas obrigatórias** (o hackathon da Cognition em São Paulo só aceitou projetos feitos com Windsurf ou Devin, e a Cognition co-organiza este evento); se código e documentos prévios podem ser usados, ou se o projeto deve começar do zero. Se o código prévio for vedado, a Genesis Base vale como treino e como estes documentos de processo, e o repositório começa vazio.

## Linha do tempo (relógio de parede)

| Hora | Bloco | Saída obrigatória |
|---|---|---|
| 09:00–09:30 | Tema e regras | `CHALLENGE.md` literal, critérios, restrições |
| 09:30–10:00 | **Dor** (método abaixo) | 3 ideias pontuadas → 1 escolhida; one-liner; dor com número |
| 10:00–10:15 | **Pitch primeiro** | `DEMO-SCRIPT.md` escrito *antes* do código; momento-assinatura definido |
| 10:15–10:45 | Direção e fundação | `bun run new`; DESIGN.md curto (direção, tipografia, cor de sinal, composição); `fidelity.json` com `firstViewport` |
| 10:45–12:30 | **Caminho da demo** | abertura + mecanismo funcionando no exemplo pré-carregado, de ponta a ponta, feio se preciso |
| 12:30–13:15 | Almoço + teste dos 5 s | uma pessoa de fora (ou o [juiz-agente](../../prompts/JUDGE.md)) olha a primeira tela |
| 13:15–15:00 | Profundidade e beleza | momento-assinatura com antes × depois; `PitchTour` (`?demo=1`); arte e motion só no caminho da demo |
| 15:00 | **Congelamento de funcionalidades** | nada novo depois daqui |
| 15:00–15:45 | Endurecer | `design:verify`, e2e do caminho, deploy ou build local, vídeo de 60 s (plano B) |
| 15:45–16:30 | Ensaiar | 3 pitches cronometrados; ajuste a abertura, não o código |

Se às 12:30 o caminho da demo não roda inteiro, corte escopo até rodar. Funcionalidade sem demo vale zero.

## Método da dor: do problema difícil à solução que dói menos

Um "problema difícil" costuma ser grande e abstrato. Vencedores atacam **um momento concreto de uma pessoa concreta**.

1. **Desça três níveis.** Problema → quem sofre mais → em que momento do dia → que decisão ou tarefa essa pessoa faz mal ou devagar nesse momento. Ex.: "saúde pública" → "coordenadora de UBS" → "no dia de montar a escala" → "distribui plantões sem ver a demanda por hora".
2. **Ache a alavanca tecnológica.** O que uma máquina faz aqui que a pessoa não faz: ver padrão em volume, simular antes de agir, traduzir, perceber (visão, áudio), lembrar, comparar alternativas. A IA entra nessa alavanca, **com fronteira** (a pessoa confirma; o cálculo crítico é determinístico).
3. **Gere 3 ideias por ângulos diferentes:** para o profissional que decide, para o cidadão afetado e para o sistema (gestão/dados). Força variedade.
4. **Pontue cada uma de 1 a 5 e escolha a maior soma** (empate: a mais demonstrável):

| Critério | Pergunta |
|---|---|
| Frase | Cabe em "X para Y" sem jargão? |
| Dor visível | Existe um número ou uma cena que um jurado sente em 20 s? |
| Demo em 6 h | O caminho principal roda de ponta a ponta até 12:30? |
| Wow na tela | Há um antes × depois que acontece na frente do jurado? |
| IA essencial | Sem a tecnologia exigida, a solução perde a razão de existir? |
| Aderência | Responde exatamente ao tema e aos critérios oficiais? |

5. **Critérios de descarte:** precisa de dados que não temos; depende de integração externa ao vivo; o "wow" só aparece depois de semanas de uso; não dá para mostrar sem login ou cadastro; é um painel de indicadores sem decisão.

**Pensar fora da caixa**, aqui, é mudar o *ângulo* (outro usuário, outro momento, outra mídia: câmera, voz, mapa, simulação, jogo), não o *escopo*. Ideias originais e estreitas vencem; ideias amplas e genéricas, não.

## A estrutura padrão (vale para qualquer ideia)

Todo produto sai com estas camadas, nesta ordem. É o esqueleto que o `bun run new` gera em `src/routes/index.tsx`:

1. **Abertura** (sem rolar): para quem, dor com número, promessa, **uma** ação. App, não landing: a experiência começa logo abaixo, já com um exemplo carregado.
2. **Experiência com exemplo pronto:** a entrada real ou um exemplo rotulado, a um clique ("Usar exemplo"). Sem login, sem formulário vazio.
3. **Resultado com antes × depois:** o número grande e a comparação.
4. **Como funciona:** 3 ou 4 passos, *onde a IA entra* e *onde a pessoa decide*.
5. **Limites e próximos passos:** o que é fictício, o que quebra primeiro e o próximo passo real.
6. **`?demo=1`:** `PitchTour` de 3 a 5 passos que percorre 1→3 sozinho.

## Papéis no dia (3 ou 4 pessoas + agentes)

- **Produto/pitch:** dono da dor, do one-liner, do roteiro e da apresentação. Ensaia desde as 13h.
- **Mecanismo:** dono do caminho da demo (lógica, dados, IA). Testes do caminho.
- **Experiência:** abertura, momento-assinatura, `PitchTour`, `design:verify`.
- **(4ª pessoa) Integração e plano B:** deploy, vídeo de 60 s, checklist e regras de entrega.

Agentes: um agente principal por pessoa, com tarefas pequenas e arquivos definidos. Sem orquestração pesada: cotas acabam (no ensaio, o Codex e um modelo gratuito do OpenCode bateram no limite).
