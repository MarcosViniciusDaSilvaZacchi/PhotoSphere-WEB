# Atividade Prática - Aula 11

## Seguir Pessoas, Seguidores/Seguindo e o Feed de Quem Eu Sigo (Trilhas API + Frontend)

**Baseado em:** roteiro da Aula 11 — trilha API (Shortz-App API) e roteiro da Aula 11 — trilha Frontend (Shortz-App)

**Aplicação:** este enunciado vale para qualquer projeto sorteado na Lista de Projetos para Programação Web — use a mesma ficha de preparação das aulas anteriores, reaproveitando os campos já preenchidos (nome do model da sua entidade, rota, nome dos contadores). Seguir é uma relação entre usuários, não entre usuário e entidade; por isso a maior parte do trabalho de hoje é idêntica para todo mundo, e só o feed de quem eu sigo depende da sua entidade principal. O Grupo A/B também não muda nada.

**Pré-requisito:** Atividade 10 concluída nas duas trilhas — curtir/comentar com transações, atualização otimista no front, perfil público com a lista de itens da pessoa, `optionalAuth`, e três contas de usuário para os testes (duas não bastam: veja a Parte A, Etapa 4).

> ⚠️ **Ordem de execução:** faça a Parte A (API) antes da Parte B (Frontend), como nas atividades anteriores.

---

## 1. Objetivo

Ao final desta atividade, você deve ter, no seu próprio projeto:

**Do lado do back-end (API):**

- Uma tabela `follows` que liga usuário a usuário, com apelidos (`Follower` / `Following`) nas associações e com índice único composto mais um índice em `following_id`;
- `POST /api/users/:userId/toggle-follow` com três escritas em uma transação (a linha e os dois contadores), `400` para id inválido e para "seguir a si mesmo", `404` para usuário inexistente;
- `GET .../follow-status`, e as listas públicas `GET .../followers` e `GET .../following`;
- `isFollowing` no perfil público (a pendência que a Atividade 09 deixou);
- `GET /api/following-<suas-entidades>`, o feed filtrado pelas pessoas que o usuário segue, com `page` / `limit`.

**Do lado do front-end:**

- Um `FollowButton` com atualização otimista que compartilha o estado com o perfil por `v-model` (`defineModel`), de modo que o contador de seguidores do perfil muda junto com o botão;
- As telas de Seguidores e Seguindo (uma só implementação, duas rotas, por props da rota), com abas e estados vazios;
- A tela do feed de quem eu sigo, com rota e "Carregar mais", alcançável pelo item da Sidebar;
- Comportamento correto para visitante (seguir leva ao login e volta ao perfil).

**Você também deve ser capaz de explicar com suas palavras:**

1. Por que uma tabela que liga a mesma tabela duas vezes precisa de apelidos (`as`), e como você "lê em voz alta" `getFollowers` e `getFollowing` sem trocá-las;
2. Por que a ordem das colunas num índice composto importa, e por que a tabela tem um segundo índice;
3. Por que `followerId === followingId` nunca dava `true` quando o id vinha direto de `req.params`, e onde a conversão deve acontecer;
4. Em que situação usar `v-model` / `defineModel` em vez do padrão "valor inicial → estado próprio" da Atividade 10;
5. Por que, com `defineModel`, ler o valor logo depois de atribuí-lo devolve o antigo, e como evitar isso;
6. Por que o feed filtrado devolve `[]` cedo quando você não segue ninguém.

---

## 2. Antes de começar: adapte os nomes à sua entidade

Confirme (nada novo na ficha, só anote o que vai usar):

| Nome | Exemplo (Shortz-App) | O seu projeto |
|---|---|---|
| Contador de seguidores no model `User` | `followersCount` | |
| Contador de seguindo no model `User` | `followingCount` | |
| Rota do feed filtrado | `/api/following-videos` | `/api/following-<suas-entidades>` |

> 💡 Os dois contadores do `User` já existem desde a Atividade 02 (e estavam em `0`). Se, no seu projeto, tiverem outro nome, use o seu.

---

# PARTE A — Backend

## 3. Etapa 1 — Model Follow e Associações

1. Crie `modules/follow/followModel.js` (Bloco 3.1 do roteiro de API): `followerId` e `followingId`, ambos `references: users`, índice único `['follower_id', 'following_id']` e o índice simples `['following_id']`.
2. Em `config/associations.js`, importe o model e declare as duas associações com apelido:

   ```js
   Follow.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' });
   Follow.belongsTo(User, { as: 'Following', foreignKey: 'followingId' });
   ```

3. Reinicie a API e confira no banco que a tabela `follows` existe, com os dois índices.

**Checklist desta etapa:**

- [ ] `followModel.js` criado, com os dois índices
- [ ] Associações com apelidos declaradas
- [ ] Tabela e índices conferidos no banco

## 4. Etapa 2 — Service, Controller e Rotas

Siga o Bloco 4 do roteiro de API. O conteúdo é o mesmo para todo mundo (usuário ↔ usuário), com um ponto de atenção: troque só os nomes dos seus contadores do `User`.

