# Atividade Prática - Aula 15

## Painel de Administração na Entidade Principal (Trilhas API + Frontend)

**Baseado em:** roteiro da Aula 15 — trilha API (Shortz-App API) e roteiro da Aula 15 — trilha Frontend (Shortz-App)

**Aplicação:** este enunciado vale para qualquer projeto sorteado na Lista de Projetos para Programação Web — use a mesma ficha de preparação das aulas anteriores, reaproveitando os campos já preenchidos (nome do model da sua entidade, nome da tabela, rota, o campo de texto principal). Hoje o trabalho tem três conceitos novos de domínio: o **papel de administrador** (quem pode entrar no painel), o **bloqueio de usuário** e a **revisão de denúncias** (o dado que você gravou na Atividade 14, agora lido). Há uma parte que depende da sua entidade (os nomes e os textos) e uma parte idêntica para todo mundo (a guarda das rotas, o `isAuthenticated` que consulta o banco, o bloqueio, a revisão idempotente, as ações que esperam o servidor). O Grupo A/B não altera nada.

**Pré-requisito:** Atividade 14 concluída nas duas trilhas — na API, os módulos de notificação e de denúncia (com as associações `Reporter` e a do item), o `deleteVideo` do seu item (`delete<Entidade>`) com o parâmetro `isAdmin = false` e limpando as cinco tabelas, `utils/parseId.js`, `utils/pagination.js` e o `escapeLike` dentro do seu `searchService`; no front, `usePaginatedList`, `useAsyncData`, `useDebouncedValue`, `BaseModal`, o interceptor do Axios e as quatro telas de `views/admin/` como placeholders (com as rotas `admin-*` e a chave `requiresAdmin` já escritas, desde a Aula 06); e quatro contas de usuário para os testes (ADMIN, A, B e C), com pelo menos dois itens da sua entidade enviados (um de A, um de B).

> ⚠️ **Ordem de execução:** faça a Parte A (API) antes da Parte B (Frontend), como nas atividades anteriores.

---

## 1. Objetivo

Ao final desta atividade, você deve ter, no seu próprio projeto:

**Do lado do back-end (API):**

- A tabela de denúncias com a coluna `status` (`ENUM` `pending` / `reviewed`, padrão `pending`), a coluna `reviewedAt` e um índice em `status`;
- O `isAuthenticated` assíncrono, que consulta o usuário no banco a cada requisição (recusa token de conta apagada ou bloqueada com `401` e monta o `req.user` com o `isAdmin` do banco), e o middleware `isAdmin` (`403`);
- O login recusando a conta bloqueada (`403`), depois de conferir a senha;
- O módulo `admin` com uma única guarda (`router.use('/admin', isAuthenticated, isAdmin)`) e as rotas: `GET /dashboard`, `GET /reports` (filtro `status`) e `PATCH /reports/:id/review`, `GET /users` (busca) e `PATCH /users/:id/block`, e `GET /<suas-entidades>` (busca) e `DELETE /<suas-entidades>/:id`;
- O `escapeLike` extraído para `utils/`, usado pela busca pública e pela do painel;
- O script `scripts/setAdmin.js`.

**Do lado do front-end:**

- O layout do painel (`AdminLayout`) com quatro abas e as telas como rotas filhas de `/admin` (com `redirect` e a `meta` no pai);
- A guarda por papel no `router.beforeEach` (visitante → Login; logado sem papel → Feed com aviso);
- O `usePaginatedList` com a opção `watch` e a guarda contra a resposta velha; o `ConfirmModal`;
- As quatro telas: Dashboard (cartões), Denúncias (filtro, revisar), Usuários (busca, bloquear/desbloquear) e Itens (busca, excluir), todas com ações que esperam o servidor.

**Você também deve ser capaz de explicar com suas palavras:**

