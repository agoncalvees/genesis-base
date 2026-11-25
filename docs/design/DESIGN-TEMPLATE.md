# Modelo de DESIGN.md do produto

O front matter (tokens) segue o [contrato do motor](DESIGN-ENGINE.md) e é validado por `design:lint`. O corpo abaixo é a **direção de arte**: o que o motor não consegue gerar, mas que o agente implementador precisa obedecer. Copie as seções para `design/DESIGN.md` do produto e escreva decisões, não adjetivos. Cada linha deve permitir dizer "a tela segue / não segue isto".

Tokens que o contrato não cobre (escalas sequenciais, cores de material, tamanhos de exibição) vão em CSS do produto como propriedades `--nome` em `:root` e são citados aqui pelo nome. `design:verify` consegue conferi-las com `{--nome}`.

```markdown
# <Nome>

## Direção
- Metáfora: <uma frase>.
- Atributos: <3>. Antiatributos: <3>.
- Mecanismo em tela: <o usuário vê X transformar Y em Z>.
- Referências: <ref> → <lição>; (até 3).

## Composição
- Estrutura da tela principal: <ex.: mapa sangrando 68 % à esquerda; coluna de instrumentos 32 % à direita; título sobreposto ao mapa no canto superior esquerdo>.
- Protagonista: <elemento> ocupa <área/posição>.
- Quebras de grade permitidas: <quais e por quê>.
- Mobile: <o que muda de ordem, o que vira gaveta, o que some>.

## Ritmo, proporção e escala
- Grade: <colunas, gutter, margens>. Unidade: <n px>.
- Escala tipográfica: exibição <px clamp>, seção <px>, corpo <px>, legenda <px>, leitura numérica <px>.
- Proporção dominante: <ex.: 2:1 mapa/instrumentos; 4:3 no mapa>.

## Tipografia
- Exibição: <família, peso, itálico onde, tracking>. Corpo: <família>. Leituras: <mono, tabular>.
- Regras: <ex.: números sempre em mono tabular; títulos nunca em negrito; versalete para rótulos de eixo>.

## Cor e materiais
- Material dominante: <papel, carvão, metal, vidro…> e como ele aparece (grão, hachura, borda).
- Cor de sinal: <hex> somente para <estado/ação>.
- Escalas de dados: <sequencial/divergente com hex e nome de variável>.

## Profundidade
- Camadas: <fundo, mecanismo, anotações, controles, overlays> e como se separam (sombra, borda, luz, desfoque, nenhum).

## Densidade
- <alta/média/baixa> porque <público>. Texto máximo por bloco: <n palavras>.

## Recursos gráficos
- Assets: <arquivo → papel na narrativa>. Ilustração/foto/textura/diagrama e técnica.
- Iconografia: <conjunto e peso, ou nenhuma>.

## Narrativa
- Primeiros 5 s: <o que a pessoa vê e entende>.
- Fluxo: <passo 1 → 2 → 3 → resultado>.
- Momento-assinatura: <a interação que será lembrada / demonstrada>.

## Comportamento e motion
- Estados: vazio, executando, resultado, erro, desatualizado — <como cada um aparece>.
- Motion por intenção: <mudança → técnica → duração/curva>. Ex.: resultado → máscara revelando a comparação, 500 ms, ease-out-expo.
- Reduced motion: <o que vira corte seco, o que permanece (estado nunca depende de animação)>.

## Não fazer
- <proibições específicas desta identidade>.
```