- **`followService`:** `toggleFollow` (`400` se for a própria pessoa → `404` se o alvo não existe → transação com `findOrCreate` e os dois contadores, todos com `{ transaction: t }` → `reload()` do alvo → `{ isFollowing, followersCount }`), `getFollowStatus` (booleano), `getFollowers` e `getFollowing` (com `include` usando o apelido certo e `.map` para entregar só as pessoas);
- **`followController`:** com `parseUserId` (converte `req.params.userId` em número e responde `400` se não for um inteiro positivo), `201` / `200` no toggle, e o handler do feed filtrado;
- **`followRoutes`:** `toggle-follow` e `follow-status` autenticadas; `followers` e `following` públicas; o feed filtrado autenticado;
- Registre `followRoutes` no `app.js`, antes do 404 e do `errorHandler`.

> ⚠️ **Três pontos que quase todo mundo erra:** (1) trocar `getFollowers` por `getFollowing` (releia o Bloco 2.1 do roteiro de API em voz alta antes de escrever os `where`); (2) trocar os `where` dos dois contadores (`followersCount` sobe no **seguido**; `followingCount`, em **quem segue**); (3) esquecer a conversão para número — e então conseguir seguir a si mesmo sem nenhum erro.

**Checklist desta etapa:**

- [ ] Três arquivos do módulo `follow`, registrados no `app.js`
- [ ] `parseUserId` convertendo o id na borda
- [ ] Três escritas (linha + dois contadores) numa só transação

## 5. Etapa 3 — Feed Filtrado e `isFollowing` no Perfil

1. No service da sua entidade, crie `getFollowing<SuasEntidades>(userId, page, limit)`: primeiro `Follow.findAll({ where: { followerId: userId }, attributes: ['followingId'] })` e um `.map` para um array de números; se o array for vazio, `return []`; senão, o mesmo `findAll` do seu feed (Atividade 08) com `where: { userId: { [Op.in]: followedIds } }` (importe `Op` de `sequelize`).
2. No controller do `follow`, o handler do feed lê `page` / `limit` (padrões `1` e `12`) e chama o service acima.
3. No `userController.getPublicProfile`, devolva `isFollowing` — só consultado quando há usuário logado e ele não é o dono do perfil; senão, `false`.

**Checklist desta etapa:**

- [ ] Feed filtrado com `Op.in`, paginado, devolvendo `[]` para quem não segue ninguém
- [ ] `isFollowing` no perfil público

## 6. Etapa 4 — Testando

Faça os testes do Bloco 8 do roteiro de API, adaptados aos seus nomes. Use três contas (A, B e C):

1. `toggle-follow` sem token `401`; id `abc` → `400`; seguir a si mesmo → `400`; usuário `99999` → `404`.
2. A segue B → `201`, `followersCount: 1`; A de novo → `200`, `0`; de novo → `201`, `1`; C segue B → `2`; B segue A.
3. Contadores dos dois lados: B com 2 seguidores e 1 seguindo; A com 1 e 1; C com 0 e 1.
4. `follow-status` e `isFollowing` no perfil: visitante `false`; A olhando B `true`; C olhando A `false`; B olhando o próprio perfil `false` (e `isOwner: true`).
5. `followers` de B → quem segue B (C e A, a mais recente primeiro); `following` de A → quem A segue; sem `password` nos itens; usuário inexistente `404`.
6. Feed filtrado: sem token `401`; A (segue B) vê só os itens de B; `?page=2&limit=1` → `[]` se B tem 1 item; uma conta que não segue ninguém → `[]`.
7. No banco, tente inserir uma linha repetida em `follows` → o banco recusa.
8. Regressão: curtir, comentar, upload, edição e exclusão; `GET /feed` como antes.

**Checklist desta etapa:**

- [ ] Os oito testes acima executados com sucesso

---

# PARTE B — Frontend

## 7. Contextualização rápida e Checagem de Alcançabilidade (ADR-012)

Responda antes de programar (no `checklists.md` ou em um comentário no topo da sua tela de feed filtrado):

| Peça | Caminho(s) de clique que você vai construir |
|---|---|
| Seguir / deixar de seguir | botão no perfil público de outra pessoa; visitante → login → volta ao perfil |
| Listas de seguidores/seguindo | os números "Seguidores"/"Seguindo" do perfil viram links; abas entre as duas listas; link de volta |
| Feed filtrado | um clique a partir de uma tela existente (o item "Seguindo" da Sidebar) |

> ⚠️ **Verifique antes de programar:** no `TheSidebar.vue` do seu projeto, o `router-link` de "Seguindo" (ou equivalente) aponta para um path que existe no seu `router/index.js`? Se não, ajuste um dos dois — e registre o que fez no `checklists.md`. (Na Shortz-App, o link existia, mas a rota só nasceu na Aula 11.)

## 8. Etapa 1 — Service