1. A diferença entre autenticação e autorização, e quando a API responde `401` e quando responde `403` (dê um exemplo de cada, incluindo o `403` de dono da Aula 09 e o de papel de hoje);
2. Por que o `isAuthenticated` passou a consultar o banco em vez de confiar no `isAdmin` do token: o que acontece, sem isso, com um usuário bloqueado, com um administrador rebaixado e com uma conta apagada; qual o custo; e quais são as outras duas alternativas;
3. Como se vira administrador (a pergunta da Aula 14) e por que não existe uma rota para isso;
4. Por que a guarda é uma linha no `router.use` e não um `isAdmin` em cada rota, e por que o `isAdmin` precisa vir depois do `isAuthenticated`;
5. Como a coluna `status` foi acrescentada a uma tabela que já tinha linhas (o papel do padrão), por que revisar é idempotente e para que serve o `reload()` no `reviewReport`;
6. As duas checagens do bloqueio (login e `isAuthenticated`): por que o login responde `403` e as rotas `401`, por que a checagem do login vem depois da senha, e o que o bloqueio **não** faz;
7. Por que o `escapeLike` foi extraído já nesta aula e não na 18, e como a lista de itens traz a contagem de denúncias sem um `include` agrupado;
8. O que você viu nos dois testes de controle (token de bloqueado funcionando; usuário comum no painel) e o que cada um prova;
9. O que a guarda de rota do front protege e o que não protege: descreva o experimento do `localStorage` e o que a API respondeu;
10. Por que as ações do administrador esperam o servidor (em vez de atualização otimista), e o que é o "pulo" da paginação por offset que você viu com `PAGE_SIZE = 2`.

---

## 2. Antes de começar: adapte os nomes à sua entidade

Preencha (acrescente à ficha das aulas anteriores) e use nos nomes de arquivos, rotas e telas:

| Nome | Exemplo (Shortz-App) | O seu projeto |
|---|---|---|
| Rota da lista de itens do painel | `GET /api/admin/videos` | `GET /api/admin/<suas-entidades>` |
| Rota de excluir pelo painel | `DELETE /api/admin/videos/:id` | `DELETE /api/admin/<suas-entidades>/:id` |
| Sua função de excluir (que já tem `isAdmin`) | `videoService.deleteVideo(id, userId, isAdmin)` | `<entidade>Service.delete<Entidade>(...)` (Atividade 9) |
| Campo de texto da busca de itens | `title` | o seu campo principal |
| Id do item nas denúncias | `videoId` | `<entidade>Id` |
| Telas e rotas do front | `AdminVideosView`, `admin-videos` | `Admin<Entidades>View`, `admin-<entidades>` |
| Textos do painel | "Vídeos", "Excluir vídeo", "Denunciado por..." | os seus textos |
| Chave do token no `localStorage` | `shortz_token` / `shortz_user` | as suas chaves |

> 💡 **O que não muda de projeto para projeto:** os nomes `isAdmin`, `isBlocked`, `status`, `pending` / `reviewed`, `reviewedAt`, os filtros `pending` / `reviewed` / `all`, as rotas de dashboard, denúncias e usuários, e as mensagens de erro do roteiro. Mantê-las iguais faz o painel de todos os projetos ser testável do mesmo jeito.

> 💡 **Sobre o `isBlocked` e o `isAdmin`:** as duas colunas já existem no model de usuário desde a Atividade 3. Se a sua entidade de usuário tem outro nome para elas, use o seu nome e adapte os textos; a regra é a mesma.

---

# PARTE A — Backend

## 3. Etapa 1 — Constantes e a Coluna de Situação da Denúncia

1. Em `config/constants.js`, acrescente `REPORT.STATUS` (objeto com `PENDING: 'pending'` e `REVIEWED: 'reviewed'`) e o bloco `ADMIN` com `REPORT_FILTERS: ['pending', 'reviewed', 'all']`.
2. No model de denúncia, acrescente: `status` como `ENUM(...Object.values(REPORT.STATUS))`, `allowNull: false` e `defaultValue: REPORT.STATUS.PENDING`; `reviewedAt` (`DATE`, `allowNull: true`); e o índice `{ fields: ['status'], name: 'idx_reports_status' }`.
3. Reinicie a API e confira no banco, com `SHOW CREATE TABLE` da tabela de denúncias: as duas colunas, o índice e que as denúncias antigas ficaram `pending` (`SELECT status, COUNT(*) FROM ... GROUP BY status`). Anote: sem o `defaultValue`, o `sync({ alter: true })` não conseguiria acrescentar a coluna a uma tabela com linhas (pergunta 5).

**Checklist desta etapa:**

- [ ] Constantes, model atualizado e índice novo
- [ ] Banco com `status` e `reviewed_at`; denúncias antigas `pending`

## 4. Etapa 2 — Autorização: `isAuthenticated` com Banco, `isAdmin`, Login e `setAdmin`

