# Atividade Prática - Aula 14

## Notificações e Denúncias na Entidade Principal (Trilhas API + Frontend)

**Baseado em:** roteiro da Aula 14 — trilha API (Shortz-App API) e roteiro da Aula 14 — trilha Frontend (Shortz-App)

**Aplicação:** este enunciado vale para qualquer projeto sorteado na Lista de Projetos para Programação Web — use a mesma ficha de preparação das aulas anteriores, reaproveitando os campos já preenchidos (nome do model da sua entidade, nome da tabela, rota, o campo de texto principal). Hoje há dois conceitos novos de domínio: a **notificação** (um aviso para o dono de um item, gerado quando outra pessoa curte, comenta ou segue — as três ações que você já construiu nas Atividades 10 e 11) e a **denúncia** (uma pessoa avisa a moderação de que um item do seu sistema merece revisão). O trabalho tem uma parte que depende da sua entidade (os nomes e os textos) e uma parte idêntica para todo mundo (o polling do sino, os motivos de denúncia, o desfazer relativo). O Grupo A/B não altera nada.

**Pré-requisito:** Atividade 13 concluída nas duas trilhas — na API, `utils/parseId.js`, `utils/pagination.js`, a transação do `deleteVideo` (a do seu item) já limpando as coleções, e o módulo de coleções; no front, `utils/optimistic.js` (`runOptimistic`), `useAuthenticatedAction`, `usePaginatedList`, o `BaseModal`, o modal "Salvar" e o Detalhe do item com o botão "Salvar"; e três contas de usuário para os testes (uma delas com pelo menos um item da sua entidade enviado).

> ⚠️ **Ordem de execução:** faça a Parte A (API) antes da Parte B (Frontend), como nas atividades anteriores.

---

## 1. Objetivo

Ao final desta atividade, você deve ter, no seu próprio projeto:

**Do lado do back-end (API):**

- Duas tabelas novas — a de notificações (`userId` de quem recebe, `actorId` de quem agiu, `type` como `ENUM` de `like` / `comment` / `follow`, o id do item opcional, `isRead` com padrão `false`, índice `(user_id, is_read)` e índice no id do item) e a de denúncias (`userId`, id do item, `reason` como `ENUM` com cinco motivos fixos, índice único `(user_id, <item>_id)` e índice no id do item);
- As rotas: listar as minhas notificações (paginada), `GET .../notifications/unread-count`, marcar como lida (idempotente) e `POST /api/<suas-entidades>/:<entidade>Id/report`;
- Notificações geradas dentro das mesmas transações de curtir, comentar e seguir — criadas quando a ação nasce, removidas quando é desfeita (curtir/seguir), e nunca para quem agiu sobre si mesmo;
- A denúncia com validação do motivo, o primeiro `409` do curso (denunciar de novo) e a regra "não se denuncia o próprio item";
- A exclusão da sua entidade limpando também as denúncias e as notificações do item;
- A correção da ordem dos middlewares no `app.js` (o `cors` antes dos parsers).

**Do lado do front-end:**

- O sino na Navbar, com o número de não lidas, alimentado por uma store com polling (`setInterval`) que liga ao entrar na conta, desliga ao sair e não pergunta com a aba escondida;
- A tela "Notificações": lista paginada, não lidas em destaque, marcar como lida com atualização otimista (e rollback) por `runOptimistic` — o quarto caso, sem alterar `utils/optimistic.js` —, clique que navega e marca, e o botão "Atualizar";
- O botão "Denunciar" no Detalhe do item (invisível para o dono) com um modal de rádio: motivo obrigatório, erro da API dentro do modal, toast de sucesso;
- A correção do logout (`null` → `undefined`) — o Console limpo ao sair da conta.

**Você também deve ser capaz de explicar com suas palavras:**

