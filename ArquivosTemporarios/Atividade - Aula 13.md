# Atividade Prática - Aula 13

## Playlists (Muitos-para-Muitos), "Salvar" e Busca com Debounce (Trilhas API + Frontend)

**Baseado em:** roteiro da Aula 13 — trilha API (Shortz-App API) e roteiro da Aula 13 — trilha Frontend (Shortz-App)

**Aplicação:** este enunciado vale para qualquer projeto sorteado na Lista de Projetos para Programação Web — use a mesma ficha de preparação das aulas anteriores, reaproveitando os campos já preenchidos (nome do model da sua entidade, nome da tabela, rota, o campo de texto principal). Hoje há um conceito novo de domínio: uma **coleção pessoal** da sua entidade principal (na Shortz-App, a playlist de vídeos; no seu projeto, a "lista", "coleção", "pasta" ou "trilha" de... o que o seu sistema coleciona). O trabalho tem uma parte que depende da sua entidade (a coleção e o botão "Salvar") e uma parte idêntica para todo mundo (a busca, a extração do `runOptimistic` e o debounce). O Grupo A/B não altera nada.

**Pré-requisito:** Atividade 12 concluída nas duas trilhas — `config/constants.js` (com `PAGINATION`) e `utils/pagination.js` na API; `config/constants.js`, toasts com interceptor, `useAsyncData`, `usePaginatedList` e `useAuthenticatedAction` no front; botão de curtir e botão de seguir com atualização otimista; e duas contas de usuário para os testes (uma delas com pelo menos um item da sua entidade enviado).

> ⚠️ **Ordem de execução:** faça a Parte A (API) antes da Parte B (Frontend), como nas atividades anteriores.

---

## 1. Objetivo

Ao final desta atividade, você deve ter, no seu próprio projeto:

**Do lado do back-end (API):**

- Duas tabelas novas — a da coleção (com título, descrição opcional, `isPublic` privada por padrão, contador de itens e `userId`) e a tabela de junção entre coleção e a sua entidade, com índice único composto (coleção, entidade) mais um índice simples na coluna da entidade;
- As rotas: listar as minhas coleções, criar (validada), ler uma coleção respeitando `isPublic` (com `optionalAuth`), excluir, adicionar e remover um item, e `GET /api/<suas-entidades>/:id/<colecoes>-status` — a lista das minhas coleções com `hasItem` (o equivalente ao `hasVideo`);
- Adicionar idempotente (`201` na primeira vez, `200` e contador intacto na repetição) e remover com `404` quando o item não está lá, tudo com duas escritas numa transação;
- O utilitário `utils/parseId.js`, usado pelo módulo novo e pelo `followController`;
- A busca de verdade (`GET /api/search`): itens da sua entidade e usuários, duas consultas em paralelo, entrada tratada (só texto, `trim`, mínimo e máximo de tamanho) e curingas do `LIKE` escapados;
- A exclusão da sua entidade limpando também as coleções e descontando o contador de cada coleção afetada.

**Do lado do front-end:**

- As telas "Minhas Coleções" (lista, criar em modal, excluir com confirmação) e detalhe da coleção (pública para visitante, privada com mensagem, remover item para a dona);
- O botão "Salvar" na tela de Detalhe, com um modal de caixas de seleção que já vem marcado, com atualização otimista por linha (e rollback);
- `utils/optimistic.js` (`runOptimistic`), extraído no terceiro caso, com o botão de curtir e o botão de seguir refatorados sem mudar de comportamento;
- `useDebouncedValue` e a tela de busca com o termo na URL (`?q=`), mais a barra de busca na Navbar e o item de menu "Minhas Coleções" — todos alcançáveis por clique.

**Você também deve ser capaz de explicar com suas palavras:**