1. **`middlewares/auth.js`** (Bloco 5 do roteiro de API): reescreva o `isAuthenticated` como `async`: (a) `try/catch` só da verificação do token (`401` se inválido); (b) `User.findByPk(decoded.id, { attributes: ['id', 'username', 'isAdmin', 'isBlocked'] })`; (c) usuário inexistente → `401`; (d) `isBlocked` → `401` com "Sua conta foi bloqueada. Entre em contato com a administração."; (e) `req.user = { id, username, isAdmin }` montado a partir do banco; (f) um segundo `try/catch` envolvendo a consulta, mandando erros inesperados ao `next(err)`. Acrescente o middleware `isAdmin` (`403` "Acesso restrito a administradores.") e exporte os dois.
2. **Login:** no `loginUser`, depois da conferência da senha, recuse `isBlocked` com um erro de `status = 403` e a mesma mensagem.
3. **`utils/escapeLike.js`:** extraia a função do seu `searchService` e importe-a lá (Bloco 6). Confirme que a busca pública continua tratando `%%` como texto.
4. **`scripts/setAdmin.js`** (Bloco 10): `require('dotenv').config()` no topo; `process.argv[2]` é o `username` e `process.argv[3] === 'off'` rebaixa; avisa se o usuário não existe (`process.exitCode = 1`); `sequelize.close()` no `finally`. Promova a conta ADMIN: `node scripts/setAdmin.js <username>`.

> ⚠️ **Dois pontos em que quase todo mundo erra:** (1) colocar o `isAdmin` antes do `isAuthenticated` (todos recebem `403`, até o administrador); (2) fazer a checagem do bloqueio no login antes de conferir a senha (revela quais contas existem e estão bloqueadas).

**Checklist desta etapa:**

- [ ] `isAuthenticated` assíncrono, consultando o banco, e `isAdmin` exportados; as rotas antigas continuam funcionando sem alteração
- [ ] Login de bloqueado → `403` (e a senha errada de um bloqueado continua com a mensagem genérica)
- [ ] `escapeLike` em `utils/`; `scripts/setAdmin.js` promovendo e rebaixando

## 5. Etapa 3 — O Módulo `admin`

Crie `modules/admin/` com `adminValidator.js`, `adminService.js`, `adminController.js` e `adminRoutes.js` (Bloco 8 do roteiro) e registre no `app.js` depois das rotas de denúncia e antes do 404:

- **Validator:** `reportsFilterValidator` (`query('status').optional().isIn(ADMIN.REPORT_FILTERS)`) e `blockUserValidator` (`body('isBlocked')` com `.exists()`, `.bail()` e `.isBoolean({ strict: true })`), com a função `validate` de sempre.
- **Rotas:** primeira linha: `router.use('/admin', isAuthenticated, isAdmin)`. Depois: `GET /admin/dashboard`; `GET /admin/reports`; `PATCH /admin/reports/:id/review`; `GET /admin/users`; `PATCH /admin/users/:id/block`; `GET /admin/<suas-entidades>`; `DELETE /admin/<suas-entidades>/:id`.
- **Service:**
  - `getDashboardStats`: `Promise.all` com sete contagens (usuários, bloqueados, seus itens, comentários, curtidas, denúncias pendentes, denúncias revisadas) → objeto com exatamente `users`, `blockedUsers`, a chave do seu item no plural (em inglês, como o nome da tabela: `videos`, `recipes`...), `comments`, `likes`, `pendingReports`, `reviewedReports`;
  - `getReports(status, page, limit)`: `all` → sem filtro; `include` de `Reporter` e do item, e dentro do item o autor; só atributos públicos; ordem `createdAt DESC, id DESC`; `limit` e `offset`;
  - `reviewReport(id)`: `404`; só escreve se ainda não estava revisada; `await report.reload()`; devolve `{ id, status, reviewedAt }`;
  - `getUsers(search, page, limit)`: `attributes` explícito (com `email`, `isBlocked`, `isAdmin`, contadores; sem `password`); busca com `LIKE` escapado em `username`, `email` e `fullName`; texto vazio = sem filtro;
  - `setUserBlocked(targetId, isBlocked, adminId)`: `404` → `400` (a si mesmo) → `403` (outro administrador) → grava só se mudar; devolve `{ id, username, isBlocked }`;
  - `get<Entidades>(search, page, limit)`: itens da página com o autor; uma segunda consulta agrupada (`Op.in`, `GROUP BY`, `raw: true`) com as denúncias pendentes só dos ids da página; junção com um `Map`; `pendingReportsCount` em cada item (`Number(row.total)`).
