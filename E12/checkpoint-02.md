# Checkpoint 02 — Leitura Crítica da API

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15)  
**Aluno:** Marcos Vinicius da Silva Zacchi  

> Leitura guiada dos módulos da API depois da Atividade 11 (`user`, `photo`, `like`, `comment`, `follow`, `search`), feita com as buscas do VS Code (`Ctrl+Shift+F`). Resposta em sim/não; quando há problema, arquivo e linha. As linhas indicadas são as do código **antes** das correções desta atividade, salvo quando dito o contrário.

---

## Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| Entidade principal | `Video` | `Photo` |
| Service que a cria e mexe no contador do usuário | `videoService.uploadVideo` | `photoService.createPhoto` |
| Contador do usuário afetado | `videosCount` | `photosCount` |
| Controller do feed geral | `userController.getFeed` | `photoController.getFeed` (rota `GET /api/feed`) |
| Controller do feed filtrado | `followController.getFollowingVideos` | `followController.getFollowingPhotos` (rota `GET /api/following-photos`) |
| Telas que leem dados ao montar | Detalhe, Perfil Público, Curtidas, Meus Vídeos, Listas de seguidores, Comentários, Feed, Feed filtrado | `PhotoDetailView`, `PublicProfileView`, `LikedPhotosView`, `MyPhotosView`, `FollowListView`, `CommentSection`, `FeedView`, `FollowingFeedView` |

---

## 2.1 — Camadas: cada arquivo faz só o seu papel?

| Pergunta | Resposta | Evidência |
|---|---|---|
| Alguma rota tem lógica de negócio (em vez de só ligar verbo + caminho ao controller)? | **Não** | Os `*Routes.js` só encadeiam middlewares e `asyncHandler(controller)`. |
| Algum controller acessa o banco direto (model) em vez de chamar o service? | **Não** | Todos os controllers chamam `*Service`. |
| Algum service lê `req`/`res`? | **Não** | Services recebem só valores (`userId`, `photoId`, `page`...). |
| Existe código morto ou alias sem uso? | **Sim** (pequeno) | `photoService.js`: `listPhotos: getFeed` e `getPhotoById` não são usados por nenhuma rota; `GET /api/photos` usa `getFeed`. Fica registrado, sem impacto. |

## 2.2 — Números soltos e paginação

| Pergunta | Resposta | Evidência |
|---|---|---|
| O "tamanho de página" aparece solto em mais de um lugar? | **Sim** (corrigido hoje) | `photoController.js:22-23` e `:30-31` (`limit` padrão `10`), `photoService.js` `getFeed(page = 1, limit = 10)` e o clamp `Math.min(..., 50)`; `followController.js:61-62` (`|| 12`) e `photoService.getFollowingPhotos(..., limit = 12)`. Dois padrões diferentes (10 e 12) para a mesma ideia. |
| `?limit=-3` é tratado? | **Não no feed filtrado** (corrigido hoje) | `Number.parseInt('-3') || 12` dá `-3` (é *truthy*) → `LIMIT -3` → erro `500` no MySQL. No feed geral, o clamp antigo transformava `-3` em `1` (um item só, sem aviso). |
| Existe teto para o `limit`? | **Só no feed geral** (corrigido hoje) | O feed filtrado aceitava `?limit=100000`. |

**Correção:** `PAGINATION` (`DEFAULT_PAGE: 1`, `DEFAULT_LIMIT: 12`, `MAX_LIMIT: 50`) em `config/constants.js`, `utils/pagination.js` com `parsePagination(query)` usada nos dois controllers, e os padrões dos dois services trocados pelas constantes. A busca por `|| 12`, `|| 10`, `limit = 10` e `limit = 12` em `modules/` não encontra mais nada.

## 2.3 — Escritas duplas: estão em transação?

| Escrita dupla | Em transação? | Evidência |
|---|---|---|
| Curtir/descurtir (linha + `likesCount`) | **Sim** | `likeService.js:33-56` |
| Comentar (linha + `commentsCount`) | **Sim** | `commentService.js:33-45` |
| Seguir (linha + `followersCount` + `followingCount`) | **Sim** | `followService.js:50-72` |
| Excluir foto (curtidas + comentários + foto + `photosCount`) | **Sim** | `photoService.js` `deletePhoto` |
| **Upload de foto (linha em `photos` + `photosCount`)** | **Não** (corrigido hoje) | `photoService.createPhoto`: `Photo.create` e `User.increment` soltos. Se o `increment` falhasse, a foto existiria e o perfil mostraria uma foto a menos. Agora as duas escritas estão em `sequelize.transaction`, com `{ transaction: t }` em ambas. |

## 2.4 — Validação de entrada

| Pergunta | Resposta | Evidência |
|---|---|---|
| `trim()` vem antes de `notEmpty()`/`isLength()` nos campos obrigatórios? | **Sim** | Corrigido na Aula 10 (`userValidator.js`, `photoValidator.js`, `commentValidator.js`). |
| Algum limite de validação está escrito à mão no validator? | **Não** | Todos usam `VALIDATION.*` de `config/constants.js`. |
| Os limites do model batem com os do validator? | **Sim, mas duplicados** | `photoModel.js:21` `STRING(100)` / `:25` `STRING(500)` e `userModel.js:37` `STRING(255)` repetem `TITLE_MAX`, `DESCRIPTION_MAX` e `BIO_MAX`. |