1. Por que a notificação é criada dentro da mesma transação da curtida/comentário/seguida, e o que acontece (sintoma e causa) se você esquecer de repassar a transação;
2. As regras de uma notificação verdadeira: por que ninguém é avisado das próprias ações, por que descurtir apaga o aviso e por que comentar não tem "desfazer";
3. Por que existe uma rota `unread-count` separada da lista, e o que cada um dos dois índices de `notifications` acelera;
4. Por que denunciar de novo responde `409` (e não o `200` de "adicionar à coleção"), e o que garante isso mesmo com dois cliques simultâneos;
5. As duas defesas do motivo da denúncia (o validator e o `ENUM`) e por que o banco guarda chaves e a tela mostra rótulos;
6. Os três comportamentos de chave estrangeira ao excluir um item (`CASCADE`, `NO ACTION`, `SET NULL`) e o que você viu no teste de controle;
7. Como o polling se mantém correto: por que 30 segundos, quem liga e quem desliga, para que serve o `if (timerId !== null)` e por que a aba escondida não pergunta;
8. A corrida do contador: a história (resposta velha do polling sobrescrevendo o número novo) e por que `setUnreadCount` também sobe o `lastRefreshId`;
9. O que muda e o que não muda no quarto caso do `runOptimistic`, e por que o desfazer do contador do sino é relativo (`+ 1`) e não um "volte ao número que eu vi";
10. Por que um `400` do logout aparecia como erro de CORS no Console, e o que a ordem dos middlewares tem a ver com isso.

---

## 2. Antes de começar: adapte os nomes à sua entidade

Preencha (acrescente à ficha das aulas anteriores) e use nos nomes de arquivos, rotas e telas:

| Nome | Exemplo (Shortz-App) | O seu projeto |
|---|---|---|
| O model de notificação | `Notification` (tabela `notifications`, módulo `notification`) | |
| O model de denúncia | `Report` (tabela `reports`, módulo `report`) | |
| Id do item nas duas tabelas | `videoId` | `<entidade>Id` |
| Rota da denúncia | `POST /api/videos/:videoId/report` | `POST /api/<suas-entidades>/:<entidade>Id/report` |
| Texto da notificação de "curtiu" | "curtiu o seu vídeo" | "curtiu o seu/sua `<entidade>`" |
| Texto da notificação de "comentou" | "comentou no seu vídeo" | |
| Tela e componentes | `NotificationsView`, `ReportVideoModal` | `NotificationsView`, `Report<Entidade>Modal` |
| Os três gatilhos (suas funções que já existem) | `toggleLike`, `addComment`, `toggleFollow` | os services da sua Atividade 10 e 11 |

> 💡 **Quais gatilhos?** Os do seu projeto: as funções de curtir, comentar e seguir que você construiu nas Atividades 10 e 11 (o nome da entidade muda; a estrutura é a mesma). Se o seu "curtir" tem outro nome no domínio (favoritar, aplaudir...), a regra é a mesma: o aviso vai para o dono do item.

> 💡 **Os cinco motivos de denúncia são fixos para todos os projetos:** `inappropriate_content`, `harassment`, `spam`, `copyright`, `other` (rótulos: Conteúdo impróprio, Assédio ou discurso de ódio, Spam ou golpes, Violação de direitos autorais, Outro). Não invente outros: a Aula 15 vai ler estas denúncias com a mesma lista.

---

# PARTE A — Backend

## 3. Etapa 1 — Constantes, Models e Associações

1. Em `config/constants.js`, acrescente os blocos `NOTIFICATION` (`TYPES` com `LIKE`, `COMMENT` e `FOLLOW`) e `REPORT` (`REASONS` com as cinco chaves).
2. Crie o model de notificação (Bloco 4.1 do roteiro): `userId`, `actorId` (ambos `references: users`), `type` como `ENUM(...Object.values(NOTIFICATION.TYPES))`, o id do item com `allowNull: true`, `isRead` com `defaultValue: false`; índices `[user_id, is_read]` e `[<item>_id]`.
3. Crie o model de denúncia (Bloco 4.2): `userId`, id do item (`allowNull: false`), `reason` como `ENUM(...REPORT.REASONS)`; índice único `[user_id, <item>_id]` e índice em `<item>_id`.
4. Em `config/associations.js`, importe os dois models e declare as cinco associações do Bloco 4.3 (`belongsTo` com os apelidos `Recipient` e `Actor` para a notificação; `Reporter` para a denúncia; e uma para o item em cada um). Só o sentido `belongsTo`: o `ON DELETE` depende disso.
5. Reinicie a API e confira no banco: as duas tabelas, os índices, os `ENUM` e — com `SHOW CREATE TABLE` das duas — os `ON DELETE` (`NO ACTION` em `reports`, `SET NULL` em `notifications`; anote: você vai precisar na Etapa 4).