- **Controller:** `parsePagination`, `parseId(req.params.id, '<rótulo>')`; `readSearch` (só texto, `trim`, `slice(0, SEARCH.MAX_LENGTH)`); `status` padrão `'pending'`; o `adminId` do bloqueio vem de `req.user.id`; a exclusão chama o seu `delete<Entidade>` com o último argumento `true`.

**Checklist desta etapa:**

- [ ] Quatro arquivos em `modules/admin/`, registrados no `app.js`
- [ ] `GET /api/admin/dashboard` sem token responde `401` (e não `404`)
- [ ] A exclusão do painel não tem uma linha nova de `destroy`: reaproveita o seu `delete<Entidade>`

## 6. Etapa 4 — Teste de Controle (obrigatório)

Siga o Bloco 12.9 do roteiro de API:

- **(a)** Em `auth.js`, comente as três linhas do `if (user.isBlocked) { ... }`. Bloqueie B pelo painel (ou pelo `curl`) e repita uma rota autenticada com o token antigo de B: anote o status. Desfaça.
- **(b)** Em `adminRoutes.js`, retire o `isAdmin` da linha do `router.use`. Chame `GET /api/admin/dashboard` com o token de um usuário comum e anote o status e o que veio. Desfaça e confirme que voltou a dar `403`.

Descreva o que viu nos dois testes no `respostas.md` (pergunta 8) e inclua os prints (`controle-bloqueio.jpg` e `controle-isadmin.jpg`).

**Checklist desta etapa:**

- [ ] Os dois testes de controle feitos, desfeitos e descritos

## 7. Etapa 5 — Testando

Faça os testes do Bloco 12 do roteiro de API, adaptados aos seus nomes (quatro contas: ADMIN, A, B e C; o JSON do `-d` com aspas escapadas no CMD):

1. **Sem token e usuário comum:** as sete rotas e `GET /api/admin/rota-inexistente` respondem `401` sem token e `403` com o token de um usuário comum.
2. **Dashboard:** com o token do ADMIN emitido antes da promoção → `200`, com as sete chaves, conferindo com o banco (a prova de que o papel vem do banco).
3. **Denúncias:** lista padrão (pendentes, a mais nova primeiro, com `Reporter`, item e autor, sem dados sensíveis); `?status=all`, `?status=reviewed`, `?status=xyz` → `400`, `?limit=1&page=2`.
4. **Revisar:** `200` com `reviewedAt`; repetir `200` com o mesmo `reviewedAt`; `99999` `404`; `abc` `400`; token comum `403`; listas e Dashboard acompanham.
5. **Usuários:** lista com `email` e flags e sem `password`; busca por `username` e por e-mail; `%%` → `[]`; `?search=a&search=b` sem erro.
6. **Bloquear:** `200` e repetir `200`; o token antigo de B → `401` com a mensagem do bloqueio; o login de B com a senha certa → `403`; com a errada → mensagem genérica; perfil público de B ainda visível; desbloquear → `200` e o mesmo token volta a funcionar. Erros: `{}` `400`, `"true"` (texto) `400`, a si mesmo `400`, outro administrador `403`, `99999` `404`, `abc` `400`.
7. **Rebaixado:** `setAdmin ... off` → o mesmo token do ADMIN dá `403`; promover de novo → `200`.
8. **Itens:** lista com autor e `pendingReportsCount` (conferindo com o banco); busca por texto e `%` → `[]`; a rota comum de excluir com o token do ADMIN → `403`; a do painel → `200`; no banco, as denúncias, notificações e curtidas do item sumiram, o contador do dono caiu, o arquivo saiu do disco; repetir → `404`; `abc` → `400`.
9. **Regressão:** login, perfil, feed, upload, curtir/comentar/seguir, notificações, denunciar e busca (inclusive `q=%25%25`) continuam iguais; token lixo → `401`.

**Checklist desta etapa:**

- [ ] Os nove testes acima executados com sucesso

---

# PARTE B — Frontend

## 8. Contextualização rápida e Checagem de Alcançabilidade

Responda antes de programar (no `checklists.md` ou em um comentário no topo da sua tela):