1. Por que uma relação muitos-para-muitos precisa de uma tabela de junção, e por que ela tem dois índices (o que cada um acelera);
2. O que significa uma ação ser idempotente, e por que adicionar duas vezes responde `200` enquanto remover duas vezes responde `404`;
3. Por que, mesmo com `ON DELETE CASCADE` no banco, excluir um item da sua entidade deixa o contador das coleções errado se o código não o descontar — e que tipo de dado é esse contador;
4. A ordem `400` → `404` → `403` nas rotas de escrita, e as duas opções (`403` ou `404`) para uma coleção privada de outra pessoa;
5. Por que digitar `%%` na busca devolvia tudo, como o escape resolve, e por que `req.query.q` precisa ser conferido com `typeof`;
6. O que muda e o que não muda entre os três casos de atualização otimista (curtir, seguir, marcar coleção), e por que `apply` devolve a função de desfazer;
7. A diferença entre as duas defesas da busca — o debounce e o `lastCallId` — e que problema cada uma resolve;
8. Por que "Remover da coleção" espera a API (pessimista) e a caixa do modal não (otimista).

---

## 2. Antes de começar: adapte os nomes à sua entidade

Preencha (acrescente à ficha das aulas anteriores) e use nos nomes de arquivos, rotas e telas:

| Nome | Exemplo (Shortz-App) | O seu projeto |
|---|---|---|
| A coleção do usuário | `Playlist` | |
| O model da junção | `PlaylistVideo` (tabela `playlist_videos`) | |
| Contador de itens na coleção | `videosCount` | |
| Rotas | `/api/my-playlists`, `/api/playlists` | `/api/my-<colecoes>`, `/api/<colecoes>` |
| Rota do status | `/api/videos/:videoId/playlists-status` | `/api/<suas-entidades>/:<entidade>Id/<colecoes>-status` |
| Campo de texto usado na busca (título/nome da sua entidade) | `title` | |
| Campo `hasVideo` na resposta do status | `hasVideo` | `has<Entidade>` |
| Telas | `MyPlaylistsView`, `PlaylistDetailView` | |

> 💡 **A busca procura em quê?** Na Shortz-App, no `title` do vídeo e no `username` / `fullName` do usuário. No seu projeto, use o campo de texto principal da sua entidade (o `name` de uma receita, o `title` de um episódio...) e os mesmos campos de usuário.

> 💡 **Nomes dos campos em português ou inglês?** Mantenha o padrão que você já usa no projeto. O que não pode variar é a consistência entre API e front: o `hasItem` da resposta tem que ser o que o `:checked` do modal lê.

---

# PARTE A — Backend

## 3. Etapa 1 — Constantes, `parseId` e o `followController`

1. Em `config/constants.js`, acrescente `PLAYLIST_TITLE_MIN` (3), `PLAYLIST_TITLE_MAX` (100) e `PLAYLIST_DESCRIPTION_MAX` (500) em `VALIDATION` — usando o nome da sua coleção no lugar de `PLAYLIST` — e o bloco `SEARCH` (`MIN_LENGTH: 2`, `MAX_LENGTH: 100`, `LIMIT: 10`).
2. Crie `utils/parseId.js` (Bloco 3.2 do roteiro de API): `parseId(rawValue, label)`, que converte para inteiro positivo ou lança `400` "Identificador de `<label>` inválido.".
3. Troque, no `followController`, a função local `parseUserId` pelo `parseId(req.params.userId, 'usuário')` (as quatro ocorrências), e apague a função antiga. Confirme que `GET /api/users/abc/followers` continua respondendo `400` com a mesma mensagem. **Atenção:** o `require` de `parsePagination` já existe nesse arquivo desde a Atividade 12 — não o adicione de novo (o Node acusaria `Identifier 'parsePagination' has already been declared`); o único `require` novo é o de `parseId`.

**Checklist desta etapa:**

- [ ] Constantes de validação e de busca criadas
- [ ] `parseId` criado e usado pelo `followController` (sem a função antiga)

## 4. Etapa 2 — Models e Associações

