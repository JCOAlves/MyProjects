# Contrato de experiência — PPI

## Product context

- Público: pessoas organizando projetos acadêmicos; contexto descrito no `../README.md`.
- Objetivos: acessar o espaço, criar projetos, acompanhar tarefas, escrever anotações e revisar participantes.
- Idioma: `pt-BR`, inclusive mensagens, labels, ações e formatação de datas. Calendário gregoriano; datas de prazo são datas locais sem fuso. Timestamps técnicos são ISO e apresentados no fuso do navegador.
- Acessibilidade: alvo WCAG 2.2 AA; a verificação automatizada é parcial e não equivale a certificação.
- Registro: página inicial de apresentação; área interna orientada a tarefas.

## Business-context sources

| Escopo                             | Fonte                                                            | Natureza                                       | Revisado   |
| ---------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- | ---------- |
| Sete páginas e identidade visual   | Pedido atual e colagem fornecida                                 | Requisito explícito do usuário                 | 2026-11-24 |
| Contexto acadêmico                 | `../README.md`                                                   | Documentação do projeto enviado                | 2026-11-24 |
| Entidades e payloads pretendidos   | `../Backend/Models`, `../Backend/Validates`, `../Backend/Routes` | Evidência de implementação; backend incompleto | 2026-11-24 |
| Limites da integração e permissões | `../INTEGRACAO.md` e arquivos de backend referenciados nele      | Inspeção dos contratos existentes              | 2026-11-24 |
| Dados locais e recuperação         | `src/app/core/workspace.service.ts`                              | Contrato específico da demonstração            | 2026-11-24 |

Não existe política completa de autorização no backend. A interface não inventa essa política: usa apenas simulação explícita de leitor/editor e mantém o modo API bloqueado. Não há cobrança, convite enviado, publicação, compartilhamento real, retenção de conta real ou texto legal criado por esta entrega.

## Visual contract

`DESIGN.md` documenta a identidade. `src/styles.css` é a fonte canônica dos tokens, com tema claro e escuro e aliases CSS por referência. O mapa de tokens está em DESIGN.md. Alterações de receitas compartilhadas exigem atualizar CSS, documento e verificação no mesmo conjunto de mudanças.

## Canonical UI Map

| Capability     | Canonical owner                                               | Source of truth                 | Allowed variants                            | Verification                       |
| -------------- | ------------------------------------------------------------- | ------------------------------- | ------------------------------------------- | ---------------------------------- |
| Select/Listbox | Select HTML + receita global em `src/styles.css`              | Este contrato e DESIGN.md       | native; popup do SO aceito                  | Teclado e popup no navegador       |
| Date           | Input HTML `type=date` + validação de `WorkspaceService`      | Este contrato                   | native; calendário do SO aceito             | Data válida, teclado e popup       |
| Form           | FormsModule + `.form-field` + validação de `WorkspaceService` | Este contrato                   | Criar, editar, acesso e perfil              | Erros associados, foco e retry     |
| Scrollbar      | `src/styles.css`                                              | DESIGN.md                       | Global; geometria própria apenas para modal | Computed style e viewport estreita |
| Toast          | `ToastService` + `ToastsComponent`                            | Este contrato                   | success, error, info                        | Região viva e fechamento           |
| CRUD           | `WorkspaceService` + páginas de dashboard/projeto/perfil      | Este contrato e INTEGRACAO.md   | Lista ou detalhe como contexto de retorno   | Fluxo completo e falhas            |
| Dialog         | `ModalComponent`                                              | Este contrato                   | Edição, descarte e confirmação              | Foco inicial, Escape, restauração  |
| Navigation     | Angular Router + `ShellComponent` + guards                    | `app.routes.ts` e este contrato | Pública e demonstração autenticada          | Rotas, título e retorno seguro     |

Não há seleção de tabela, edição de planilha, ações em lote ou arrastar e soltar. Não criar versões locais dos proprietários acima para atender uma página isolada.

## Component behavior