| Peça | Caminho(s) de clique que você vai construir |
|---|---|
| Painel de administração | barra lateral → seção Administração (só para administrador) → link do painel (aponta para `/admin`, que redireciona) |
| Denúncias | aba Denúncias e o cartão de denúncias pendentes do Dashboard |
| Usuários / Itens | as abas do painel |
| Revisar / Bloquear / Excluir | botões na linha (os dois últimos abrem confirmação; desbloquear é direto) |
| Filtrar / buscar | grupo de botões (Denúncias); campo com debounce (Usuários e Itens) |
| Ver o item / o perfil | miniatura ou título (Denúncias e Itens); `@usuário` (Usuários) |

> ⚠️ **Verifique antes de programar:** no seu `router/index.js`, as quatro rotas `admin-*` existem com `requiresAdmin`? Os quatro arquivos de `views/admin/` existem como placeholders? O link do administrador da sua barra lateral aponta para `/admin`? Ajuste o que faltar e registre no `checklists.md`.

> 💡 **Uma limitação conhecida (não resolva):** a paginação por offset pula itens quando a lista muda entre uma página e a seguinte (você vai ver isso no teste). O conserto (cursor) fica para a Aula 18. Anote no `checklists.md`.

## 9. Etapa 1 — Constantes, Service, `usePaginatedList` e `ConfirmModal`

1. Em `config/constants.js`, acrescente `REPORT_FILTERS` (os três filtros, com os `value` iguais aos da API e os `label` em português).
2. Crie `services/adminService.js` com as sete chamadas (`getAdminDashboard`, `getAdminReports(status, page, limit)`, `reviewAdminReport(id)`, `getAdminUsers(search, page, limit)`, `setUserBlocked(id, isBlocked)`, `getAdmin<Entidades>(search, page, limit)`, `deleteAdmin<Entidade>(id)`). Sem `{ silent: true }`; `patch` sem segundo argumento para a revisão (nunca `null`).
3. **`usePaginatedList`** (Bloco 5): terceiro parâmetro `{ watch: source = null } = {}`; `lastCallId` numerando cada `loadFirstPage` (a resposta só vale se `callId === lastCallId`, no `try`, no `catch` e no `finally`); `loadMore` guarda o `lastCallId` do início e descarta a resposta se ele mudou; `if (source) watch(source, loadFirstPage)`. Confirme que as telas antigas continuam iguais.
4. **`ConfirmModal`** (Bloco 6) sobre o `BaseModal`: props `title`, `message`, `confirmLabel`, `confirmVariant` (padrão `danger`) e `busy`; emit `confirm` e `close`; rodapé com "Cancelar" e o botão de confirmar ("Aguarde..." durante a chamada).

**Checklist desta etapa:**

- [ ] Constantes, service, composable atualizado e `ConfirmModal`
- [ ] Feed, Seguindo, Notificações e Playlists continuam abrindo e carregando mais

## 10. Etapa 2 — Layout, Rotas Aninhadas e a Guarda por Papel

1. **`AdminLayout.vue`** em `components/layout/`: título, `nav` com `aria-label`, `nav-pills` com um `<router-link>` por aba (`active-class="active"`, a rota por nome), e o `<router-view />` embaixo.
2. **Router:** troque as quatro rotas planas por uma rota pai `/admin` (`component` o layout, `redirect: { name: 'admin-dashboard' }`, `meta: { requiresAuth: true, requiresAdmin: true }`) com quatro `children` de path relativo, sem barra e com os mesmos `name` de antes.
3. **Guarda no `beforeEach`**, depois da checagem de `requiresAuth`: se `to.meta.requiresAdmin` e `!currentUser.value?.isAdmin` → `useToast().error('Você não tem permissão para acessar a administração.')` e `return { name: 'feed' }` (importe o `useToast`). Deixe o comentário que diz que quem protege os dados é a API.
4. Não altere a barra lateral: confira que o link `/admin` passa a funcionar sozinho.

**Checklist desta etapa:**

- [ ] `/admin` abre o Dashboard; as abas aparecem com a atual destacada; as telas vêm dentro do layout
- [ ] Visitante → Login (`?redirect=`); usuário comum → Feed com aviso

## 11. Etapa 3 — Dashboard e Denúncias