**Checklist desta etapa:**

- [ ] Constantes, dois models e cinco associações
- [ ] Tabelas, índices, `ENUM` e chaves estrangeiras conferidos no banco

## 4. Etapa 2 — O Módulo de Notificações

Siga os Blocos 5 e 7 do roteiro de API. O conteúdo é o mesmo, trocando os nomes:

- **Service:**
  - `createNotification({ userId, actorId, type, <item>Id = null }, transaction)`: não faz nada quando `userId === actorId`; usa `Notification.create(..., { transaction })`;
  - `removeNotification({ ... }, transaction)`: `destroy` com os quatro dados no `where` (e o valor padrão `null` no id do item);
  - `getUserNotifications(userId, page, limit)`: `include` de quem agiu (`as: 'Actor'`, só os atributos públicos) e do item (só `id`, o campo de texto principal e a imagem); `order` por `createdAt` decrescente e `id` decrescente (desempate); `limit` e `offset: (page - 1) * limit`;
  - `getUnreadCount(userId)`: `count` com `isRead: false`;
  - `markAsRead(id, userId)`: `404` → `403` (a ordem de sempre), só escreve se ainda não estava lida, devolve `{ id, isRead: true, unreadCount }` com o número calculado depois da escrita.
- **Controller:** `parsePagination` na lista; `{ unreadCount }` num objeto; `parseId(req.params.id, 'notificação')`; o `userId` sempre do token.
- **Rotas:** as três com `isAuthenticated`; registre no `app.js` antes do 404 e do `errorHandler`.

> ⚠️ **Dois pontos em que quase todo mundo erra:** (1) esquecer o segundo argumento (`t`) do `createNotification` — a requisição trava e, uns 50 segundos depois, responde `500` "Lock wait timeout exceeded"; (2) devolver o `unreadCount` antes de esperar o `update` terminar.

**Checklist desta etapa:**

- [ ] Quatro arquivos do módulo, registrados no `app.js`
- [ ] `GET .../notifications` sem token responde `401`

## 5. Etapa 3 — O Módulo de Denúncias

Siga o Bloco 6 do roteiro de API:

- **Validator:** `body('reason').isIn(REPORT.REASONS)` com a mensagem "Escolha um motivo válido para a denúncia." (a função `validate` é a mesma dos outros validators);
- **Service:** o item existe? (`404`) → é meu? (`400` "Você não pode denunciar o seu próprio ...") → `findOrCreate` por `(userId, <item>Id)` e `409` "Você já denunciou ..." quando `created` é `false`. Sem transação (é uma escrita só) e sem notificar o dono;
- **Controller:** `parseId` no id da URL; responde `201` com só `{ id, <item>Id, reason }`;
- **Rota:** `isAuthenticated` → `reportValidator` → `asyncHandler(controller)`, nessa ordem; registre no `app.js`.

**Checklist desta etapa:**

- [ ] Quatro arquivos do módulo `report` (`Validator`, `Service`, `Controller`, `Routes`), registrados no `app.js`
- [ ] A ordem dos erros: `401` → `400` (motivo) → `400` (id) → `404` → `400` (próprio item) → `409`

## 6. Etapa 4 — Revisitas: as Notificações Nascem nos Três Services (e a Exclusão Limpa Mais Duas Tabelas)

