# Checklists — PhotoSphere | Atividade 11

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 11 — Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| Contador de seguidores no model `User` | `followersCount` | `followersCount` |
| Contador de seguindo no model `User` | `followingCount` | `followingCount` |
| Rota do feed filtrado | `/api/following-videos` | `/api/following-photos` |

---

## ATIVIDADE 11 — PARTE A: Backend (Seguir, Seguidores/Seguindo e Feed Filtrado)

**Etapa 1 — Model Follow e Associações**

- [X] `modules/follow/followModel.js` criado, com o índice único `idx_unique_follow_follower_following (follower_id, following_id)` e o índice simples `idx_follows_following_id (following_id)`
- [X] Associações com apelidos declaradas em `config/associations.js` (`Follower` por `followerId`, `Following` por `followingId`)
- [X] Tabela `follows` e os dois índices conferidos no banco

**Etapa 2 — Service, Controller e Rotas**

- [X] Três arquivos do módulo `follow` (`followService.js`, `followController.js`, `followRoutes.js`), registrados no `server.js` (o `app.js` do roteiro) antes do 404 e do `errorHandler`
- [X] `parseUserId` convertendo o id na borda (controller): `abc`, `2.5` e `-3` → `400`
- [X] Três escritas (linha + `followersCount` do seguido + `followingCount` de quem segue) numa só transação, todas com `{ transaction: t }`, e `reload()` do alvo antes de responder `{ isFollowing, followersCount }`
- [X] `toggle-follow` e `follow-status` autenticadas; `followers` e `following` públicas; `following-photos` autenticada

**Etapa 3 — Feed Filtrado e `isFollowing` no Perfil**

- [X] `photoService.getFollowingPhotos(userId, page, limit)` com `Op.in`, paginado (padrões `1` e `12` no controller), devolvendo `[]` cedo para quem não segue ninguém
- [X] `isFollowing` no perfil público (`userService.getPublicProfile`), consultado só quando há usuário logado que não é o dono; senão, `false`

**Etapa 4 — Testando (contas A, B e C)**

- [X] `toggle-follow` sem token `401`; id `abc` `400`; seguir a si mesmo `400`; usuário `99999` `404`
- [X] A segue B `201` (`followersCount: 1`); A de novo `200` (`0`); de novo `201` (`1`); C segue B (`2`); B segue A
- [X] Contadores: B com 2 seguidores e 1 seguindo; A com 1 e 1; C com 0 e 1
- [X] `follow-status` e `isFollowing`: visitante `false`; A olhando B `true`; C olhando A `false`; B no próprio perfil `false` e `isOwner: true`
- [X] `followers` de B → C e A (mais recente primeiro); `following` de A → B; sem `password`; usuário inexistente `404`
- [X] Feed filtrado: sem token `401`; A vê só as fotos de B; `?page=2&limit=1` → `[]` (B com 1 foto); conta que não segue ninguém → `[]`
- [X] No banco, linha repetida em `follows` recusada (`Duplicate entry ... for key 'idx_unique_follow_follower_following'`)
- [X] Regressão: curtir, comentar, upload, edição e exclusão; `GET /feed` como antes

---

## ATIVIDADE 11 — PARTE B: Frontend (FollowButton, Listas e Feed "Seguindo")

**Contextualização e Checagem de Alcançabilidade (ADR-012)**

| Peça | Caminho(s) de clique construídos |
|---|---|
| Seguir / deixar de seguir | botão no perfil público de outra pessoa; visitante → login (`?redirect=`) → volta ao perfil |
| Listas de seguidores/seguindo | os números "Seguidores"/"Seguindo" do perfil viram links; abas entre as duas listas; link "Voltar ao perfil" |
| Feed filtrado | um clique a partir de qualquer tela: item **"Seguindo"** da navegação principal da `AppNavbar` |

> **Verificação da Sidebar:** o PhotoSphere **não tem `TheSidebar.vue`**. A navegação principal do projeto fica na `AppNavbar.vue` (links centrais "Início" e "Feed", desde a Aula 09). Não existia nenhum link nem rota "Seguindo". **O que foi feito:** criada a rota `/following` (`name: 'following-feed'`, `requiresAuth`) e acrescentado o item "Seguindo" na navegação principal da Navbar, apontando para o mesmo path, visível só para quem está logado.

**Etapa 1 — Service**

- [X] `src/services/followService.js` criado (`toggleFollow`, `getFollowers`, `getFollowing`, `getFollowingPhotos`)

**Etapa 2 — FollowButton com `defineModel`**

- [X] `src/components/FollowButton.vue` com prop `userId`, dois `defineModel` (`following` e `followersCount`), otimista, com rollback, `isBusy` e visitante → login com `redirect`
- [X] Sem a leitura "logo após atribuir": o novo estado fica na variável local `nowFollowing`

**Etapa 3 — Perfil Público Ativo**

- [X] Placeholder "Seguir chega em breve" trocado pelo `FollowButton` com `v-model:following="profile.isFollowing"` e `v-model:followers-count="profile.followersCount"`; aparece para todos que não são o dono
- [X] Números "Seguidores"/"Seguindo" do perfil viram `router-link`s para as listas

**Etapa 4 — Listas e Feed Filtrado**

- [X] `src/views/FollowListView.vue`: uma tela para as duas rotas (`props: { kind }`), perfil → lista em sequência, `watch(() => [props.kind, route.params.username], loadList, { immediate: true })`, abas com a ativa vinda de `kind`, estados vazios com o nome da pessoa
- [X] `src/views/FollowingFeedView.vue`: mesma estrutura do Feed (`page` / `hasMore` / "Carregar mais") e estado vazio com link para o Feed
- [X] Rotas: `/following` (`requiresAuth`), `/profile/:username/followers` e `/profile/:username/following` (públicas)

**Etapa 5 — Teste Prático Completo (só de clique em clique)**

- [X] Visitante (janela anônima): o botão aparece; o clique leva ao login e volta ao perfil depois de entrar
- [X] Logado: "Seguir" muda botão e contador do cartão na hora; F5 mantém; "Seguindo" desfaz
- [X] Slow 4G: mudança instantânea. Offline: muda, volta atrás e mostra a mensagem de erro
- [X] O contador nunca vai para `-1` ao seguir
- [X] No meu perfil não há botão de seguir; os números são links
- [X] Seguidores → Seguindo (aba) troca sem recarregar; clicar numa pessoa leva ao perfil dela; usuário inexistente mostra o erro; listas vazias mostram a mensagem
- [X] Trocar de uma pessoa que sigo para uma que não sigo: o botão reflete a pessoa nova
- [X] Pelo item "Seguindo" da Navbar: só fotos de quem eu sigo; deixar de seguir tira as fotos da pessoa
- [X] Regressão: Perfil (editar, fotos), Feed, Detalhe (curtir/comentar), Minhas Fotos, Curtidas, Login/Logout