1. **Dashboard:** `useAsyncData(getAdminDashboard)`; uma lista `cards` (`key`, `label`, `icon`) com `v-for` para os cartões iguais e um cartão à parte, vermelho, que é um `<router-link>` para as denúncias; `stats[card.key]`; botão "Atualizar" (`execute`); ordem `isLoading` → `error` → conteúdo.
2. **Denúncias:** `statusFilter` (`'pending'`) e `usePaginatedList` com a receita lendo `statusFilter.value`, `undefined` no `limit` e `{ watch: statusFilter }`; grupo de botões de filtro (`role="group"`, `:aria-pressed`); `reasonLabels` montado de `REPORT_REASONS` (a chave vira rótulo); em cada linha: miniatura e título (links ao item), autor, motivo, selo de situação, quem denunciou e quando, "revisada em" se houver, e o botão "Marcar como revisada" só para as pendentes.
3. **`markAsReviewed`:** cerca por linha (`busyIds`, `Set` reativo); `await` na API e só depois mudar `report.status` / `report.reviewedAt` com o que a API devolveu; `toast.success(response.message)`; `catch` vazio com um comentário (o toast de erro é do interceptor); `finally` libera a cerca. Nenhum `runOptimistic`.

> ⚠️ **Só `toast.success` nas telas.** O toast de erro das ações é do interceptor; um `toast.error` no seu `catch` duplicaria o aviso.

**Checklist desta etapa:**

- [ ] Dashboard com os cartões e o link para as denúncias; erro `403` mostrado no lugar dos números
- [ ] Denúncias: filtro que recarrega, motivo em português, revisar que espera a API

## 12. Etapa 4 — Usuários e Itens

1. **Usuários:** `typedText` + `term = useDebouncedValue(typedText, SEARCH.DEBOUNCE_MS)`; `usePaginatedList` com `term.value.trim()` e `{ watch: term }` (não `typedText`); o campo de busca fora do bloco `isLoading`; em cada linha, os selos Admin e Bloqueado, o e-mail e a ação certa (`v-if` / `v-else-if` / `v-else`): "Você" (a própria linha), "Administrador", "Desbloquear" (direto) ou "Bloquear" (abre o modal).
2. **`changeBlocked(user, isBlocked)`:** cerca por linha; `await`; depois `user.isBlocked = response.data.isBlocked`; `toast.success`; `userToBlock.value = null` só no sucesso (o modal continua aberto se a API recusar). Um único `<ConfirmModal v-if="userToBlock" ...>` com a mensagem montada com o nome.
3. **Itens:** a mesma busca; em cada linha, a miniatura/título (link), o autor e o selo "N denúncias pendentes" (singular/plural) quando `pendingReportsCount > 0`; botão "Excluir" que guarda o item escolhido numa variável (o interruptor e o dado do modal, como o `userToBlock`); `ConfirmModal` cuja mensagem lista o que será apagado e diz que não dá para desfazer; `confirmDelete` com `isDeleting`, que só depois do sucesso tira o item da lista (`items.value = items.value.filter(...)`), mostra o toast e fecha o modal.

**Checklist desta etapa:**

- [ ] Busca com debounce (uma requisição depois da pausa) e sem perder o foco
- [ ] Bloquear com confirmação (cancelar e falha mantêm o estado); desbloquear direto
- [ ] Excluir item com confirmação que descreve a consequência

## 13. Etapa 5 — Teste Prático Completo

Use duas janelas (a normal logada como ADMIN, promovido antes de entrar no front, e uma anônima logada como B):

1. **Guarda:** visitante em `/admin/dashboard` → Login com `?redirect=`; usuário comum em `/admin/reports` → Feed com aviso e sem a seção Administração na lateral.
2. **O experimento do `localStorage`:** como usuário comum, edite `shortz_user` (`"isAdmin":true`) e dê F5: a seção aparece e o painel abre, mas as telas mostram "Acesso restrito a administradores." e a aba Network mostra `403`. Tire print. Desfaça saindo da conta e entrando de novo.
3. **Layout:** o ADMIN chega pelo clique na lateral (`/admin` → `/admin/dashboard`); quatro abas, a atual destacada; o cartão de pendentes leva às denúncias.
4. **Rebaixar com o painel aberto:** `setAdmin ... off`, clique numa aba → "Acesso restrito" sem recarregar; promova de novo → volta a funcionar.
5. **Denúncias:** motivo em português; com Slow 3G, "Marcar como revisada" mostra "Salvando..." e a linha continua pendente até a resposta; clique duplo → uma requisição; Offline → a linha não muda e há um toast; filtros Pendentes/Revisadas/Todas.
6. **Paginação e o "pulo":** com `PAGE_SIZE = 2` (temporário), carregue a segunda página; depois, revise a primeira linha antes de "Carregar mais" e veja um item deixar de aparecer; "Atualizar" o traz de volta. Desfaça o `PAGE_SIZE`.
7. **Usuários:** busca (nenhuma requisição durante a digitação, uma depois da pausa; `%%` → vazio); "Bloquear" → Cancelar; Offline → modal continua aberto; bloqueio ok → selo; na janela de B, a próxima ação o leva ao Login sem toast, e tentar entrar mostra "Sua conta foi bloqueada..." no formulário; "Desbloquear" direto.
8. **Itens:** busca; selo de denúncias; Excluir → Cancelar; Offline → o modal continua; excluir de verdade → a linha some, as denúncias do item somem da aba Denúncias ("Atualizar"), e o item sumiu da lista do dono.
9. **Regressão:** Feed e "Carregar mais", Seguindo, Notificações, Playlists, sino, Denunciar, busca com debounce, Login/Logout (Console limpo); sessão expirada (`localStorage.setItem(<sua-chave-do-token>, 'lixo')`) → Login, sem toast e sem laço.

