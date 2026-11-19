# Checklists — PhotoSphere | Atividade 15

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 15 — Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| Rota da lista de itens do painel | `GET /api/admin/videos` | `GET /api/admin/photos` |
| Rota de excluir pelo painel | `DELETE /api/admin/videos/:id` | `DELETE /api/admin/photos/:id` |
| Sua função de excluir (com `isAdmin`) | `videoService.deleteVideo(id, userId, isAdmin)` | `photoService.deletePhoto(id, userId, isAdmin)` |
| Campo de texto da busca de itens | `title` | `title` |
| Id do item nas denúncias | `videoId` | `photoId` |
| Telas e rotas do front | `AdminVideosView`, `admin-videos` | `AdminPhotosView`, `admin-photos` (e `AdminModerationView`/`admin-moderation` para as denúncias) |
| Textos do painel | "Vídeos", "Excluir vídeo", "Denunciado por..." | "Fotos", "Excluir foto", "Denunciado por..." |
| Chave do token no `localStorage` | `shortz_token` / `shortz_user` | `token` / `user` |

---

## ATIVIDADE 15 — PARTE A: Backend (Autorização, Bloqueio e Módulo admin)

**Etapa 1 — Constantes e a coluna de situação da denúncia**

- [X] `REPORT.STATUS` (`PENDING`, `REVIEWED`) e `ADMIN.REPORT_FILTERS` (`pending`, `reviewed`, `all`)
- [X] `reportModel`: `status` `ENUM` `NOT NULL` com padrão `pending`, `reviewedAt` (`DATE`, opcional) e índice `idx_reports_status`
- [ ] Banco com `status` e `reviewed_at` (`SHOW CREATE TABLE reports`); denúncias antigas `pending`

**Etapa 2 — Autorização: `isAuthenticated` com banco, `isAdmin`, login e `setAdmin`**

- [X] `middlewares/auth.js`: `isAuthenticated` assíncrono — try/catch só do token (`401`), `User.findByPk` com os quatro atributos, inexistente → `401`, bloqueado → `401` com a mensagem do bloqueio, `req.user` montado do banco, segundo try/catch com `next(err)`; `isAdmin` (`403` "Acesso restrito a administradores."); os dois exportados
- [X] Extra (pendência do `checkpoint-02.md`): fim do atalho `dev-token` em `auth.js`/`optionalAuth.js` e do login `ADM`/`123456` sem banco no `userController`
- [X] Login: `isBlocked` → `403` "Sua conta foi bloqueada. Entre em contato com a administração.", **depois** da conferência da senha
- [X] `utils/escapeLike.js` extraído do `searchService` (que passou a importá-lo)
- [X] `scripts/setAdmin.js` (`dotenv` no topo, `argv[2]` username, `argv[3] === 'off'` rebaixa, aviso + `exitCode = 1` se não existe, `sequelize.close()` no `finally`)
- [ ] As rotas antigas continuam funcionando; login de bloqueado `403` (senha errada → mensagem genérica); `setAdmin` promovendo e rebaixando

**Etapa 3 — O módulo `admin`**

- [X] Quatro arquivos em `modules/admin/` (`adminValidator`, `adminService`, `adminController`, `adminRoutes`), registrados no `server.js` (o `app.js` do roteiro) depois das rotas de denúncia e antes do 404
- [X] Primeira linha das rotas: `router.use('/admin', isAuthenticated, isAdmin)`; sete rotas (`dashboard`, `reports`, `reports/:id/review`, `users`, `users/:id/block`, `photos`, `photos/:id`)
- [X] Service: `getDashboardStats` (sete contagens em `Promise.all`, chaves `users`, `blockedUsers`, `photos`, `comments`, `likes`, `pendingReports`, `reviewedReports`), `getReports` (`all` = sem filtro, `Reporter` + foto + autor), `reviewReport` (idempotente + `reload()`), `getUsers` (com `email`/flags/contadores, sem `password`, `LIKE` escapado), `setUserBlocked` (`404` → `400` → `403`, grava só se mudar), `getPhotos` (segunda consulta agrupada + `Map` → `pendingReportsCount`)
- [X] A exclusão do painel reaproveita o `deletePhoto(id, userId, true)` — nenhuma linha nova de `destroy`; o `deletePhoto` ganhou o parâmetro `isAdmin = false` e passou a descontar o `photosCount` do **dono** da foto
- [ ] `GET /api/admin/dashboard` sem token responde `401` (e não `404`)

