# Checklists — PhotoSphere | Atividade 12

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 12 — Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| Entidade principal | `Video` | `Photo` |
| Service que a cria e mexe no contador do usuário | `videoService.uploadVideo` | `photoService.createPhoto` |
| Contador do usuário afetado | `videosCount` | `photosCount` |
| Controller do feed geral | `userController.getFeed` | `photoController.getFeed` |
| Controller do feed filtrado | `followController.getFollowingVideos` | `followController.getFollowingPhotos` |
| Telas que leem dados ao montar | Detalhe, Perfil Público, Curtidas, Meus Vídeos, Listas de seguidores, Comentários, Feed, Feed filtrado | `PhotoDetailView`, `PublicProfileView`, `LikedPhotosView`, `MyPhotosView`, `FollowListView`, `CommentSection`, `FeedView`, `FollowingFeedView` |

---

## ATIVIDADE 12 — PARTE A: Backend (Leitura Crítica, Paginação e Transação)

**Etapa 1 — Leitura guiada**

- [X] `checkpoint-02.md` criado, com as respostas dos Blocos 2.1 a 2.6 e as três perguntas extras

**Etapa 2 — Corrigindo a paginação**

- [X] Problema reproduzido e anotado antes da correção (`paginacao-antes.jpg`, com o código da Atividade 11)
- [X] `PAGINATION` (`DEFAULT_PAGE: 1`, `DEFAULT_LIMIT: 12`, `MAX_LIMIT: 50`) e `utils/pagination.js` (`parsePagination`, com `>= 1`) criados e usados nos dois controllers (`photoController.getFeed`/`listPhotos` e `followController.getFollowingPhotos`) e nos dois services
- [X] Busca em `modules/` sem nenhum `|| 12`, `|| 10`, `limit = 10` ou `limit = 12`
- [X] Testes do Bloco 3.4 com o resultado esperado (`limit=-3`, `limit=100000`, `page=-2&limit=2`, `page=2&limit=1`)

**Etapa 3 — A transação do registro + contador**

- [X] `photoService.createPhoto` dentro de `sequelize.transaction`, com `{ transaction: t }` no `Photo.create` e no `User.increment('photosCount')`
- [X] Criação testada: `201` e `photosCount` incrementado

**Etapa 4 — Regressão da API**

- [X] Perfil com `isFollowing`, feed, feed filtrado, seguir, seguidores, curtir, curtidas, comentar, comentários e "minhas fotos" respondendo como esperado, sem regressão

---

## ATIVIDADE 12 — PARTE B: Frontend (Constantes, Toasts, Composables e Regressão)

**Etapa 1 — Constantes**

- [X] `src/config/constants.js` criado (`STORAGE_KEYS`, `LIMITS`, `PAGE_SIZE`, `TOAST_DURATION`, `MESSAGES`), com limites iguais aos da API
- [X] `api.js`, `stores/auth.js` (e `MyProfileView`) usam `STORAGE_KEYS`; os services dos feeds usam `PAGE_SIZE`

**Etapa 2 — Toasts e interceptor**

- [X] `src/composables/useToast.js` (lista singleton fora da função) e `src/components/ToastContainer.vue` (montado uma vez em `App.vue`, `z-index` acima do modal)
- [X] `services/api.js` reescrito com `notifyIfNeeded`: `401` → Login; `silent` → sem toast; `GET` → sem toast; outras ações → toast de erro
- [X] `silent: true` apenas nos formulários: login, cadastro, logout, edição de perfil, upload e edição da foto (no Axios, a config é o 3º argumento do `post`/`put`)
- [X] Teste: login com senha errada → erro no formulário, sem toast; curtir com Offline → toast e o botão volta

**Etapa 3 — `useAsyncData` e `usePaginatedList` nas telas**

- [X] `useAsyncData` (com `lastCallId`, `initialData`, `watch`) e `usePaginatedList` criados
- [X] As oito telas de leitura refatoradas: Detalhe e Perfil Público (com `watch` na rota), Curtidas, Minhas Fotos, Listas de seguidores (`watch` em `[kind, username]`), Comentários (`watch` no `photoId`), Feed e Feed "Seguindo" (`usePaginatedList`), sem `apiErrorMessage`/`errorMessage` de estado sobrando
- [X] Cada tela testada individualmente no navegador

> **Decisão sobre telas de formulário:** `MyProfileView`, `EditPhotoView`, `UploadView`, `LoginView` e `RegisterView` **ficaram de fora** dos composables, de propósito. Elas não "exibem" o dado lido: copiam o que a API devolve para os campos de um formulário que a pessoa vai editar, e o erro que importa nelas é o do envio, campo a campo. Com o `useAsyncData`, seria preciso copiar o `data` para os campos de novo (num `watch`), e o resultado ficaria mais complicado do que o `onMounted` atual. Os composables servem às telas que **mostram** dados.

**Etapa 4 — `useAuthenticatedAction` e os botões**

- [X] `useAuthenticatedAction` criado e usado no `LikeButton` e no `FollowButton`; os dois perderam o `errorMessage` local e a cerca repetida, e o `catch` só desfaz a mudança visual
- [X] Três cliques rápidos, com Slow 4G, geram uma única requisição (`uma-requisicao.jpg`)

**Etapa 5 — Constantes nos formulários**

- [X] `RegisterView`, `UploadView`, `EditPhotoView`, `MyProfileView` e `CommentSection` usam `LIMITS.*`; a busca por `3`, `6`, `20`, `100`, `255` e `500` em `src/` só encontra os valores em `config/constants.js`

**Etapa 6 — Teste de regressão completo**

- [X] Todos os passos realizados (conta nova), sem regressão e sem erros vermelhos no Console (além dos provocados com Offline)
