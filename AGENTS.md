# Genesis Base — instruções para agentes

Genesis Base é a fundação enxuta para materializar uma experiência digital excepcional a partir de um tema desconhecido. A prioridade é a **qualidade da primeira entrega**, não o tamanho da fundação. Use português na documentação, inglês em código e identificadores, kebab-case em arquivos (salvo nomes convencionais).

## Ao retomar
Leia [STATUS](docs/STATUS.md) (checkpoint mais recente) e só os guias da tarefa. Não é preciso ler o repositório inteiro.

| Tarefa | Leia |
|---|---|
| Dor, critérios de julgamento, estrutura do app, pitch de 3 min | [PITCH-PROTOCOL](docs/product/PITCH-PROTOCOL.md) |
| Interpretar o tema, direção de arte, referências, assets, Figma | [CREATIVE-DIRECTION](docs/design/CREATIVE-DIRECTION.md) |
| Escrever o DESIGN.md | [DESIGN-TEMPLATE](docs/design/DESIGN-TEMPLATE.md), [DESIGN-ENGINE](docs/design/DESIGN-ENGINE.md) |
| Iniciar um produto | [NEW-PRODUCT](docs/NEW-PRODUCT.md) |
| Escolher bibliotecas e componentes | [EXPERIENCES](docs/design/EXPERIENCES.md), [COMPONENTS](docs/design/COMPONENTS.md) |
| Motion | [MOTION](docs/design/MOTION.md) |
| Validar a aparência | [FIDELITY](docs/design/FIDELITY.md), [VISUAL-ENGINEERING](docs/design/VISUAL-ENGINEERING.md) |
| Decisões | [ADRs](docs/architecture/decisions/) |

## Fluxo de um tema novo
1. Confirme as regras do evento. Preencha `CHALLENGE.md` e `PRODUCT-BRIEF.md`.
2. `bun run new -- --name "<Nome>" --slug <slug> --dir <abs> [--with ai,dataviz]`. Trabalhe no produto; o domínio fica nele.
3. **Produto e pitch primeiro** ([PITCH-PROTOCOL](docs/product/PITCH-PROTOCOL.md)): quem sofre, dor com número, one-liner, critérios de julgamento → evidência na tela, roteiro de 3 min. O jurado não explora o app: a primeira tela mostra dor, promessa e ação; `?demo=1` conta a história em ≤ 60 s com `PitchTour`.
4. **Protocolo de direção artística** (obrigatório, curto): mecanismo tecnológico central → até 3 referências concretas → direção artística → conceito visual da tela principal → `design/DESIGN.md` + `design/fidelity.json` → implementação → `design:verify` e comparação com o conceito → teste dos 5 segundos → uma rodada de refinamento antes de entregar.
5. A direção escolhe os componentes. O exemplo `design/examples/aceiro/` mostra o nível esperado, não uma estética a copiar. Não imponha uma estética universal; a identidade é original e adequada ao público e ao contexto cultural.
6. Construa primeiro a abertura e o momento-assinatura onde o mecanismo aparece funcionando; depois a demonstração guiada; por último a exploração livre. Uma tela excepcional que se explica sozinha vale mais que várias medianas.

## Execução
- Registre em poucas linhas objetivo, arquivos sob sua responsabilidade e critérios de aceitação. Exceções exigem aprovação humana.
- Fundação agnóstica ao domínio e à marca; o núcleo não importa `features/`. Serviços opcionais fora do caminho crítico. Mudanças de escopo, stack ou custo na fundação exigem ADR com decisão humana. Dependências de **produto** são livres quando justificadas (licença, peso, acessibilidade) e registradas em `PROVENANCE.md`. Preserve o lockfile.
- Promova algo à fundação só com uso real, outro uso plausível e sem texto/cor/fonte fixos.
- Implemente a menor solução funcional; um responsável por arquivo ou contrato. Sem serviço externo, continue localmente e registre o bloqueio. Identifique fixtures e mocks; diferencie medições de estimativas; registre apenas testes executados.
- Rode as verificações pertinentes e uma revisão independente quando houver; senão, autorrevisão declarada. Atualize o STATUS com comandos, resultados, bloqueios e ponto de retomada. Tudo deve funcionar pelo terminal em Claude Code e Codex, sem orquestrador.
- Commits locais pequenos. Operações destrutivas, push, merge remoto, publicação, deploy, conexão de contas e gastos (inclusive créditos de IA do Figma) exigem autorização. Segredos fora do cliente, logs e Git.

## Qualidade visual
- Referência de acabamento: Robin; referência de ambição: Awwwards/Godly. Preserve identidades, licenças e autoria; não copie marcas ou recursos protegidos.
- Interface aprovada em testes não é interface profissional. Abra no navegador, capture 360/768/1440, compare com o conceito e com o DESIGN.md (`bun run design:verify`). Verifique teclado, foco, contraste, erros, responsividade e reduced motion.
- Evite os sinais de interface gerada por IA listados em CREATIVE-DIRECTION.