**Etapa 4 — Teste de controle**

- [ ] (a) sem o `if (user.isBlocked)` → o token antigo de B bloqueado continua funcionando; (b) sem o `isAdmin` no `router.use` → usuário comum lê o Dashboard; os dois desfeitos e descritos

**Etapa 5 — Testando (contas ADMIN, A, B e C)**

- [ ] 1. As sete rotas e `/api/admin/rota-inexistente`: `401` sem token, `403` com usuário comum
- [ ] 2. Dashboard com o token do ADMIN emitido antes da promoção → `200`, sete chaves, conferindo com o banco
- [ ] 3. Denúncias: padrão (pendentes, mais nova primeiro, `Reporter`/foto/autor, sem dados sensíveis); `all`, `reviewed`, `xyz` → `400`, `?limit=1&page=2`
- [ ] 4. Revisar: `200` com `reviewedAt`; repetir com o mesmo `reviewedAt`; `99999` `404`; `abc` `400`; token comum `403`; listas e Dashboard acompanham
- [ ] 5. Usuários: `email` e flags sem `password`; busca por username e e-mail; `%%` → `[]`; `?search=a&search=b` sem erro
- [ ] 6. Bloquear: `200`/`200`; token antigo de B → `401` com a mensagem; login de B certo → `403`, errado → genérica; perfil público de B visível; desbloquear → o mesmo token volta; `{}`, `"true"`, a si mesmo → `400`; outro admin `403`; `99999` `404`; `abc` `400`
- [ ] 7. Rebaixado: `setAdmin ... off` → o mesmo token do ADMIN dá `403`; promover de novo → `200`
- [ ] 8. Fotos: autor e `pendingReportsCount`; busca por texto e `%` → `[]`; rota comum com o token do ADMIN → `403`; a do painel → `200`; no banco, denúncias/notificações/curtidas da foto sumiram, o contador do dono caiu, o arquivo saiu do disco; repetir `404`; `abc` `400`
- [ ] 9. Regressão: login, perfil, feed, upload, curtir/comentar/seguir, notificações, denunciar e busca (inclusive `q=%25%25`); token lixo → `401`

---

## ATIVIDADE 15 — PARTE B: Frontend (Layout do Painel, Guarda por Papel e as Quatro Telas)

**Contextualização e Checagem de Alcançabilidade**

| Peça | Caminho(s) de clique construídos |
|---|---|
| Painel de administração | menu do avatar → seção **Administração** (só para administrador) → "Painel de administração" (aponta para `/admin`, que redireciona) |
| Denúncias | aba Denúncias e o cartão vermelho de denúncias pendentes do Dashboard |
| Usuários / Fotos | as abas do painel |
| Revisar / Bloquear / Excluir | botões na linha (bloquear e excluir abrem confirmação; desbloquear é direto) |
| Filtrar / buscar | grupo de botões (Denúncias); campo com debounce (Usuários e Fotos) |
| Ver a foto / o perfil | miniatura ou título (Denúncias e Fotos); `@usuário` (Usuários) |

> **Verificação:** as quatro telas de `views/admin/` existiam como placeholders desde a Aula 01 (`AdminDashboardView`, `AdminCategoriesView`, `AdminUsersView`, `AdminModerationView`), em rotas **planas** com só `requiresAuth` (sem `requiresAdmin`), e não havia nenhum link para `/admin` (o PhotoSphere não tem `TheSidebar.vue`). **O que foi feito:** rota pai `/admin` com `meta: { requiresAuth: true, requiresAdmin: true }` e as filhas `admin-dashboard`, `admin-moderation` (Denúncias), `admin-users` e a nova `admin-photos` (`AdminPhotosView`); a seção "Administração" entrou no menu do avatar, visível só para administrador. **Categorias** (regra de negócio do PhotoSphere, fora do roteiro desta aula) continuam como placeholder em `/admin/categories`, fora das abas.

