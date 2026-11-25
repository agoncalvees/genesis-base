# Direção artística e criação visual

Protocolo obrigatório para qualquer experiência construída com o Genesis. A direção artística escolhe os componentes; os componentes não escolhem a direção. Meta total até a primeira tela implementada: 60–90 min.

## O protocolo (9 passos)

| # | Passo | Saída verificável | Tempo |
|---|---|---|---|
| 1 | **Problema e público.** Quem usa, onde, com qual conhecimento, em que momento, e o que precisa sentir/entender em 30 s. | 5 linhas em `docs/product/PRODUCT-BRIEF.md` | 5 min |
| 2 | **Mecanismo tecnológico central.** O que o sistema faz que o usuário não faria sozinho (simular, classificar, otimizar, comparar, prever, conectar). A tela principal deve **mostrar o mecanismo funcionando**, não descrevê-lo. | 1 frase: "o usuário vê X transformar Y em Z" | 5 min |
| 3 | **Até três referências concretas.** Peças específicas (uma página, uma infografia, um objeto, um material), de domínios diferentes, cada uma com **uma** lição registrada. Pelo menos uma fora do mundo do software (impressão, cartografia, sinalização, instrumentos, arquitetura, cinema). | Tabela referência → lição → onde aplicar | 10 min |
| 4 | **Direção artística.** Metáfora de mundo em uma frase ("caderno de campo ao entardecer", "sala de controle de 1970", "bula de remédio"), três atributos e três antiatributos, material dominante, uma cor que só aparece para o que importa. | Seção *Direção* do DESIGN.md | 10 min |
| 5 | **Conceito visual da tela principal.** Imagem ou frame da composição antes do código: geração de imagem, Figma ou esboço HTML estático. Decide escala do título, onde está o mecanismo, ritmo e um momento-assinatura. | `design/concept.*` | 10–15 min |
| 6 | **DESIGN.md.** Tokens no front matter + seções de arte (ver [modelo](DESIGN-TEMPLATE.md)). `bun run design:lint` e `design:build`. Escreva `design/fidelity.json` com 5–10 regras que **não podem** divergir. | Lint 0; `fidelity.json` | 10 min |
| 7 | **Implementação.** Comece pelo mecanismo/momento-assinatura, depois o entorno. Escolha recursos pelo [Experience Registry](EXPERIENCES.md); use primitivas do Genesis só para comportamento (foco, teclado, diálogos). | Tela funcionando | — |
| 8 | **Comparar com o conceito.** `bun run design:verify <url>` (estilos computados, fontes carregadas, overflow, capturas 360/768/1440) e inspeção lado a lado com o conceito. | `design/evidence/` | 5 min |
| 9 | **Refinar antes de entregar.** Uma rodada obrigatória: corrija as três maiores divergências de composição/hierarquia, depois detalhes (estados, foco, reduced motion). Registre o que mudou. | Capturas antes/depois no STATUS | 15 min |

Não há passo 7 sem 5 e 6. Se o tempo apertar, encurte cada passo — não pule.

## Princípios aplicáveis (o que aprendemos das referências)

Extraídos de Robin (acabamento), Awwwards/Godly (direção), Framer (composição), getdesign.md (contrato textual de identidade) e das bibliotecas de motion (React Bits, Motion Primitives, Animate UI, Magic UI, Aceternity). Use como decisões, não como estilo.

1. **Um protagonista por tela.** O mecanismo ocupa a maior área e a posição mais forte. Controles orbitam ao redor dele; resultados aparecem *sobre* ou *junto* dele, não em outra coluna de cards.
2. **Escala com contraste extremo.** Título de exibição 4–8× o corpo; leituras numéricas grandes em mono/tabular; legendas pequenas e precisas. Evite a escada uniforme 16/20/24/32.
3. **Tipografia com voz.** Um par com tensão (serifa editorial + grotesca; grotesca condensada + mono). Itálico, versalete, numerais tabulares e tracking são ferramentas de hierarquia. Nunca a fonte padrão do sistema como identidade.
4. **Cor como sinal.** Paleta majoritariamente neutra do material escolhido; **uma** cor de sinal reservada ao estado/ação central. Superfícies diferenciam-se por material (papel, vidro fosco, metal, tinta), não por cinza #f7f7f8.
5. **Composição que quebra a grade quando a história pede.** Elementos que sangram na borda, sobreposição de título e conteúdo, assimetria intencional, linhas de construção visíveis. Uma grade forte por baixo permite quebrar por cima.
6. **Materialidade.** Grão, hachura, papel, textura de impressão, fotografia ou ilustração autoral dão peso. Gradiente suave genérico e glassmorphism não são material.
7. **Densidade calibrada ao público.** Especialista: denso, anotado, com unidades. Público geral: uma ideia por vez, com narrativa guiada. Nunca a densidade "média" de painel administrativo por omissão.
8. **Motion explica.** O movimento mostra causa → efeito (ver [MOTION](MOTION.md)). A animação mais importante é a do mecanismo; o resto da interface é quase parado.
9. **Interação direta.** Arraste, desenhe, gire, compare deslizando — sobre o próprio objeto. Formulários e sliders genéricos só quando o dado é realmente um número.
10. **O mecanismo tem o acabamento da arte.** A camada computacional (grade, partículas, grafo) é renderizada no mesmo material da direção: bordas suaves, brilho, traço de mão — não quadrados e linhas de debug sobre uma ilustração refinada. Durante o processamento, as leituras se atualizam ao vivo.
11. **Acabamento invisível.** Estados vazios/erro/carregando desenhados, foco bonito, cursores corretos, alvos generosos, textos de interface específicos ao domínio, sem lorem e sem rótulos em inglês esquecidos.