- Botões e links têm semântica nativa, hover, foco visível e estado indisponível; ações usam botões, destinos usam links.
- Campos têm labels reais, `aria-invalid` e descrição de erro existente. Validação própria substitui bubbles nativas.
- Senhas ficam mascaradas por padrão, com alternância acessível; colagem e gerenciadores de senha não são bloqueados.
- Busca tem botão de limpar quando preenchida, devolvendo o foco ao input. Ela filtra dados locais, sem requisições remotas ou debounce artificial; ngModel mantém o buffer de composição padrão do Angular.
- Textareas usam `resize: none` e altura útil; conteúdo longo continua acessível por rolagem.
- Listas, notas e cartões preservam acesso aos textos longos e ações em qualquer largura.
- Operações locais rápidas não exibem loaders artificiais. Submissões possuem trava de duplicação e estado busy; foto tem estado de leitura/validação.

## Dataset navigation

Home apresenta até seis projetos. “Meus projetos” apresenta nove por vez e oferece “Carregar mais projetos” em lotes de nove. Busca/filtro reiniciam esse limite e mostram contagem, vazio e ausência de resultados.

Busca e filtro ficam em `q` e `filter` na URL. A aba do projeto fica em `tab`. O número de cartões já expandidos e filtros internos de tarefas são transitórios; a URL não representa uma paginação de API. Limites de armazenamento da demonstração: 250 projetos, 1000 tarefas, 250 anotações e 100 colaboradores por projeto.

## Flow ledger

| Operação                      | Trigger e pending                       | Destino de sucesso                                   | Feedback                               | Falha e foco                                                             | Fonte                                         |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| Acessar demonstração          | Botão/formulário; bloqueio de reenvio   | `/home` ou retorno interno permitido                 | Identidade local e aviso persistente   | Preservar campos, erro junto ao formulário                               | WorkspaceService e `login/auth-navigation.ts` |
| Criar projeto                 | Modal; validação e `saving`             | Lista atual, filtros limpos para revelar o novo item | Toast de criação                       | Preservar rascunho; primeiro campo inválido; foco no cartão após sucesso | DashboardPage                                 |
| Editar projeto/tarefa/nota    | Modal no detalhe; `saving`              | Mesmo projeto e contexto                             | Toast correspondente                   | Preservar rascunho e erro inline                                         | ProjectPage                                   |
| Concluir/reabrir tarefa       | Checkbox                                | Mesma lista                                          | Toast e progresso recalculado          | Restaurar checkbox/estado se gravação falhar                             | ProjectPage e WorkspaceService                |
| Excluir projeto               | Confirmação com nome e conteúdo afetado | `/projetos`                                          | Toast                                  | Manter confirmação em falha; Cancelar recebe foco inicial                | ProjectPage                                   |
| Excluir tarefa/nota           | Confirmação com objeto e consequência   | Mesmo detalhe                                        | Toast                                  | Manter erro no modal, sem remover o objeto                               | ProjectPage                                   |
| Simular colaborador/permissão | Revisão e confirmação explícita         | Mesmo detalhe                                        | Mensagem que identifica a demonstração | Preservar seleção; nenhum envio externo                                  | ProjectPage                                   |
| Editar perfil                 | Formulário e validação                  | Mesma página                                         | “Perfil atualizado.”                   | Preservar entradas; não trocar estado antes de persistir                 | ProfilePage                                   |
| Alterar foto                  | Seletor de arquivo, leitura e decode    | Prévia no formulário                                 | Foto só persiste ao salvar perfil      | Erro contextual; cancelar leitura antiga                                 | ProfilePage                                   |
| Cancelar/sair                 | Guard consulta rascunho                 | Destino solicitado após confirmação                  | Sem toast de sucesso inventado         | “Continuar editando” mantém rascunho                                     | Guards e ModalComponent                       |

## Navigation and responsive behavior

As sete páginas pedidas são `/`, `/cadastro`, `/login`, `/home`, `/projeto/:id`, `/perfil` e o wildcard de não encontrado. `/projetos` reutiliza o dashboard em modo de lista; `/configuracoes` redireciona para o perfil.

Cada rota tem um título em português no Angular Router. Um ID inexistente exibe “Projeto não encontrado” dentro do shell; URL desconhecida usa a página 404 pública. Ausência de sessão local leva ao login com retorno restrito a rotas internas. O modo API permanece fechado; um futuro backend deve distinguir 401/403 de 404.

Tabs usam roles, seleção/foco distintos, setas, Home e End. Sidebar vira navegação horizontal em 760 px. Corpo mantém altura natural; o modal é o único proprietário de scroll lock temporário. Evitar qualquer recorte de ações/labels em 320–390 px.

## Overlays and feedback