1. Crie o model da coleção (Bloco 4.1 do roteiro): `title`, `description` (opcional), `isPublic` com `defaultValue: false`, o contador de itens, `userId` (`references: users`), e um índice em `user_id`.
2. Crie o model da junção (Bloco 4.2): `<colecao>Id` e `<entidade>Id`, cada um com `references` para a sua tabela; índice único composto `[<colecao>_id, <entidade>_id]` e um índice simples em `<entidade>_id`.
3. Em `config/associations.js`, importe os dois models e declare as seis associações do Bloco 4.3 (os dois `hasMany` + os dois `belongsTo` entre coleção e junção e entre entidade e junção, mais `User` ↔ coleção).
4. Reinicie a API e confira no banco: as duas tabelas, os índices e — com `SHOW CREATE TABLE <tabela-da-juncao>;` — as chaves estrangeiras com `ON DELETE CASCADE` (anote isto: você vai precisar na Etapa 5).

**Checklist desta etapa:**

- [ ] Dois models e seis associações
- [ ] Tabelas, índices e chaves estrangeiras conferidos no banco

## 5. Etapa 3 — Validator, Service, Controller e Rotas da Coleção

Siga os Blocos 5 a 7 do roteiro de API. O conteúdo é o mesmo, trocando os nomes:

- **Validator** (`create<Colecao>Validator`): `title` com `.trim()` antes de `.notEmpty()` e `.isLength({ min, max })`; `description` opcional com `.optional({ checkFalsy: true })`; `isPublic` com `.optional().isBoolean({ strict: true })`.
- **Service:**
  - `findOwned<Colecao>OrFail` (`404` se não existe → `403` se é de outra pessoa) usada por adicionar, remover e excluir;
  - `create` (`isPublic === true` só se vier exatamente `true`; `description || null`),
  - `getUser<Colecoes>` (da mais nova para a mais antiga: `order` por `createdAt` decrescente e `id` decrescente como desempate — o `createdAt` tem precisão de segundos, e duas coleções criadas no mesmo segundo teriam datas iguais);
  - `get<Colecao>ById(id, currentUserId = null)`: `404`; calcula `isOwner` com `currentUserId !== null` primeiro; `403` se for privada e a pessoa não for a dona; devolve `{ colecao, itens, isOwner }` com o autor de cada item aninhado;
  - `addTo<Colecao>`: coleção (`404` / `403`) → item (`404`) → transação com `findOrCreate` e o `increment` só se `created` → `reload()` → `{ added, <contador> }`;
  - `removeFrom<Colecao>`: coleção → transação com `destroy` (o `where` devolve quantas linhas apagou) e `decrement` só se apagou → `404` "Este item não está na coleção." se nada foi apagado;
  - `delete<Colecao>`: coleção → transação apagando as linhas da junção antes da coleção;
  - `get<Colecoes>StatusFor<Entidade>(userId, entidadeId)`: `404` se a entidade não existe; as minhas coleções + um `Set` com os ids das coleções que contêm o item → `[{ id, title, isPublic, <contador>, has<Entidade> }]`.
- **Controller:** `parseId` em todo id vindo de `req.params` e do corpo (`req.body.<entidade>Id`); adicionar responde `201` se `added` e `200` ("já estava") se não; `get<Colecao>Details` devolve `{ ...colecao.toJSON(), <Itens>: itens, isOwner }`.
- **Rotas:** só `GET /<colecoes>/:id` é pública (`optionalAuth`); o resto, `isAuthenticated`. Registre no `app.js` antes do 404 e do `errorHandler`.

> ⚠️ **Quatro pontos que quase todo mundo erra:** (1) o `increment` / `decrement` fora do `if` — o contador passa a mentir a cada clique repetido; (2) esquecer `{ transaction: t }` em uma das escritas; (3) calcular `isOwner` sem checar `currentUserId !== null` — um visitante casa com `undefined` / `null`; (4) usar `Boolean(isPublic)` em vez de `isPublic === true` — o texto `"false"` vira "verdadeiro".

**Checklist desta etapa:**

- [ ] Quatro arquivos do módulo, registrados no `app.js`
- [ ] Duas escritas (linha + contador) numa só transação, nas três operações
- [ ] `403` para privada de outra pessoa; `isOwner` correto para dona, outra pessoa e visitante

## 6. Etapa 4 — A Busca de Verdade