Crie `services/followService.js` com `toggleFollow(userId)`, `getFollowers(userId)`, `getFollowing(userId)` e `getFollowing<SuasEntidades>(page, limit)` (Bloco 3 do roteiro de Frontend).

**Checklist desta etapa:**

- [ ] `followService.js` criado

## 9. Etapa 2 — FollowButton com `defineModel`

Crie o componente (Bloco 4 do roteiro de Frontend): prop `userId`; dois `defineModel` (`following` e `followersCount`); visitante → login com `redirect`; `isBusy`; atualização otimista em três passos usando uma variável local para o novo estado (`nowFollowing`), nunca lendo `following.value` logo após atribuí-lo.

**Checklist desta etapa:**

- [ ] `FollowButton` com `defineModel`, otimista, com rollback e `isBusy`
- [ ] Sem a leitura "logo após atribuir"

## 10. Etapa 3 — Perfil Público Ativo

Na sua tela de perfil público: troque o placeholder pelo `FollowButton`, ligado com `v-model:following="profile.isFollowing"` e `v-model:followers-count="profile.followersCount"`; o botão aparece para todos que não são o dono (o visitante é levado ao login); e os números "Seguidores"/"Seguindo" viram `router-link`s para as listas.

**Checklist desta etapa:**

- [ ] Botão ativo, com o contador do cartão mudando junto
- [ ] Números do perfil viram links

## 11. Etapa 4 — Listas e Feed Filtrado

1. **`FollowListView`:** uma tela para as duas rotas, recebendo `kind` da definição da rota (`props: { kind: 'followers' }` / `'following'`); duas chamadas em sequência (perfil → lista, porque a rota usa o `username` e a API usa o id); `watch(() => [props.kind, route.params.username], loadList, { immediate: true })`; abas com a ativa vinda de `kind`; estados vazios com o nome da pessoa;
2. **Tela do feed filtrado:** a mesma estrutura do seu Feed (Atividade 08), com `page` / `hasMore` / "Carregar mais" e um estado vazio com link para o Feed;
3. **Rotas no `router/index.js`:** o feed filtrado (`requiresAuth`, mesmo path do link da Sidebar) e as duas rotas de lista (públicas).

**Checklist desta etapa:**

- [ ] Uma tela de lista, duas rotas, abas funcionando
- [ ] Feed filtrado com rota e acessível pela Sidebar

## 12. Etapa 5 — Teste Prático Completo (só de clique em clique)

1. Visitante (janela anônima): o botão aparece; o clique leva ao login e volta ao perfil depois de entrar.
2. Logado: "Seguir" muda botão e contador do cartão na hora; F5 mantém; "Seguindo" desfaz.
3. DevTools → Slow 4G: a mudança é instantânea. Offline: muda e volta atrás, com a mensagem de erro.
4. Confira que o contador nunca vai para `-1` ao seguir.
5. No seu perfil, não há botão de seguir; os números são links.
6. Seguidores → Seguindo (aba): troca sem recarregar a página; clicar em uma pessoa leva ao perfil dela; usuário inexistente mostra o erro; listas vazias mostram a mensagem.
7. Troque de uma pessoa que você segue para uma que não segue: o botão reflete a pessoa nova.
8. Pela Sidebar, abra o feed filtrado: só itens de quem você segue; deixe de seguir uma pessoa e confira que os itens dela saíram.
9. Regressão: Perfil (editar, itens), Feed, Detalhe (curtir/comentar), Meus Itens, Curtidas, Login/Logout.

**Checklist desta etapa:**

- [ ] Os nove passos acima testados em sequência, a partir do login

---

## 13. Entrega

Envie em resposta a esta tarefa:

1. Na subpasta `01 - Docs` do seu projeto frontend, dentro de uma nova subpasta `atividade11`:
   - Um print do perfil de outra pessoa com o botão "Seguindo" e o contador atualizado, em `.jpg`, com o nome `seguindo.jpg`;
   - Um print da aba Network com o throttling ligado e o botão já alterado, em `.jpg`, com o nome `otimista.jpg`;
   - Um print da mensagem de rollback (Offline), em `.jpg`, com o nome `rollback.jpg`;
   - Um print da lista de Seguidores com as abas, em `.jpg`, com o nome `seguidores.jpg`;
   - Um print do feed filtrado, em `.jpg`, com o nome `feed-seguindo.jpg`;
   - Um print do cliente de banco mostrando a tabela `follows`, seus índices e a recusa de uma linha repetida, em `.jpg`, com o nome `follows.jpg`;
   - Um print de cada `curl` da Parte A, Etapa 4, em `.jpg`;
   - Um `respostas.md` com um parágrafo curto para cada uma das seis perguntas da Seção 1 ("Você também deve ser capaz de explicar...");
   - Atualize `checklists.md` com todos os checklists desta atividade marcados.
2. Um `.zip` do seu projeto de back-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-backend.zip`, incluindo o módulo `follow`;
3. Um `.zip` do seu projeto de front-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-frontend.zip`, incluindo `FollowButton`, as duas telas novas e o `router/index.js` atualizado.