`ModalComponent` usa `dialog.showModal()`: top layer, fundo inerte, teclado nativo, título/descrição associados, foco inicial explícito ou primeiro campo e restauração ao controle anterior quando ele existe. Escape, fechar e clique no backdrop passam pelo proprietário do formulário para verificar alterações.

Exclusões e alterações de colaboradores têm confirmação própria com verbo específico, consequência e Cancelar em foco. Descarte de rascunho é uma ação separada; não usar `window.confirm`, alert ou prompt. No unload real do navegador, o guard limitado de `beforeunload` é aceito.

Toasts usam uma região viva polite inferior direita, duram 5500 ms, podem ser fechados, deduplicam o mesmo texto e limitam a lista a três itens. Formulários mantêm uma cópia persistente de erros relevantes. Falhas de armazenamento também aparecem no shell.

## Async and resilience

- A demonstração usa mutação pessimista: primeiro validar e salvar, depois atualizar signals. Falha de quota/armazenamento preserva o estado anterior.
- Projetos ficam no localStorage; perfil na sessão. Senhas não são salvas. Existe um único espaço por navegador/origem, sem isolamento fictício de contas.
- Antes de gravar, o conteúdo atual é comparado ao último conteúdo lido. Mudança de outra aba bloqueia a gravação e pede recarregamento, sem sobrescrever a versão nova.
- Dados inválidos têm fallback explícito para exemplos, aviso e cópia de recuperação antes de qualquer gravação subsequente.
- Não há autosave de rascunhos, fila de sincronização ou tentativas automáticas de mutação. Navegar com rascunho exige confirmação.
- O modo local não exige rede depois que o app está carregado. Não há promessa de abertura offline inicial ou service worker.
- O transporte futuro tem timeout de 12 s, tratamento de status/JSON inválido e nenhuma repetição automática de operação não idempotente.
- A leitura de foto ignora resultado de seleção antiga e resultado após destruição da página.

## Validation and permission UI

A validação final dos dados da demonstração pertence ao WorkspaceService. Os formulários antecipam erros para focalizar o campo relevante e explicar como corrigir. Novas regras precisam permanecer coerentes nos dois pontos. Datas impossíveis são rejeitadas antes de salvar.

Fotos: PNG/JPEG/WebP, até 1 MiB, assinatura válida e até 4096 × 4096 px no formulário. Avatar é conteúdo da sessão, sem upload. Conteúdo de nota é texto interpolado, não HTML executável.

“Leitor”, “Editor” e “Proprietário” são rótulos da demonstração, com aviso visível. Nenhum deles prova autorização real. O botão Google permanece indisponível com explicação enquanto não houver OAuth. Não há cópia de segredo ou URL pública de compartilhamento.

## Verification

Comandos exigidos: `npm run typecheck`, `npm run build`, `npm run test:ci`, `npm run format:check` e `npm run test:e2e`. O manifesto `premium-ui.json` declara esses comandos; cada um deve ser executado separadamente. A auditoria estática usa o script `audit_project.py` da skill frontend-design-premium em modo strict e registra `premium-audit.json`.

Evidência unitária: `src/app/core/workspace.service.spec.ts`, `src/API/request-http.spec.ts` e os testes de navegação de login. Evidência no navegador: `e2e/app.spec.ts`. Uma declaração de evidência não equivale a um teste já aprovado; os resultados da execução acompanham a entrega.

Verificar: desktop e viewport de 390 px, tema claro/escuro, teclado e foco dos modais, validação e retorno seguro, CRUD de projeto/tarefa/nota, confirmação de colaboradores, dados vazios/sem resultados, falha de gravação, persistência e acessibilidade automatizada. Comparar criação e edição para manter labels, avisos, foco e apresentação coerentes. A revisão humana da imagem fornecida continua necessária para fidelidade visual.

### Limitação observada da auditoria estática

Em 2026-11-24, o auditor da skill 1.4.0 terminou com exit 1: 49 ocorrências de `affordance.actionless-button` e zero proprietários não resolvidos. Seu detector reconhece `onclick`, `@click` e `v-on:click`, mas não reconhece o binding Angular `(click)`. Todas as 49 ocorrências foram cruzadas com as tags originais e possuem binding de ação ou estado controlado. O JSON original foi preservado em `premium-audit.json`, sem excluir fontes, alterar botões ou editar o auditor para produzir um resultado artificial. A validação de funcionamento pertence aos testes de navegador; não declarar que o auditor strict passou.