1. **`searchService`:** `escapeLike(texto)` com `text.replace(/[\\%_]/g, '\\$&')`; `search<Entidades>` (`Op.like` no seu campo de texto principal, `include` do autor com só os atributos públicos, `order` por data decrescente com `id` decrescente como desempate, `limit: SEARCH.LIMIT`); `searchUsers` (`Op.or` em `username` e `fullName`, `order` por `username`, `limit`); `globalSearch` com `Promise.all` (sem `this`).
2. **`searchController`:** `async`, com `await`; `typeof req.query.q === 'string'` (senão `''`); `trim()` e `slice(0, MAX_LENGTH)`; só consulta se `query.length >= MIN_LENGTH`; devolve `{ query, ...results }`.
3. **`searchRoutes`:** passe o handler pelo `asyncHandler`.

> ⚠️ **O erro mais traiçoeiro desta etapa:** esquecer o `await` no controller. A resposta é `200`, o `query` está lá, e as listas somem (o `...results` espalha uma promessa). Se a sua busca "não acha nada", comece por aí.

**Checklist desta etapa:**

- [ ] Busca consultando o banco, com escape, `Promise.all` e entrada tratada
- [ ] Controller `async` / `await` e rota com `asyncHandler`

## 7. Etapa 5 — A Exclusão da Sua Entidade Limpa as Coleções

No `delete<Entidade>` do seu service (a transação da Atividade 10), antes do `destroy` da entidade, acrescente: buscar as linhas da junção desse item, descontar 1 do contador de cada coleção afetada, e apagar as linhas da junção. Importe os dois models no topo do arquivo.

**Teste de controle (obrigatório):** comente o bloco novo, exclua um item que esteja em uma coleção e olhe o contador da coleção no `GET /my-<colecoes>`: a exclusão funcionou (o `CASCADE` apagou as linhas), mas o contador continua alto. Descreva o que viu no `respostas.md` (pergunta 3) e desfaça o comentário.

**Checklist desta etapa:**

- [ ] Exclusão limpa a junção e desconta o contador de cada coleção, na mesma transação
- [ ] Teste de controle feito e descrito

## 8. Etapa 6 — Testando

Faça os testes do Bloco 11 do roteiro de API, adaptados aos seus nomes (duas contas, A e B; o JSON do `-d` com aspas escapadas no CMD):

1. **Criar:** sem token `401`; título `ab` `400`; só espaços `400`; `isPublic: "sim"` `400`; sucesso sem `isPublic` → `isPublic: false` e o título sem os espaços das pontas; sucesso com `isPublic: true`.
2. **Listar as minhas:** só as da conta, a mais nova primeiro (crie duas em seguida, em menos de um segundo: a ordem tem que continuar certa — é o teste do desempate).
3. **Adicionar:** `201` (`added: true`, contador 1); repetir → `200` (`added: false`, contador ainda 1); item inexistente `404`; corpo sem o id ou com `"abc"` `400`; coleção de outra pessoa `403`; coleção `99999` `404`; id `abc` na URL `400`.
4. **Remover:** `200` e o contador desce; repetir `404`; coleção de outra pessoa `403`.
5. **Ler:** pública para visitante `200` (`isOwner: false`, com o autor da coleção e dos itens, sem `password`); privada `403` para visitante e para a outra conta; privada para a dona `200` (`isOwner: true`); `99999` `404`; `abc` `400`.
6. **Status:** sem token `401`; `hasItem: true/false` correto; item inexistente `404`; a outra conta vê as coleções dela.
7. **Excluir a coleção:** `403` / `200` / depois `404`; a junção fica sem linhas daquela coleção, e o item continua existindo.
8. **Excluir um item que está em coleções de duas pessoas:** o contador das duas coleções volta a 0.
9. **Busca:** sem `q`, vazio, só espaços e 1 letra → listas vazias; um trecho do campo de texto da sua entidade (e em outra caixa de letras) → o item, com o autor; um trecho do `username` → a pessoa, sem `password`; termo inexistente → listas vazias; `?q=ab&q=cd` e `?q[x]=1` (com `curl -g`) → listas vazias e nenhum `500`; `?q=%25%25` e `?q=__` → listas vazias.
10. No banco, tente inserir uma linha repetida na junção → o banco recusa (`Duplicate entry ... idx_unique_...`).
11. **Regressão:** `GET /feed`, detalhe, perfil, curtir, comentar, seguir e as duas listas, feed "Seguindo", upload, edição; e `GET /users/abc/followers` → `400`.