> **Limitação conhecida (não resolvida):** a paginação por offset pula itens quando a lista muda entre uma página e a seguinte (o "pulo" do teste com `PAGE_SIZE = 2`). O conserto (cursor) fica para a Aula 18.

**Etapa 1 — Constantes, Service, `usePaginatedList` e `ConfirmModal`**

- [X] `REPORT_FILTERS` (os três filtros, `value` igual ao da API, `label` em português)
- [X] `services/adminService.js` com as sete chamadas (sem `silent`; `patch` da revisão sem segundo argumento)
- [X] `usePaginatedList` com o terceiro parâmetro `{ watch }`, `lastCallId` em `loadFirstPage` (no `try`, no `catch` e no `finally`) e no `loadMore` (descarta a resposta se a lista recomeçou)
- [X] `components/base/ConfirmModal.vue` sobre o `BaseModal` (`title`, `message`, `confirmLabel`, `confirmVariant` padrão `danger`, `busy`; emite `confirm` e `close`; "Aguarde..." durante a chamada)
- [ ] Feed, Seguindo, Notificações e Álbuns continuam abrindo e carregando mais

**Etapa 2 — Layout, rotas aninhadas e a guarda por papel**

- [X] `components/layout/AdminLayout.vue`: título, `nav` com `aria-label`, `nav-pills` com um `router-link` por aba (`active-class="active"`) e o `<router-view />`
- [X] Router: rota pai `/admin` (layout, `redirect: { name: 'admin-dashboard' }`, meta no pai) com filhas de path relativo
- [X] Guarda no `beforeEach`, depois do `requiresAuth`: `requiresAdmin` e não admin → `useToast().error('Você não tem permissão para acessar a administração.')` e `{ name: 'feed' }`; comentário dizendo que quem protege os dados é a API
- [ ] `/admin` abre o Dashboard dentro do layout com a aba destacada; visitante → Login (`?redirect=`); usuário comum → Feed com aviso

**Etapa 3 — Dashboard e Denúncias**

- [X] Dashboard: `useAsyncData(getAdminDashboard)`, `cards` com `v-for` e o cartão vermelho (link para as denúncias), "Atualizar" (`execute`), ordem `isLoading` → `error` → conteúdo
- [X] Denúncias: `statusFilter` + `usePaginatedList(..., undefined, { watch: statusFilter })`, grupo de botões (`role="group"`, `:aria-pressed`), `reasonLabels` a partir de `REPORT_REASONS`, linha com miniatura/título, autor, motivo, situação, quem denunciou e quando, "revisada em"
- [X] `markAsReviewed`: cerca por linha, `await` e só depois atualiza `status`/`reviewedAt`, `toast.success(response.message)`, `catch` vazio comentado, `finally` libera; sem `runOptimistic`
- [ ] Dashboard com o link e o `403` no lugar dos números; filtro que recarrega; revisar que espera a API

**Etapa 4 — Usuários e Fotos**

- [X] Usuários: `typedText` + `term` (debounce) e `usePaginatedList(..., undefined, { watch: term })`, campo fora do bloco `isLoading`, selos Admin/Bloqueado, e-mail, ação certa por linha ("Você", "Administrador", "Desbloquear", "Bloquear")
- [X] `changeBlocked`: cerca, `await`, `user.isBlocked` com o valor da API, `toast.success`, `userToBlock = null` só no sucesso; um único `ConfirmModal v-if="userToBlock"`
- [X] Fotos: a mesma busca, miniatura/título, autor, selo "N denúncias pendentes" (singular/plural), "Excluir" com `photoToDelete`, `ConfirmModal` descrevendo o que será apagado, `confirmDelete` com `isDeleting` que só depois do sucesso tira a linha, mostra o toast e fecha
- [ ] Busca com debounce sem perder o foco; bloquear com confirmação (cancelar e falha mantêm o estado); desbloquear direto; excluir com confirmação

**Etapa 5 — Teste Prático Completo**

- [ ] Os nove passos testados em sequência, sem digitar nenhuma URL (exceto o passo 1, a sessão expirada e o `localStorage`)
