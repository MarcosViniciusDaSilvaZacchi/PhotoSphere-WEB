# Respostas — Atividade 11

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15)  
**Aluno:** Marcos Vinicius da Silva Zacchi  

---

### 1. Por que uma tabela que liga a mesma tabela duas vezes precisa de apelidos (`as`), e como "ler em voz alta" `getFollowers` e `getFollowing` sem trocá-las?

A tabela `follows` tem duas chaves estrangeiras, `followerId` e `followingId`, e as duas apontam para `users`. Sem apelido, um `include: [User]` fica ambíguo: o Sequelize não sabe se o usuário que deve vir junto é quem segue ou quem é seguido (e nem deixa declarar duas associações iguais para o mesmo par de models). Com `Follow.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' })` e `Follow.belongsTo(User, { as: 'Following', foreignKey: 'followingId' })`, cada `include` diz qual dos dois caminhos seguir. Para não trocar as funções, eu leio a consulta em voz alta. `getFollowers(B)` fica "as linhas em que o **seguido** é B; de cada uma, quero o **Follower**": `where: { followingId: B }` e `as: 'Follower'`. `getFollowing(A)` fica "as linhas em que **quem segue** é A; de cada uma, quero o **Following**": `where: { followerId: A }` e `as: 'Following'`. O `where` e o apelido sempre ficam em colunas opostas.

### 2. Por que a ordem das colunas num índice composto importa, e por que a tabela tem um segundo índice?

O índice composto `(follower_id, following_id)` fica ordenado primeiro por `follower_id` e, dentro de cada valor dele, por `following_id`. É como uma lista telefônica ordenada por sobrenome e depois por nome: ela serve para achar "todos os Silva" ou "a Maria Silva", mas não serve para achar "todas as Marias". Esse índice atende `WHERE follower_id = ?` (quem eu sigo: o feed filtrado e a lista "Seguindo") e o par exato (a checagem do `findOrCreate` e a garantia de unicidade). Ele não ajuda em `WHERE following_id = ?`, que é a lista de Seguidores e a mais consultada no perfil de quem tem muitos seguidores. Por isso existe o segundo índice, simples, em `following_id`. Sem ele, essa consulta leria a tabela inteira.

### 3. Por que `followerId === followingId` nunca dava `true` quando o id vinha direto de `req.params`, e onde a conversão deve acontecer?

Tudo o que vem da URL é texto: em `/users/5/toggle-follow`, `req.params.userId` é `"5"`. Já o `req.user.id` vem do payload do JWT, onde o id foi gravado como número (`5`). A comparação estrita `5 === "5"` dá `false` porque os tipos são diferentes. Assim a regra "não pode seguir a si mesmo" nunca disparava, e a pessoa conseguia se seguir sem nenhum erro (e ganhava um seguidor falso). A conversão deve acontecer na borda, no controller, que é quem lê a requisição. Lá, `parseUserId` transforma o texto em número e já responde `400` se não for um inteiro positivo (`abc`, `2.5`, `-3`). O service recebe só números e pode usar `===` com segurança.

### 4. Em que situação usar `v-model` / `defineModel` em vez do padrão "valor inicial → estado próprio" da Atividade 10?

O padrão da Atividade 10 (o `LikeButton` recebe `liked`/`count` como valor inicial e passa a ter estado próprio) serve quando o dado só aparece dentro do componente: o número de curtidas é desenhado pelo próprio botão, e o pai só precisa saber do resultado no máximo por um evento. O `defineModel` serve quando o mesmo dado aparece também fora do componente e as duas partes precisam ficar sincronizadas. No perfil, o número de "Seguidores" fica no cartão do pai, longe do botão. Com `v-model:following` e `v-model:followers-count`, botão e perfil compartilham o mesmo estado (`profile.isFollowing` e `profile.followersCount`): o botão muda o valor, e o cartão muda junto, sem evento manual e sem duas cópias que poderiam divergir.

### 5. Por que, com `defineModel`, ler o valor logo depois de atribuí-lo devolve o antigo, e como evitar isso?

O `defineModel` não guarda o valor dentro do filho. `following.value = true` não altera nada localmente: só emite `update:following` para o pai. O pai atualiza o `profile.isFollowing`, e o valor novo só volta ao filho pela prop, no próximo ciclo de renderização do Vue. Na linha seguinte à atribuição, `following.value` ainda devolve o valor antigo. Se o cálculo do contador usasse `following.value` ali, ele somaria quando devia subtrair (o contador podia ir a `-1`). A solução é calcular o novo estado uma vez, numa variável local (`const nowFollowing = !previous.following`), e usar essa variável no resto da função, sem reler o model logo depois de atribuí-lo.

### 6. Por que o feed filtrado devolve `[]` cedo quando você não segue ninguém?

O feed filtrado é feito em duas etapas: primeiro os ids de quem eu sigo, depois as fotos com `userId IN (...)`. Se a primeira lista vier vazia, não há o que buscar: nenhuma foto pode pertencer a "ninguém". Devolver `[]` na hora evita uma segunda consulta inútil ao banco e evita o caso de borda do `IN ()` vazio (o Sequelize até contorna com uma condição sempre falsa, mas é uma ida ao banco para responder algo que já se sabe). A resposta continua no mesmo formato (uma lista vazia), e a tela mostra o estado vazio com o convite para seguir pessoas.