**Checklist desta etapa:**

- [ ] Os onze testes acima executados com sucesso

---

# PARTE B — Frontend

## 9. Contextualização rápida e Checagem de Alcançabilidade

Responda antes de programar (no `checklists.md` ou em um comentário no topo da sua tela de lista):

| Peça | Caminho(s) de clique que você vai construir |
|---|---|
| Minhas Coleções | item no menu do avatar (novo) e item da Sidebar (já existe?) |
| Criar / excluir coleção | botão na própria tela (modal / confirmação) |
| Detalhe da coleção | clique no cartão, na lista |
| Salvar um item | botão "Salvar" no Detalhe (visitante → login → volta ao item) |
| Remover um item da coleção | botão em cada card, no detalhe da coleção (só para a dona) |
| Busca | barra da Navbar (Enter) e item "Explorar" da Sidebar |

> ⚠️ **Verifique antes de programar:** no seu `router/index.js`, existem as rotas das três telas (lista, detalhe e busca)? O detalhe da coleção é público (sem `requiresAuth`)? O nome da rota da busca é o mesmo que você vai usar no `router.push({ name: ... })`? E o `TheSidebar.vue` aponta para paths que existem? Ajuste o que faltar e registre no `checklists.md`.

> 💡 **Uma lacuna conhecida (não resolva):** a coleção pública de outra pessoa só é alcançável por link: nenhuma tela lista as coleções públicas de alguém. Anote no `checklists.md` como decisão de escopo.

## 10. Etapa 1 — Constantes, Service e a Limpeza da Home

1. Em `config/constants.js`, acrescente `LIMITS.<COLECAO>_TITLE_MIN/MAX` e `<COLECAO>_DESCRIPTION_MAX` (iguais aos da API) e o bloco `SEARCH` (`MIN_LENGTH: 2`, `DEBOUNCE_MS: 400`).
2. Crie `services/<colecao>Service.js` com as sete funções do Bloco 4 do roteiro de Frontend (o `create` com `{ silent: true }` no terceiro argumento; o `add` com o id no corpo; o `remove` com o id na URL).
3. Se a sua tela inicial ainda chama `search(...)` só para testar a API (desde a Atividade 02), remova essa chamada e o `import`.

**Checklist desta etapa:**

- [ ] Constantes, service com as sete funções e Home limpa

## 11. Etapa 2 — `runOptimistic` e os Dois Botões Refatorados

1. Crie `utils/optimistic.js` com `runOptimistic({ apply, request, confirm })`: `apply()` devolve o `undo`; `request()` devolve a promessa; no sucesso, `confirm(response.data)`; no erro, `undo()` — sem `if`, sem toast (o interceptor já avisou).
2. Refatore o botão de curtir e o botão de seguir para usá-lo. O `<template>` e a "cerca" (`useAuthenticatedAction`) não mudam. No seguir, mantenha a variável local do novo estado (a pegadinha do `defineModel`).
3. Antes de seguir: teste os dois botões (otimista, Offline com rollback e toast, visitante → login → volta). O comportamento tem que ser idêntico ao de antes.

**Checklist desta etapa:**

- [ ] `runOptimistic` criado
- [ ] Os dois botões refatorados e sem regressão

## 12. Etapa 3 — Minhas Coleções e o Detalhe da Coleção

