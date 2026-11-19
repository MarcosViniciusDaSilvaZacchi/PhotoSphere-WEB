# Checklists — PhotoSphere | Atividade 14

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 14 — Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| O model de notificação | `Notification` (tabela `notifications`, módulo `notification`) | `Notification` (tabela `notifications`, módulo `notification`) |
| O model de denúncia | `Report` (tabela `reports`, módulo `report`) | `Report` (tabela `reports`, módulo `report`) |
| Id do item nas duas tabelas | `videoId` | `photoId` |
| Rota da denúncia | `POST /api/videos/:videoId/report` | `POST /api/photos/:photoId/report` |
| Texto da notificação de "curtiu" | "curtiu o seu vídeo" | "curtiu sua foto" |
| Texto da notificação de "comentou" | "comentou no seu vídeo" | "comentou na sua foto" |
| Tela e componentes | `NotificationsView`, `ReportVideoModal` | `NotificationsView`, `ReportPhotoModal` |
| Os três gatilhos | `toggleLike`, `addComment`, `toggleFollow` | `likeService.toggleLike`, `commentService.createComment`, `followService.toggleFollow` |

---

## ATIVIDADE 14 — PARTE A: Backend (Notificações e Denúncias)

**Etapa 1 — Constantes, Models e Associações**

- [X] `NOTIFICATION.TYPES` (`LIKE`, `COMMENT`, `FOLLOW`) e `REPORT.REASONS` (as cinco chaves) em `config/constants.js`
- [X] `notificationModel.js` (`userId`, `actorId`, `type` `ENUM`, `photoId` opcional, `isRead` padrão `false`; índices `idx_notifications_user_read (user_id, is_read)` e `idx_notifications_photo_id`)
- [X] `reportModel.js` (`userId`, `photoId` obrigatório, `reason` `ENUM`; índice único `idx_unique_report_user_photo (user_id, photo_id)` e `idx_reports_photo_id`)
- [X] Cinco associações, só `belongsTo`: `Recipient` e `Actor` (+ a foto) na notificação; `Reporter` (+ a foto) na denúncia
- [X] Tabelas, índices, `ENUM` e `ON DELETE` (`NO ACTION` em `reports`, `SET NULL` em `notifications`) conferidos no banco

**Etapa 2 — O Módulo de Notificações**

- [X] Quatro arquivos (`notificationModel`, `notificationService`, `notificationController`, `notificationRoutes`), registrados no `server.js` antes do 404
- [X] `createNotification` (nada quando `userId === actorId`, `{ transaction }`), `removeNotification` (quatro dados no `where`), `getUserNotifications` (`Actor` público + foto; `createdAt`/`id` DESC; `limit`/`offset`), `getUnreadCount`, `markAsRead` (`404` → `403`, só escreve se ainda não lida, `unreadCount` contado depois)
- [X] Rotas: `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read` (todas com `isAuthenticated`); `PATCH` acrescentado aos métodos do CORS
- [X] `GET .../notifications` sem token responde `401`

**Etapa 3 — O Módulo de Denúncias**

- [X] Quatro arquivos do módulo `report` (`reportValidator`, `reportService`, `reportController`, `reportRoutes`), registrados no `server.js`
- [X] A ordem dos erros: `401` → `400` (motivo) → `400` (id) → `404` → `400` (própria foto) → `409`; resposta `201` com só `{ id, photoId, reason }`; sem transação e sem notificar o dono

**Etapa 4 — Revisitas**

- [X] Curtir cria o aviso ao curtir e o apaga ao descurtir; comentar cria o aviso; seguir cria ao seguir e apaga ao deixar de seguir — todos dentro da transação, com o `t`, e com os comentários "três escritas"/"quatro escritas" atualizados
- [X] `deletePhoto` apaga as denúncias e as notificações da foto antes do `destroy` da foto (filhas antes do pai)
- [X] `cors` antes do `express.json()` no `server.js` (o `app.js` do roteiro) — **já estava nessa ordem desde a Aula 01**; ficou registrado com um comentário explicando o porquê
- [X] Teste de controle feito e descrito (as duas partes: `500` da chave de `reports` e a notificação órfã com `photo_id` `NULL`)

**Etapa 5 — Testando (contas A, B e C)**

- [X] 1. Sem token: as quatro rotas respondem `401`
- [X] 2. Curtir: B ganha 1 não lida com `Actor` (sem `password`/`email`/`isAdmin`) e a foto; A curtindo a própria continua com 0; descurtir apaga; curtir de novo → uma só
- [X] 3. Comentar: C comenta → B ganha; B no próprio → não ganha
- [X] 4. Seguir: aviso de `follow` com `photoId` nulo; deixar de seguir apaga; seguir de novo cria
- [X] 5. Lista: mais nova primeiro, `?limit=1&page=2`, além do fim `[]`, `?page=abc&limit=-5` → padrões; C só vê as dela
- [X] 6. Marcar como lida: outra conta `403`; inexistente `404`; `abc` `400`; a dona `200` com `unreadCount` menor; repetir `200` com o mesmo número
- [X] 7. Denúncia: `201`; repetir `409`; outra conta `201`; sem `reason`, fora da lista e o rótulo → `400`; `abc` `400`; `99999` `404`; o dono `400`; sem token `401`; o dono não ganha notificação
- [X] 8. No banco: linha repetida em `reports` → `Duplicate entry`; motivo fora do `ENUM` → `Data truncated for column 'reason'`
- [X] 9. Excluir a foto com denúncias e curtidas/comentários de duas pessoas: sem linhas da foto nas duas tabelas e sem notificações órfãs (exceto `follow`)
- [X] 10. Logout com `-d "null"` → `400` com `Access-Control-Allow-Origin`
- [X] 11. Regressão: curtir, comentar, seguir e listas, álbuns, busca, feed, upload, edição; `GET /users/abc/followers` → `400`

