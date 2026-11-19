# Checklists — PhotoSphere | Atividade 13

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 13 — Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| A coleção do usuário | `Playlist` | `Album` (tabela `albums`, módulo `album`) |
| O model da junção | `PlaylistVideo` (tabela `playlist_videos`) | `AlbumPhoto` (tabela `album_photos`) |
| Contador de itens na coleção | `videosCount` | `photosCount` |
| Rotas | `/api/my-playlists`, `/api/playlists` | `/api/my-albums`, `/api/albums` |
| Rota do status | `/api/videos/:videoId/playlists-status` | `/api/photos/:photoId/albums-status` |
| Campo de texto usado na busca | `title` | `title` (da foto) + `username`/`fullName` |
| Campo `hasVideo` na resposta do status | `hasVideo` | `hasPhoto` |
| Telas | `MyPlaylistsView`, `PlaylistDetailView` | `AlbumsView` (Meus Álbuns), `AlbumDetailView` |

---

## ATIVIDADE 13 — PARTE A: Backend (Álbuns, Busca e Limpeza na Exclusão)

**Etapa 1 — Constantes, `parseId` e o `followController`**

- [X] `ALBUM_TITLE_MIN` (3), `ALBUM_TITLE_MAX` (100), `ALBUM_DESCRIPTION_MAX` (500) em `VALIDATION` e o bloco `SEARCH` (`MIN_LENGTH: 2`, `MAX_LENGTH: 100`, `LIMIT: 10`)
- [X] `utils/parseId.js` criado e usado pelo `followController` (as quatro ocorrências; o `parseUserId` antigo apagado); `GET /api/users/abc/followers` continua `400` com a mesma mensagem
- [X] Extra: `parseId` também nos controllers de foto, curtida e comentário (`/photos/abc` passou de `404` para `400`, como previsto no `checkpoint-02.md`), e `utils/httpError.js` substituindo a `httpError` copiada em quatro services (pendência da Aula 12 resolvida)

**Etapa 2 — Models e Associações**

- [X] `albumModel.js` (`title`, `description`, `isPublic` padrão `false`, `photosCount`, `userId`, índice `idx_albums_user_id`) e `albumPhotoModel.js` (índice único `idx_unique_album_photo (album_id, photo_id)` e `idx_album_photos_photo_id`)
- [X] Seis associações (`User`↔`Album`, `Album`↔`AlbumPhoto`, `Photo`↔`AlbumPhoto`), com `onDelete: 'CASCADE'` nos `hasMany`
- [ ] Tabelas, índices e chaves estrangeiras (`ON DELETE CASCADE`, via `SHOW CREATE TABLE album_photos`) conferidos no banco

**Etapa 3 — Validator, Service, Controller e Rotas**

- [X] Quatro arquivos do módulo `album`, registrados no `server.js` (o `app.js` do roteiro) antes do 404
- [X] Duas escritas (linha + `photosCount`) numa só transação nas três operações, com o `increment`/`decrement` dentro do `if`
- [X] `403` para privado de outra pessoa; `isOwner` com `currentUserId !== null` primeiro; `isPublic === true` (nunca `Boolean(isPublic)`)

**Etapa 4 — A Busca de Verdade**

- [X] `searchService` com `escapeLike`, `searchPhotos` (título, autor público, `createdAt`/`id` DESC, `SEARCH.LIMIT`), `searchUsers` (`Op.or` em `username`/`fullName`) e `globalSearch` com `Promise.all`
- [X] `searchController` `async`/`await`, `typeof === 'string'`, `trim()` + `slice(0, MAX_LENGTH)`, só consulta com `>= MIN_LENGTH`; rota com `asyncHandler`

**Etapa 5 — A exclusão da foto limpa os álbuns**

- [X] `deletePhoto` busca as linhas da junção, desconta 1 do `photosCount` de cada álbum e apaga as linhas, na mesma transação, antes do `destroy` da foto
- [ ] Teste de controle feito e descrito (bloco comentado → contador alto; restaurado → contador certo)

**Etapa 6 — Testando (contas A e B)**

- [ ] 1. Criar: `401`; `ab` `400`; só espaços `400`; `isPublic: "sim"` `400`; sem `isPublic` → privado e aparado; com `isPublic: true`
- [ ] 2. Listar: só as da conta, a mais nova primeiro (desempate com duas criadas no mesmo segundo)
- [ ] 3. Adicionar: `201`/1; repetir `200`/1; foto inexistente `404`; sem id ou `"abc"` `400`; de outra pessoa `403`; `99999` `404`; `abc` na URL `400`
- [ ] 4. Remover: `200` e o contador desce; repetir `404`; de outra pessoa `403`
- [ ] 5. Ler: público para visitante `200` (`isOwner: false`, autores, sem `password`); privado `403` para visitante e outra conta; privado da dona `200`; `99999` `404`; `abc` `400`
- [ ] 6. Status: `401`; `hasPhoto` correto; foto inexistente `404`; a outra conta vê os dela
- [ ] 7. Excluir o álbum: `403` / `200` / depois `404`; junção sem linhas dele; a foto continua existindo
- [ ] 8. Excluir uma foto que está em álbuns de duas pessoas: os dois contadores voltam a 0
- [ ] 9. Busca: vazio/1 letra → listas vazias; trecho do título (outra caixa) → a foto; trecho do username → a pessoa; inexistente → vazio; `?q=ab&q=cd` e `?q[x]=1` sem `500`; `%%` e `__` → vazio
- [ ] 10. No banco, linha repetida na junção recusada (`Duplicate entry ... idx_unique_album_photo`)
- [ ] 11. Regressão: feed, detalhe, perfil, curtir, comentar, seguir e listas, feed "Seguindo", upload, edição; `GET /users/abc/followers` → `400`