1. **`Create<Colecao>Modal`** (Bloco 6 do roteiro): formulário no `BaseModal`; botão do rodapé com `type="submit"` e `form="<id-do-form>"`; `novalidate`; `validate()` com os `LIMITS` sobre o texto sem espaços; `isPublic` começando `false`; `isSubmitting` com `:busy`; erro no próprio modal (não em toast); emite `created` com o que a API devolveu.
2. **`My<Colecoes>View`:** `useAsyncData(...)` com `initialData: []`; dois controles de modal (`isCreating`, `<colecao>ToDelete`); a nova coleção entra no topo, num array novo; excluir espera a API (e o modal continua aberto se falhar); o cartão clicável com `stretched-link` e o botão "Excluir" por cima (`position-relative` + `z-index`); selo "Pública"/"Privada"; estado vazio com instrução; pluralização correta.
3. **`<Colecao>DetailView`:** `useAsyncData` com `watch: () => route.params.id`; `403` / `404` mostrados no lugar do conteúdo (sem toast), com um botão para sair; título, selo, descrição, dona e grade de itens; "Remover da coleção" só para a dona (`v-if="isOwner"` no slot de ações) e pessimista (chama a API, depois filtra a lista e usa o contador devolvido), com toast de sucesso; estado vazio com uma mensagem diferente para a dona.

> ⚠️ **Só `toast.success` nas telas.** O toast de erro é do interceptor; um `toast.error` no seu `catch` duplicaria o aviso.

**Checklist desta etapa:**

- [ ] Modal de criação, lista e detalhe funcionando, com `403` / `404` na própria tela
- [ ] Cartão clicável com botão "Excluir" funcionando por cima do link esticado

## 13. Etapa 4 — O Modal "Salvar" e o Botão no Detalhe

1. **`AddTo<Colecao>Modal`** (Bloco 9.1): `useAsyncData(() => get...Status(props.<entidade>Id), { initialData: [] })`; cada linha é uma caixa com `:checked` (ligação só de ida) e `@change` (nunca `v-model`); o cadeado nas privadas; uma "cerca" por linha (um `Set` reativo de ids em andamento, e a caixa `:disabled` enquanto isso); `toggle` = `runOptimistic`: `apply` inverte `has<Entidade>` e soma/subtrai 1 do contador, devolvendo o `undo`; `request` escolhe adicionar ou remover conforme o estado de antes (guardado numa variável local); `confirm` acerta só o contador; a cerca é liberada com `.finally`; estado vazio com link para criar a primeira.
2. **No Detalhe da sua entidade:** botão "Salvar" para todos (visitante → login com `redirect`), com a "cerca" do `useAuthenticatedAction` e um interruptor `v-if` para o modal, dentro do bloco que já tem o item carregado.

**Checklist desta etapa:**

- [ ] Modal com caixas marcadas conforme o servidor, otimista, com rollback e uma cerca por linha
- [ ] Botão "Salvar" no Detalhe, com o comportamento do visitante

## 14. Etapa 5 — Debounce, Tela de Busca e Navbar

1. **`composables/useDebouncedValue.js`** (Bloco 10.1): `watch` + `setTimeout` / `clearTimeout`; valor inicial = valor atual da origem; `onUnmounted` limpa o timer.
2. **`SearchView`:** `typedText` (o que o campo mostra), `term = useDebouncedValue(typedText, SEARCH.DEBOUNCE_MS)` e `normalizedTerm` (com `trim`); o estado inicial vem de `route.query.q` (conferindo `typeof === 'string'`); `useAsyncData` com `watch: normalizedTerm` e a resposta vazia pronta (`Promise.resolve(...)`) quando o termo é curto; um `watch` que lê a URL (só altera o campo quando o valor é diferente de `normalizedTerm`) e outro que escreve a URL com `router.replace`; seções "Pessoas" e a grade dos itens, cada uma só se tiver resultados; "Nada encontrado para `results.query`"; a dica do mínimo de letras; o foco no campo dado por código (`ref` + `onMounted`).
3. **Navbar:** `<form role="search">` com o campo e o botão de lupa, `@submit.prevent`; ignora vazio; `router.push({ name: ..., query: { q } })` e limpa o campo; visível também para visitantes. E o item "Minhas Coleções" no menu do avatar.

**Checklist desta etapa:**

- [ ] Digitar uma palavra inteira sem pausa gera uma requisição (Network)
- [ ] Termo na URL: F5 e link funcionam; Navbar leva à busca já com o termo; Voltar não passa por cada pausa

## 15. Etapa 6 — Teste Prático Completo (só de clique em clique)