**Checklist desta etapa:**

- [ ] Os nove passos acima testados em sequência, sem digitar nenhuma URL (exceto o passo 1, a sessão expirada e o `localStorage`, que pedem a barra de endereço ou o Console)

---

## 14. Entrega

Envie em resposta a esta tarefa:

1. Na subpasta `01 - Docs` do seu projeto frontend, dentro de uma nova subpasta `atividade15`:
   - `guarda-comum.jpg`: o aviso "Você não tem permissão..." depois de um usuário comum tentar abrir o painel;
   - `guarda-localstorage.jpg`: o painel aberto com o `isAdmin` falsificado, a mensagem "Acesso restrito a administradores." e a aba Network com os `403`;
   - `dashboard.jpg`: o Dashboard com os cartões e o das denúncias pendentes em destaque;
   - `denuncias-lista.jpg`: a lista com o filtro, o motivo em português e os selos; `revisar-lenta.jpg`: Slow 3G, o botão "Salvando..." e a linha ainda pendente;
   - `pulo-paginacao.jpg`: o resultado do passo 6 (o item que não apareceu, com a lista do servidor ao lado);
   - `usuarios-busca.jpg`: a aba Network com uma requisição `search=` depois da pausa;
   - `bloquear-modal.jpg`: a confirmação; `bloqueado-login.jpg`: a mensagem "Sua conta foi bloqueada..." no formulário de Login;
   - `itens-excluir.jpg`: a confirmação de exclusão com a consequência descrita;
   - `banco-denuncias.jpg`: o cliente de banco com o `SHOW CREATE TABLE` da tabela de denúncias (`status`, `reviewed_at`, o índice) e a contagem por situação;
   - `controle-bloqueio.jpg` e `controle-isadmin.jpg`: os dois testes de controle da API;
   - Um print de cada `curl` da Parte A, Etapa 5, em `.jpg`;
   - `respostas.md` com um parágrafo curto para cada uma das dez perguntas da Seção 1 ("Você também deve ser capaz de explicar...");
   - Atualize `checklists.md` com todos os checklists desta atividade marcados (e a limitação da paginação por offset anotada).
2. Um `.zip` do seu projeto de back-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-backend.zip`, incluindo o módulo `admin`, `middlewares/auth.js`, `utils/escapeLike.js`, `scripts/setAdmin.js`, o model de denúncia, o `loginUser` e o `app.js` atualizados;
3. Um `.zip` do seu projeto de front-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-frontend.zip`, incluindo o layout, o `ConfirmModal`, o `usePaginatedList.js`, o `adminService.js`, as quatro telas do painel e o `router/index.js` atualizados.

---

## 15. Próxima aula

A Aula 16 é a revisão transversal de experiência de uso: skeletons no lugar do "Carregando...", mensagens padronizadas, responsividade e acessibilidade — é a hora de pagar as dívidas das tabelas de pendências das últimas aulas (a busca e a barra lateral que somem no celular, o sino na Navbar, as abas e as linhas do painel). A trilha da API deve ter pouca coisa nova. **Pergunta para chegar pensando:** abra o painel de administração com a janela estreita (DevTools, modo celular, 375 px). O que acontece com as abas e com as linhas das listas, e qual elemento você tiraria de cada linha para ela caber?