---

## ATIVIDADE 14 — PARTE B: Frontend (Sino, Notificações e Denúncia)

**Contextualização e Checagem de Alcançabilidade**

| Peça | Caminho(s) de clique construídos |
|---|---|
| Notificações | sino na Navbar (em todas as telas, para quem está logado) |
| Marcar como lida | botão na linha e clique na própria notificação |
| Ir ao que gerou o aviso | clique no texto: foto (curtir/comentar) ou perfil (seguir) |
| Ver as mais antigas / as novas | "Carregar mais notificações" no fim / "Atualizar" no topo |
| Denunciar | botão "Denunciar" no Detalhe da foto (visitante → login → volta; o dono não o vê) |

> **Verificação da rota:** não existia rota nem placeholder de notificações no PhotoSphere. **O que foi feito:** criada `views/NotificationsView.vue` e a rota `/notifications` (`name: 'notifications'`, `requiresAuth`), o mesmo nome usado pelo sino em `{ name: 'notifications' }`.

> **Lacuna conhecida (decisão de escopo):** a lista de notificações não se atualiza sozinha; só o número do sino (polling). Para ver as novas na lista, "Atualizar".

**Etapa 1 — Constantes, Services e a Store**

- [X] `NOTIFICATIONS.POLL_MS` (30000), `NOTIFICATION_TEXT` (`like`, `comment`, `follow`) e `REPORT_REASONS` (as cinco chaves, na ordem, com os rótulos)
- [X] `services/notificationService.js` (`getNotifications(page = 1, limit = PAGE_SIZE)`, `getUnreadCount`, `markNotificationAsRead`) e `services/reportService.js` (`{ silent: true }` no 3º argumento)
- [X] `stores/notifications.js` (estilo setup): `unreadCount`, `refresh` (com `lastRefreshId` e `catch` vazio), `setUnreadCount` (sobe o `lastRefreshId`), `refreshIfVisible`, `startPolling` (`if (timerId !== null) return`, `refresh()` imediato, `setInterval`, `visibilitychange`) e `stopPolling` (desfaz tudo e zera)
- [X] `removeEventListener` recebe a mesma referência (`refreshIfVisible`) do `addEventListener`

**Etapa 2 — O Sino na Navbar**

- [X] Na `AppNavbar.vue` (a `TheNavbar.vue` do roteiro): a store, as `computed` do número e do selo (`99+`), o `watch(isAuthenticated, ..., { immediate: true })` com `startPolling`/`stopPolling` e o `onUnmounted` com `stopPolling`
- [X] Só para quem está logado: `router-link` com aparência de botão, `position-relative`, ícone do sino, selo `v-if="unreadCount > 0"` com `position-absolute top-0 start-100 translate-middle`, e `aria-label` com o número ("Notificações (3 não lidas)")
- [X] Extra: a regra de CSS que trocava o ícone ativo por um coração ficou restrita ao link de Curtidas (senão o sino ativo viraria um coração)
- [X] O número se atualiza sozinho; um só temporizador depois de logins e logouts repetidos; nenhuma requisição depois de sair

**Etapa 3 — A Tela de Notificações**

- [X] `usePaginatedList(getNotifications)` com "Carregar mais" e "Atualizar" (`reload`); estado vazio com instrução; ordem `isLoading` → `error` → conteúdo
- [X] Uma linha por notificação: avatar de quem agiu, `@usuário` + `NOTIFICATION_TEXT[type]` + o título da foto, a data; não lidas em destaque (fundo e negrito)
- [X] `markAsRead` com `runOptimistic` (sem alterar `utils/optimistic.js`): `apply` marca e desconta 1 (`Math.max(0, ...)`), `undo` relativo (`+ 1`), `confirm` entrega o `unreadCount` da API à store; cerca por linha (`busyIds`) liberada no `.finally`
- [X] Dois caminhos para marcar: o botão (sem sair) e o clique no texto (`@click` + navega: `follow` → perfil; o resto → foto)
- [X] Lista, estado vazio, "Atualizar", "Carregar mais", otimista, rollback com toast, clique duplo = uma requisição, e o sino certo com duas linhas falhando juntas

**Etapa 4 — Denunciar e a Correção do Logout**

- [X] `ReportPhotoModal.vue`: `BaseModal` com o botão `type="submit"` + `form="report-photo-form"`, `novalidate`, `<fieldset :disabled="isSubmitting">` com `<legend>` e os cinco rádios (`v-for` em `REPORT_REASONS`, mesmo `name`, `:value` = a chave, `v-model`), motivo obrigatório sem chamar a API, erro da API dentro do modal, emite `reported`
- [X] No Detalhe: botão "Denunciar" com `v-if="!photo.isOwner"`, a cerca do `useAuthenticatedAction` e o modal num `v-if`; `handleReported` fecha e mostra `toast.success`
- [X] Logout: `api.post('/logout', undefined, { silent: true })` no `authService`
- [X] Modal testado (motivo obrigatório; Offline e 409 dentro do modal, sem toast; toast de sucesso); o dono não vê o botão; logout com o Console limpo

**Etapa 5 — Teste Prático Completo**

- [X] Os nove passos testados em sequência, a partir do login, sem digitar nenhuma URL (exceto a sessão expirada, que pede o Console)