### Sinais de interface gerada por IA (evite)

Hero centralizado com gradiente roxo/azul; grade de 3 cards com ícone + título + texto; badges pill em todo lugar; sombras suaves em todos os painéis; `rounded-2xl` universal; dashboard com sidebar + KPIs + gráfico de linha como resposta padrão; fade-in + stagger em tudo; emoji como ícone; Inter/Geist sem decisão; texto "Unlock the power of…"; números redondos falsos sem unidade.

## Ferramentas visuais por ambiente

Verifique a disponibilidade **na sessão** antes de planejar. Não simule integrações nem compre créditos.

| Ferramenta | Onde | Uso recomendado | Custo/limite verificado (24/11/2026) |
|---|---|---|---|
| Geração de imagens do Codex | Codex (app/CLI com conta ChatGPT) | Arte conceitual, ilustração autoral, textura, fotografia contextual, mascote, conceito de tela | Incluída no plano; usada no ensaio Aceiro |
| Figma MCP — leitura, escrita de frames (`use_figma`), diagramas FigJam, screenshots | Claude Code (conector claude.ai) e Codex se conectado | Composição, prototipação, handoff, comparação conceito ↔ captura | Conta estudante; leitura/escrita sem crédito de IA |
| Figma MCP — `generate_image`, `generate_vector_illustration`, shaders | idem | Imagens/vetores dentro do arquivo Figma | **Consome créditos de IA do Figma** — exige autorização humana explícita |
| SVG à mão, Canvas 2D, WebGL (OGL/three), CSS, Motion | qualquer agente | Diagramas, visualizações e tudo o que precisa reagir a dados ou interação | Gratuito |
| Navegador (Playwright, `design:verify`, Orca browser, Chrome) | qualquer agente | Capturas, estilos computados, teclado, reduced motion | Gratuito |

Divisão de trabalho: **geração de imagem para arte** (o que seria ilustrado ou fotografado), **Figma para composição** (onde as coisas ficam), **SVG/Canvas/CSS/Motion para o que é interativo ou dinâmico**. Não substitua uma ilustração necessária por ícones, gradientes ou SVG simplista; não use imagem gerada para o que precisa ser dado real.

### Assets gerados

- Poucos e estratégicos: 1–3 por experiência, com papel narrativo ou funcional (ex.: um mapa ilustrado que também é a fonte de dados da simulação).
- Prompt com: enquadramento exato (ortogonal, retrato 3:4…), material e técnica, paleta em hex, o que **não** deve aparecer (texto, logotipos, molduras), uso pretendido.
- Converta para WebP/AVIF, dimensione pelo uso (≤ 600 KB para fundo grande), `alt` quando informativo, `aria-hidden` quando decorativo.
- Registre em `design/ASSETS.md`: ferramenta, modelo, prompt, dimensões, peso, termos de uso, avaliação crítica.
- Sem dados pessoais, marcas, rostos reais ou estilos de artistas vivos citados por nome nos prompts.

## Papéis (quando houver orquestração)

Sem orquestrador, um único agente executa os 9 passos. Com Orca: Claude conduz 1–6, 8 e 9 (direção, produto, arquitetura, revisão visual); Codex implementa 7 e gera imagens; OpenCode faz tarefas delimitadas (auditoria de acessibilidade, testes, inconsistências), com modelo gratuito. Delegue só quando houver ganho concreto, com especificação autocontida (DESIGN.md + conceito + critérios).