Siga os Blocos 8 e 9 do roteiro de API. Em cada service, o trabalho é o mesmo: importar as funções do módulo de notificações e acrescentar uma linha dentro da transação que ele já abre.

1. **Curtir:** no toggle do seu "curtir", importe `createNotification` / `removeNotification` e `NOTIFICATION`, e — dentro da transação, com o `t` — crie o aviso quando a curtida nasce (destinatário: o dono do item; `actorId`: quem curtiu) e apague-o quando é desfeita. Atualize o comentário da transação ("três escritas").
2. **Comentar:** crie o aviso junto do comentário, na transação do `addComment`. Só criar; a API não exclui comentários.
3. **Seguir:** crie o aviso quando passa a seguir (destinatário: quem é seguido; sem id de item) e apague-o ao deixar de seguir. Atualize o comentário ("quatro escritas").
4. **Excluir o item:** na transação do `delete<Entidade>`, antes do `destroy` do item, apague as denúncias e as notificações do item (importe os dois models). A ordem é a de sempre: filhas antes do pai.
5. **`app.js`:** mova o `app.use(cors(...))` para antes do `express.json()` (Bloco 9 do roteiro).

**Teste de controle (obrigatório):**

- **(a)** Comente o `destroy` das denúncias, crie um item novo, curta e denuncie com outra conta e exclua o item: `500` citando a chave estrangeira de `reports`. Anote a mensagem. Desfaça.
- **(b)** Comente o `destroy` das notificações, repita o preparo (um item novo, curtido por outra conta) e exclua o item: `200`, e no banco sobra uma notificação com o id do item `NULL` (`SELECT ... WHERE <item>_id IS NULL AND type <> 'follow'`). Anote o que viu. Desfaça e apague a linha órfã.

Descreva o que viu nos dois testes no `respostas.md` (pergunta 6).

**Checklist desta etapa:**

- [ ] As três ações criam o aviso dentro da transação, com o `t`; curtir e seguir também o apagam ao desfazer
- [ ] Exclusão do item limpa denúncias e notificações, antes do `destroy` do item
- [ ] `cors` antes do `express.json()` no `app.js`
- [ ] Teste de controle feito e descrito (as duas partes)

## 7. Etapa 5 — Testando

Faça os testes do Bloco 11 do roteiro de API, adaptados aos seus nomes (três contas, A, B e C; o JSON do `-d` com aspas escapadas no CMD):

1. **Sem token:** as quatro rotas respondem `401`.
2. **Curtir:** A curte o item de B → B tem 1 não lida e a lista traz o aviso com `Actor` (sem `password` / `email` / `isAdmin`) e o item; A curtindo o próprio item → A continua com 0; descurtir apaga o aviso; curtir de novo → uma só.
3. **Comentar:** C comenta no item de B → B ganha um aviso; B comentando no próprio item não ganha.
4. **Seguir:** A segue B → aviso de `follow` com `videoId`/item nulo; deixar de seguir o apaga; seguir de novo cria um.
5. **Lista:** ordem (a mais nova primeiro), `?limit=1&page=2`, página além do fim → `[]`, `?page=abc&limit=-5` → padrões; a conta C vê só as dela.
6. **Marcar como lida:** outra conta `403`; id inexistente `404`; `abc` `400`; a dona `200` com `unreadCount` menor; repetir `200` com o mesmo número; a lista e o `unread-count` refletem.
7. **Denúncia:** `201`; repetir `409`; outra conta denuncia o mesmo item `201`; sem `reason`, `reason` fora da lista e o rótulo em vez da chave → `400`; `abc` `400`; `99999` `404`; o dono denunciando `400`; sem token `401`; o dono não ganha notificação.
8. **No banco:** a linha repetida em `reports` → `Duplicate entry ... idx_unique_...`; um motivo fora do `ENUM` → `Data truncated for column 'reason'`.
9. **Excluir o item** com denúncias e curtidas/comentários de duas pessoas: as duas tabelas ficam sem linhas do item, sem notificações com id de item `NULL` (exceto `follow`).
10. **O erro do logout:** `curl -i -X POST ... -H "Origin: ..." -H "Content-Type: application/json" -d "null"` → `400` com o cabeçalho `Access-Control-Allow-Origin`.
11. **Regressão:** curtir (`201` / `200`), comentar, seguir e as duas listas, coleções, busca, feed, upload, edição; `GET /users/abc/followers` → `400`.