1. **Coleções:** menu do avatar → Minhas Coleções (e a Sidebar abre a mesma tela); título curto → erro no campo, sem toast e sem requisição; criar sem marcar "Pública" → selo "Privada"; criar uma pública; Offline ao criar → erro dentro do modal, sem toast; excluir com Offline → toast vermelho e modal aberto; excluir de verdade → toast verde.
2. **Salvar:** visitante → login → volta ao item; modal com as coleções da conta, cadeados e contadores; marcar → muda na hora (Slow 4G); F5 e reabrir → continua marcada; Offline ao desmarcar → a caixa volta e há toast; dois cliques rápidos na mesma caixa → uma requisição; conta sem coleções → o convite para criar.
3. **Detalhe da coleção:** abrir pelo cartão; remover (o card some depois da API; com Offline, fica e há toast); estado vazio; link da pública numa janela anônima → abre, sem botões de remover; link da privada → "privada", sem toast; `/<colecoes>/99999` → "não encontrada".
4. **Busca:** "Explorar" na Sidebar (o campo com foco); a barra da Navbar + Enter; uma só requisição por palavra digitada sem pausa (Network); 1 letra → nenhuma requisição e a dica; resultados de itens e de pessoas; maiúsculas/minúsculas; termo inexistente; `%%` → "Nada encontrado"; F5 mantém o termo; Voltar sai da busca.
5. **Exclusão com coleção:** como o dono, exclua um item que está numa coleção → o contador da coleção cai.
6. **Regressão:** curtir e seguir (os dois refatorados; Offline → volta + toast; visitante → login → volta), Login/Logout, Perfil, Feed, Seguindo, Curtidas, Meus Itens, comentários.

**Checklist desta etapa:**

- [ ] Os seis passos acima testados em sequência, a partir do login, sem digitar nenhuma URL (exceto os links compartilhados e o id inexistente)

---

## 16. Entrega

Envie em resposta a esta tarefa:

1. Na subpasta `01 - Docs` do seu projeto frontend, dentro de uma nova subpasta `atividade13`:
   - `colecao-privada.jpg`: o cartão com o selo "Privada" e o formulário com o erro de título curto;
   - `salvar-modal.jpg`: o modal "Salvar" com as caixas (marcadas e não marcadas) e os cadeados;
   - `otimista-modal.jpg`: a aba Network com Slow 4G, a caixa já marcada e a requisição ainda pendente;
   - `rollback-modal.jpg`: a caixa de volta ao estado anterior, com o toast de erro (Offline);
   - `detalhe-colecao.jpg` e `colecao-privada-visitante.jpg`: o detalhe pela dona e a mensagem de privada vista como visitante;
   - `debounce.jpg`: a aba Network (Fetch/XHR) com uma só requisição de busca depois de digitar uma palavra inteira sem pausa;
   - `busca.jpg`: resultados de itens e de pessoas;
   - `navbar-busca.jpg`: a barra de busca e o menu do avatar com "Minhas Coleções";
   - `contador-controle.jpg`: o contador da coleção errado no teste de controle da Etapa 5 (e `contador-certo.jpg` com o bloco restaurado);
   - `colecoes-banco.jpg`: o cliente de banco com as duas tabelas, os índices, o `ON DELETE CASCADE` (`SHOW CREATE TABLE`) e a recusa da linha repetida na junção;
   - Um print de cada `curl` da Parte A, Etapa 6, em `.jpg`;
   - `respostas.md` com um parágrafo curto para cada uma das oito perguntas da Seção 1 ("Você também deve ser capaz de explicar...");
   - Atualize `checklists.md` com todos os checklists desta atividade marcados (e a lacuna das coleções públicas anotada).
2. Um `.zip` do seu projeto de back-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-backend.zip`, incluindo o módulo da coleção, o módulo de busca e `utils/parseId.js`;
3. Um `.zip` do seu projeto de front-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-frontend.zip`, incluindo `utils/optimistic.js`, `useDebouncedValue`, os dois modais, as três telas novas e a `TheNavbar.vue` atualizada.
