# Atividade Prática - Aula 10

## Curtidas e Comentários na Entidade Principal (Trilhas API + Frontend)

**Baseado em:** roteiro da **Aula 10 — trilha API (Shortz-App API)** e roteiro da **Aula 10 — trilha Frontend (Shortz-App)**

**Pré-requisito:** Atividade 09 concluída nas duas trilhas — detalhe com `optionalAuth`, `isOwner`, card reutilizável (com slot e autor opcional), Meus Itens, perfil público, `errorHandler` com limpeza de órfãos e **duas contas** de usuário para os testes.

Ao final desta atividade, você deve ter, no seu próprio projeto:

### Do lado do back-end (API):

- Duas tabelas novas — uma para a **curtida** e uma para o **comentário** da sua entidade principal — com associações nos dois sentidos, e um **índice único composto** na tabela de curtidas;

- Dois **contadores** no model da sua entidade (curtidas e comentários), mantidos por **transações**;

- `POST /api/<sua-rota>/:<suaEntidade>Id/toggle-like`, `GET .../like-status`, `GET /api/liked-<entidades>`, `POST` (autenticado, validado) e `GET` (público) de `.../comments`;

- O detalhe da sua entidade devolvendo `isLiked`, e a **exclusão** limpando curtidas e comentários dentro de uma transação;

- A **correção do `trim()`** nos seus validadores antigos.

### Do lado do front-end:

- Um componente de **botão de curtir** com atualização otimista (rollback em caso de erro) e um componente de **seção de comentários**, montados na tela de Detalhe;

- Contadores no seu card; a tela de itens curtidos, com rota, **alcançável por um clique**; Comportamento correto para visitante (curtir leva ao login e volta).

Você também deve ser capaz de **explicar com suas palavras**:

- Por que a regra "uma pessoa só curte uma vez" deve estar **no banco** (índice único composto) e não só no código;

- A diferença entre **contador guardado** e **contador calculado**, e o risco do primeiro (e como a **transação** o elimina);

- O que acontece se um comando dentro de `sequelize.transaction` **esquecer** `{ transaction: t }`;

- O que é **atualização otimista**, quais são seus três passos e quando **não** usá-la;

- Por que o texto de um comentário deve sair com `{{ }}` e nunca com `v-html`;

- Por que `.trim()` precisa vir **antes** de `.notEmpty()`.

## Antes de começar: adapte os nomes à sua entidade

Nada novo na ficha, mas confirme três nomes e anote-os, porque você os usará em todo o código:

| Nome | Exemplo (Shortz-App) | O seu projeto |
|---|---|---|
| Coluna de **contador de curtidas** no model da entidade | `likesCount` | |
| Coluna de **contador de comentários** no model da entidade | `commentsCount` | |
| Nome da chave estrangeira nas tabelas novas | `videoId` | `<suaEntidade>Id` |

💡 Se o seu projeto tem uma palavra mais natural que "curtir" (favoritar, recomendar, fixar), use-a **só na interface**; os nomes de arquivo/tabela podem continuar `Like` / `likes`, para o seu código ficar parecido com o roteiro.

## PARTE A — Backend

### Checklist das tarefas:

- `COMMENT_MAX` e as duas colunas de contador adicionadas

- Models `Like` e `Comment` criados, com o índice único composto no `Like`

- Associações nos dois sentidos

- Tabelas e colunas conferidas no banco

- Módulo `like` completo (3 rotas) e registrado no `app.js`

- Módulo `comment` completo (2 rotas, validador com `trim` primeiro) e registrado

- Todas as escritas duplas (linha + contador) dentro de transação

> ⚠️ **Atenção em relação aos últimos 3 itens acima: quase todo mundo erra:** (1) esquecer o `{ transaction: t }` em algum comando; (2) trocar a **ordem dos parâmetros** `(userId, <suaEntidade>Id, content)` entre controller e service — são todos números, então não dá erro algum, só dados trocados; (3) devolver o comentário criado **sem** o autor.

- Detalhe devolvendo `isLiked` (e os contadores)

- Exclusão em transação, com limpeza de curtidas e comentários

- Contadores no perfil público

- `trim()` movido para o início nos campos obrigatórios

### Checklist dos testes:

- Curtir sem token → `401`; entidade inexistente → `404`.