**Checklist desta etapa:**

- [ ] Os onze testes acima executados com sucesso

---

# PARTE B — Frontend

## 8. Contextualização rápida e Checagem de Alcançabilidade

Responda antes de programar (no `checklists.md` ou em um comentário no topo da sua tela):

| Peça | Caminho(s) de clique que você vai construir |
|---|---|
| Notificações | sino na Navbar (visível em todas as telas, para quem está logado) |
| Marcar como lida | botão na linha e clique na própria notificação |
| Ir ao que gerou o aviso | clique no texto: item (curtir/comentar) ou perfil (seguir) |
| Ver as mais antigas / as novas | "Carregar mais" no fim / "Atualizar" no topo |
| Denunciar | botão "Denunciar" no Detalhe (visitante → login → volta; o dono não o vê) |

> ⚠️ **Verifique antes de programar:** no seu `router/index.js`, existe a rota das notificações, com `requiresAuth` e o mesmo nome que a Navbar vai usar em `{ name: ... }`? O arquivo da tela existe como placeholder? Ajuste o que faltar e registre no `checklists.md`.

> 💡 **Uma lacuna conhecida (não resolva):** a lista de notificações não se atualiza sozinha; só o número do sino. Anote no `checklists.md` como decisão de escopo.

## 9. Etapa 1 — Constantes, Services e a Store

1. Em `config/constants.js`, acrescente `NOTIFICATIONS.POLL_MS` (30000), `NOTIFICATION_TEXT` (as chaves `like`, `comment`, `follow`, com os seus textos) e `REPORT_REASONS` (as cinco chaves, na ordem, com os rótulos).
2. Crie `services/notificationService.js` (`getNotifications(page = 1, limit = PAGE_SIZE)`, `getUnreadCount`, `markNotificationAsRead`) e `services/reportService.js` (`{ silent: true }` no terceiro argumento).
3. Crie `stores/notifications.js` (Bloco 5 do roteiro de Front), no estilo setup: `unreadCount`; `refresh` com `lastRefreshId` e `catch` vazio; `setUnreadCount` que sobe o `lastRefreshId`; `refreshIfVisible` (`document.visibilityState`); `startPolling` (com `if (timerId !== null) return`, `refresh()` imediato, `setInterval` e o `visibilitychange`); `stopPolling` (desfaz tudo e zera o número).

**Checklist desta etapa:**

- [ ] Constantes, os dois services e a store com as cinco funções
- [ ] `removeEventListener` recebe a mesma referência do `addEventListener`

## 10. Etapa 2 — O Sino na Navbar

1. Na `TheNavbar.vue`: a store, as duas `computed` (`unreadCount` e o texto do selo, com `99+`), o `watch(isAuthenticated, ..., { immediate: true })` chamando `startPolling` / `stopPolling`, e o `onUnmounted` com `stopPolling`.
2. No `<template>`, só para quem está logado: um `<router-link>` com a aparência de botão, `position-relative`, o ícone do sino, o selo (`v-if="unreadCount > 0"`, `position-absolute top-0 start-100 translate-middle`) e um `aria-label` que diz o número ("Notificações (3 não lidas)").

**Checklist desta etapa:**

- [ ] O sino aparece só para quem está logado; o selo só com não lidas
- [ ] O número se atualiza sozinho; um só temporizador depois de logins e logouts repetidos; nenhuma requisição ao sair da conta

## 11. Etapa 3 — A Tela de Notificações

Substitua o placeholder pela tela (Bloco 7 do roteiro de Front):