---

## ATIVIDADE 13 — PARTE B: Frontend (Álbuns, "Salvar", runOptimistic e Busca)

**Contextualização e Checagem de Alcançabilidade**

| Peça | Caminho(s) de clique construídos |
|---|---|
| Meus Álbuns | item **"Meus Álbuns"** no menu do avatar (novo) |
| Criar / excluir álbum | botão "Novo álbum" (modal) e "Excluir" em cada cartão (confirmação) |
| Detalhe do álbum | clique no cartão, na lista |
| Salvar uma foto | botão **"Salvar"** no Detalhe da foto (visitante → login → volta à foto) |
| Remover uma foto do álbum | botão em cada card, no detalhe do álbum (só para a dona) |
| Busca | barra da Navbar (Enter) e item **"Explorar"** da Navbar |

> **Verificação das rotas:** `/albums` e `/albums/:id` existiam desde a Aula 01 como placeholders, ambas com `requiresAuth`. **O que foi feito:** o detalhe `/albums/:id` ficou **público** (sem `requiresAuth`, como pede o enunciado); a rota da busca nasceu como `/search` (`name: 'search'`, o mesmo nome usado no `router.push`), e `/explore` (o placeholder antigo, usado pelo rodapé e pela Home) passou a redirecionar para ela. O PhotoSphere não tem `TheSidebar.vue`: "Explorar" foi para a navegação principal da Navbar, e "Meus Álbuns" para o menu do avatar.

> **Lacuna conhecida (decisão de escopo):** o álbum público de outra pessoa só é alcançável por link — nenhuma tela lista os álbuns públicos de alguém.

**Etapa 1 — Constantes, Service e a limpeza da Home**

- [X] `LIMITS.ALBUM_TITLE_MIN/MAX` e `ALBUM_DESCRIPTION_MAX` (iguais aos da API) e o bloco `SEARCH` (`MIN_LENGTH: 2`, `DEBOUNCE_MS: 400`)
- [X] `services/albumService.js` com as sete funções (`createAlbum` com `{ silent: true }` no 3º argumento; adicionar com o id no corpo; remover com o id na URL)
- [X] `HomeView` sem o `import` de `search` (e sem os imports sem uso de `api` e `useAuthStore`)

**Etapa 2 — `runOptimistic` e os dois botões refatorados**

- [X] `utils/optimistic.js` com `runOptimistic({ apply, request, confirm })` — `apply` devolve o `undo`; sem `if` e sem toast
- [X] `LikeButton` e `FollowButton` refatorados (template e cerca iguais; `nowFollowing` mantida)
- [ ] Os dois botões testados sem regressão (otimista; Offline → volta + toast; visitante → login → volta)

**Etapa 3 — Meus Álbuns e o Detalhe do Álbum**

- [X] `CreateAlbumModal.vue`: formulário no `BaseModal`, botão `type="submit"` com `form="create-album-form"`, `novalidate`, `validate()` com `LIMITS`, `isPublic` começando `false`, `isSubmitting` (`persistent`), erro dentro do modal, emite `created`
- [X] `AlbumsView.vue` (Meus Álbuns): `useAsyncData` com `initialData: []`, `isCreating` e `albumToDelete`, álbum novo no topo, excluir pessimista (modal aberto se falhar), cartão com `stretched-link` e "Excluir" por cima (`position-relative` + `z-index`), selo Pública/Privada, estado vazio, pluralização
- [X] `AlbumDetailView.vue`: `watch` no `:id`, `403`/`404` no lugar do conteúdo (sem toast) com botão para sair, "Remover do álbum" só para a dona e pessimista, toast de sucesso, estado vazio diferente para a dona
- [ ] Modal de criação, lista e detalhe testados; cartão clicável com "Excluir" funcionando por cima

**Etapa 4 — O modal "Salvar" e o botão no Detalhe**

- [X] `AddToAlbumModal.vue`: `useAsyncData` do status, caixas com `:checked` + `@change` (nunca `v-model`), cadeado nos privados, cerca por linha (`Set` reativo + `:disabled`), `toggle` com `runOptimistic`, cerca liberada no `.finally`, estado vazio com link para criar
- [X] Botão "Salvar" no Detalhe da foto para todos (visitante → login com `redirect`), com a cerca do `useAuthenticatedAction` e o modal num `v-if`
- [X] Extra: `BaseModal` com `watch(..., { immediate: true })` — modais montados já abertos também ligam o Esc e travam a rolagem
- [ ] Modal testado (marcado conforme o servidor, otimista, rollback, uma requisição por clique duplo)

**Etapa 5 — Debounce, Tela de Busca e Navbar**

- [X] `composables/useDebouncedValue.js` (`watch` + `setTimeout`/`clearTimeout`, valor inicial igual à origem, `onUnmounted` limpa o timer)
- [X] `SearchView.vue`: `typedText` / `term` / `normalizedTerm`, estado inicial de `route.query.q` (com `typeof`), resposta vazia pronta com termo curto, `watch` lendo e escrevendo a URL (`router.replace`), seções "Pessoas" e "Fotos", "Nada encontrado para ...", dica do mínimo, foco no campo
- [X] Navbar: `<form role="search">` com `@submit.prevent`, ignora vazio, `router.push({ name: 'search', query: { q } })` e limpa o campo, visível para visitantes; item "Meus Álbuns" no menu do avatar
- [ ] Uma palavra inteira sem pausa → uma requisição (Network); F5 e link com o termo funcionam; Voltar não passa por cada pausa

**Etapa 6 — Teste Prático Completo**

- [ ] Os seis passos testados em sequência, a partir do login, sem digitar nenhuma URL (exceto os links compartilhados e o id inexistente)