- B curte → `201`, `liked: true`, contador `1`; B curte de novo → `200`, `liked: false`, `0`; de novo → `201`, `1`; A curte → `2`.

- `like-status` (com e sem token) e `isLiked` no detalhe: visitante `false`; B `true`.

- **No banco**, tente inserir uma curtida repetida à mão → o banco recusa (índice único).

- `liked-<entidades>` com B → os itens, cada um com o autor; sem token → `401`.

- Comentar: sem token `401`; só espaços `400`; 501 caracteres `400`; entidade inexistente `404`; sucesso `201` com o texto **aparado** e o autor.

- Listar comentários sem token → `200`, mais novos primeiro; contador no detalhe igual ao número de itens.

- Excluir uma entidade que tem curtidas e comentários → `200`; **no banco**, nenhuma linha restante em `likes` / `comments` para ela; arquivos removidos; contador do usuário decrementado.

- Título/nome só com espaços (use o script do Bloco 10.9, porque o `curl -F` apara os espaços) → `400` depois da correção.

- Regressão: upload, detalhe, feed, edição e perfil como antes.

## PARTE B — Frontend

### Checklist das tarefas:

- Dois services (do like e do comment) criados

- Formatador (`utils/format.js`) criado

- CSS criado

- `LikeButton` com atualização otimista, rollback e `isBusy`

- Visitante é levado ao login e volta

- Lista com carregando/erro/vazio; formulário validado

- Comentário novo no topo, sem recarregar a lista

- Texto escapado e quebras de linha preservadas

- Detalhe com curtir + comentários

- Contadores no card

- Tela de itens curtidos com rota e acessível por um clique

### Checklist dos testes:

- Visitante (janela anônima): vê o botão e a lista, **sem** formulário; clicar em curtir leva ao login e **volta** ao detalhe depois de entrar.

- Logado: curtir muda o coração **na hora**; F5 mantém; descurtir desfaz.

- DevTools → Network → **Slow 4G**: o coração ainda muda imediatamente. Depois, **Offline**: o coração muda, **volta atrás** e a mensagem de erro aparece.

- Comentar: vazio, só espaços e mais de 500 caracteres geram erro **sem** chamar a API; um comentário válido de duas linhas aparece **no topo**, com as linhas preservadas, e o contador sobe.

- Comente exatamente `<b>teste</b> <img src=x onerror="alert(1)">` → aparece como **texto**, sem negrito e **sem alerta**.

- Os contadores aparecem no card do Feed, do Perfil e de Meus Itens, atualizados.

- Pelo menu/Sidebar, abra a tela de itens curtidos: descurtir um item no detalhe o tira da lista.

- Como A, exclua um item que tem curtidas e comentários → funciona, e o item some da lista de curtidos de B.

- Regressão: Feed, Perfil, Meus Itens (editar/excluir), Upload, Login/Logout.

## Entrega

Envie em resposta a esta tarefa:

1. Na subpasta `01 - Docs` do seu projeto frontend, dentro de uma nova subpasta `atividade10`:
   - Um print do Detalhe com o botão de curtir **ativo** e comentários, em `.jpg`, com o nome `detalhe-interacao.jpg`;
   - Um print da aba Network com o **throttling** ligado (Slow 4G) e o coração já alterado, em `.jpg`, com o nome `otimista.jpg`;
   - Um print da mensagem de **rollback** (com o Offline ligado), em `.jpg`, com o nome `rollback.jpg`;
   - Um print da tela de itens curtidos, em `.jpg`, com o nome `curtidos.jpg`;
   - Um print do **cliente de banco** mostrando a restrição de curtida repetida sendo recusada, em `.jpg`, com o nome `unique.jpg`;
   - Um print de cada `curl` da Parte A, Etapa 4, em `.jpg`;
   - Um `respostas.md` com um **parágrafo curto** para cada uma das seis perguntas da Seção 1 ("Você também deve ser capaz de explicar...");
   - Atualize `checklists.md` com todos os checklists desta atividade marcados.

2. Um `.zip` do seu projeto de back-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-backend.zip`, incluindo os módulos `like` e `comment`;

3. Um `.zip` do seu projeto de front-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-frontend.zip`, incluindo `LikeButton`, `CommentSection`, a tela de itens curtidos e o `router/index.js` atualizado.