1. `usePaginatedList(getNotifications)` (com "Carregar mais") e o botão "Atualizar" (o `reload`); estado vazio com instrução; ordem `isLoading` → `error` → conteúdo.
2. Uma linha por notificação: avatar de quem agiu (`getProfilePictureUrl`), o texto (`@usuário` + `NOTIFICATION_TEXT[type]` + o título do item se houver), a data; as não lidas em destaque (fundo e negrito).
3. `markAsRead` com `runOptimistic`: `apply` marca a linha e subtrai 1 do sino (com `Math.max(0, ...)`), e devolve o `undo` — que restaura a linha e soma 1 (a operação inversa, e não o número que a linha viu); `request` é a receita; `confirm` acerta a linha e entrega à store o `unreadCount` da API; o `.finally` libera a cerca por linha (`busyIds`, um `Set` reativo). Nenhuma alteração em `utils/optimistic.js`.
4. Dois caminhos para marcar: o botão (marca sem sair) e o clique no `router-link` do texto (`@click` + navega: `follow` → perfil; o resto → item).

> ⚠️ **Só `toast.success` nas telas.** O toast de erro do "Marcar como lida" é do interceptor; um `toast.error` no seu `catch` duplicaria o aviso.

**Checklist desta etapa:**

- [ ] Lista paginada, estado vazio, "Atualizar" e "Carregar mais"
- [ ] Marcar como lida: otimista, rollback com toast, uma requisição por clique duplo, e o sino certo mesmo com duas linhas falhando juntas

## 12. Etapa 4 — Denunciar e a Correção do Logout

1. **`Report<Entidade>Modal`** (Bloco 8.1 do roteiro de Front): `BaseModal` com o botão do rodapé `type="submit"` e `form="<id-do-form>"`; `novalidate`; um `<fieldset :disabled="isSubmitting">` com um `<legend>` e os cinco rádios (`v-for` em `REPORT_REASONS`, mesmo `name`, `:value` = a chave, `v-model`); motivo obrigatório ("Escolha um motivo para continuar.", sem chamar a API); `:busy` no modal; o erro da API (`error.message`) dentro do modal; emite `reported`.
2. **No Detalhe do item:** botão "Denunciar" com `v-if="!<item>.isOwner"`, a "cerca" do `useAuthenticatedAction` e um interruptor `v-if` para o modal, dentro do bloco que já tem o item carregado; o `handleReported` fecha e mostra `toast.success`.
3. **O logout:** no `authService`, troque `api.post('/logout', null, { silent: true })` por `undefined` no segundo argumento. Confirme: sair da conta sem erro vermelho no Console.

**Checklist desta etapa:**

- [ ] Modal com os cinco rádios; motivo obrigatório; erro dentro do modal e sem toast; toast de sucesso
- [ ] O dono do item não vê o botão "Denunciar"
- [ ] Logout com o Console limpo

## 13. Etapa 5 — Teste Prático Completo (só de clique em clique)

Use duas janelas (a normal logada como B e uma anônima logada como A, para gerar as notificações):

1. **Sino:** o visitante não vê o sino; B vê sem número; A curte, comenta e segue; em até 30 s o selo mostra 3 sem recarregar; logout/login três vezes → uma requisição a cada 30 s; ao sair, nenhuma.
2. **Intervalo curto (experimento):** troque `POLL_MS` por 5000, confirme que o número muda em até 5 s e que, com a aba escondida, não há requisições (e uma imediata ao voltar). Desfaça.
3. **Lista:** o sino abre a lista (a mais nova primeiro, não lidas em destaque); marcar como lida muda na hora (Slow 4G); Offline → a linha volta, o sino volta, toast vermelho; duas linhas com Slow 4G e depois Offline → o sino volta ao número do começo; clique duplo → uma requisição.
4. **Navegar:** clicar na notificação leva ao perfil (seguir) ou ao item (curtir/comentar) e a marca como lida.
5. **Atualizar e paginar:** "Atualizar" traz a nova; com mais de 12 notificações, "Carregar mais notificações" traz o resto.
6. **Denúncia:** o visitante é levado ao login e volta; o dono não vê o botão; sem motivo → mensagem sem requisição; Offline → erro dentro do modal, sem toast; sucesso → toast verde; de novo → "Você já denunciou..." dentro do modal; o dono não recebe notificação.
7. **A corrida (opcional):** com o atraso temporário na API (passo 19 do roteiro de Front), o sino não volta ao número velho; com o `if (true)` temporário, volta. Desfaça as duas alterações.
8. **Exclusão:** como o dono, exclua o item curtido, comentado e denunciado → a lista do dono fica só com os avisos de `follow`.
9. **Regressão:** curtir e seguir (Offline → volta + toast; visitante → login → volta), coleções, "Salvar", busca com debounce, Login/Logout (Console limpo), Perfil, Feed, Seguindo, comentários; sessão expirada (`localStorage.setItem(<sua-chave-do-token>, 'lixo')`) → Login, sem toast e sem laço.