## 2.5 — Identificadores inválidos na URL

| Rota testada | Status | Por quê |
|---|---|---|
| `GET /api/photos/abc` | `404` | `Photo.findByPk('abc')` não acha nada e cai no "Foto não encontrada". |
| `POST /api/photos/abc/toggle-like` (com token) | `404` | Mesmo caminho: o id não é validado, só não é encontrado. |
| `GET /api/users/abc/followers` | `400` | O `followController` converte o id com `parseUserId` e recusa. |

**Os módulos não respondem com o mesmo status.** Só o `follow` (o mais novo) valida o id na borda; `photo`, `like` e `comment` respondem `404` para `abc`, o que mistura "id malformado" com "item que não existe". A padronização (um `utils/parseId.js` usado por todos) está prevista para a Aula 13.

## 2.6 — Dados sensíveis e segurança

| Pergunta | Resposta | Evidência |
|---|---|---|
| Alguma resposta devolve `password` (ou o hash)? | **Não** | Toda consulta de usuário usa `attributes` explícito (`AUTHOR_ATTRIBUTES`, `PUBLIC_USER_ATTRIBUTES`, listas em `userService`). |
| O token carrega dado sensível? | **Não** | Payload: `id`, `username`, `isAdmin` (`userService.js` `loginUser`). |
| Existe atalho de desenvolvimento no código de autenticação? | **Sim** | `auth.js:27` e `optionalAuth.js:29` aceitam `dev-token...` como o usuário 1; `userController.js:20-24` aceita `ADM`/`123456` com o banco fora do ar. São resquícios das primeiras aulas; ficam registrados para a revisão da Aula 15 (painel admin e autorização). |

---

## Perguntas extras

**1. Quantas vezes aparece o padrão `const error = new Error(...)` / `error.status = N` / `throw error`?**

**15 vezes** (contando cada `error.status =`), em 11 arquivos:

- `modules/user/userService.js` — 4 (`:55`, `:98`, `:145`, `:168`);
- `modules/photo/photoValidator.js` — 2 (`:20`, `:30`);
- `modules/photo/photoService.js`, `modules/like/likeService.js`, `modules/comment/commentService.js`, `modules/follow/followService.js` — 1 cada, dentro de uma função `httpError(message, status)` **copiada nos quatro arquivos**;
- `modules/follow/followController.js` (`:21`), `modules/comment/commentValidator.js` (`:16`), `modules/user/userValidator.js` (`:21`), `middlewares/photoMulter.js` (`:35`), `middlewares/profileMulter.js` (`:27`) — 1 cada.

E há 3 `throw new Error(...)` **sem** status (`userService.js:14`, `:46`, `:51`), que viram `500` — o de duplicidade no cadastro é proposital desde a Aula 03.

**2. Que outro valor numérico solto aparece em mais de um arquivo?**

Os limites de texto: `100`, `500` e `255` estão em `config/constants.js` **e** repetidos nos models (`photoModel.js:21`, `:25`; `userModel.js:37`). Também o tamanho máximo de upload, escrito como conta em cada Multer (`photoMulter.js:45` → `10 * 1024 * 1024`; `profileMulter.js:37` → `5 * 1024 * 1024`).

**3. Os três `curl` de id inválido respondem com o mesmo status?**

**Não** — veja a tabela da seção 2.5: `404`, `404` e `400`.

---

## Reflexão: minhas próprias pendências (ADR-013)

| O que é | Por que não foi resolvido hoje | Em qual aula será resolvido |
|---|---|---|
| `httpError(message, status)` copiada em quatro services (`photo`, `like`, `comment`, `follow`), e o mesmo padrão escrito à mão no `userService` | Unificar mexe nos cinco services de uma vez; o checkpoint de hoje é de leitura e de paginação, e a troca não muda nenhum comportamento | **Aula 13** — junto do `utils/parseId.js`, que já vai criar a pasta de utilitários de erro/validação |
| `PhotoCard.vue` formata a data com `new Date(...).toLocaleDateString('pt-BR')` em vez de usar `utils/format.js` (que já tem `formatDateTime`/`formatRelativeTime`) | É só apresentação; a Aula 12 já mexe em muitas telas e a troca mudaria o texto que aparece nos cards | **Aula 16** — revisão transversal de experiência de uso (mensagens e formatos padronizados) |
| Atalhos de desenvolvimento na autenticação (`dev-token` em `auth.js`/`optionalAuth.js` e login `ADM` sem banco em `userController.js`) | Removê-los agora quebraria o modo demonstração usado quando o banco está fora do ar, e a autenticação vai ser reescrita de qualquer forma | **Aula 15** — o `isAuthenticated` passa a consultar o banco a cada requisição |