**Checklist desta etapa:**

- [ ] Os nove passos acima testados em sequência, a partir do login, sem digitar nenhuma URL (exceto a sessão expirada, que pede o Console)

---

## 14. Entrega

Envie em resposta a esta tarefa:

1. Na subpasta `01 - Docs` do seu projeto frontend, dentro de uma nova subpasta `atividade14`:
   - `sino-contador.jpg`: a Navbar com o selo de não lidas (e o `aria-label` visível no DevTools);
   - `polling-network.jpg`: a aba Network (Fetch/XHR) com as requisições `unread-count` periódicas (e a imediata da entrada);
   - `lista-notificacoes.jpg`: a lista com notificações lidas e não lidas (e os três tipos);
   - `otimista-lida.jpg`: a aba Network com Slow 4G, a linha já marcada e a requisição ainda pendente;
   - `rollback-lida.jpg`: a linha de volta ao estado anterior, o sino de volta e o toast de erro (Offline);
   - `denuncia-modal.jpg`: o modal com os cinco motivos; `denuncia-409.jpg`: o erro "Você já denunciou..." dentro do modal; `denuncia-toast.jpg`: o toast de sucesso;
   - `console-logout.jpg`: o Console limpo logo depois de sair da conta;
   - `banco-notificacoes.jpg`: o cliente de banco com as duas tabelas, os índices, os `ENUM`, os `ON DELETE` (`SHOW CREATE TABLE`) e a recusa da linha repetida e do motivo fora do `ENUM`;
   - `controle-reports.jpg` e `controle-orfa.jpg`: o `500` da chave estrangeira de `reports` e a notificação órfã (`NULL`) do teste de controle;
   - Um print de cada `curl` da Parte A, Etapa 5, em `.jpg`;
   - `respostas.md` com um parágrafo curto para cada uma das dez perguntas da Seção 1 ("Você também deve ser capaz de explicar...");
   - Atualize `checklists.md` com todos os checklists desta atividade marcados (e a lacuna da lista que não se atualiza sozinha anotada).
2. Um `.zip` do seu projeto de back-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-backend.zip`, incluindo os módulos de notificação e de denúncia, o `app.js` e os três services alterados;
3. Um `.zip` do seu projeto de front-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-frontend.zip`, incluindo `stores/notifications.js`, a tela de notificações, o modal de denúncia, a `TheNavbar.vue` e o `authService.js` atualizados.

---

## 15. Próxima aula

A Aula 15 traz o painel de administração. Na API, nascem as rotas `/api/admin/...` protegidas por um middleware que confere `isAdmin` (lido do token), o Dashboard com números do sistema, a lista de denúncias (o dado que você gravou hoje, finalmente lido, com quem denunciou e o item), a ação de revisar uma denúncia — que dá à tabela de denúncias a coluna de situação que hoje ficou de fora —, o bloqueio de usuários e a exclusão de itens por administrador. No front, a área de administração ganha um layout próprio e uma guarda de rota por papel. **Pergunta para chegar pensando:** como se testa uma rota de administrador se a API não tem nenhum endpoint para "virar admin"?
