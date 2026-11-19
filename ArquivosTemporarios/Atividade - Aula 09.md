# Atividade Prática - Aula 09

## CRUD do Item, Perfil Público e Limpeza de Arquivos Órfãos (Trilhas API + Frontend)

**Baseado em:** roteiro da **Aula 09 — trilha API (Shortz-App API)** e roteiro da **Aula 09 — trilha Frontend (Shortz-App)**

**Pré-requisito:** Atividade 08 concluída nas duas trilhas — detalhe e feed funcionando, `optionalAuth`, componente de card, telas de Feed e Detalhe reais, pelo menos **dois itens** enviados de verdade (é com eles que você vai testar listar, editar e excluir), e **duas contas** de usuário (você vai precisar testar o que acontece quando uma pessoa tenta mexer no item de outra).

Ao final desta atividade, você deve ter, no seu próprio projeto:

### Do lado do back-end (API):

- A **correção da Aula 08** aplicada ao seu detalhe (contagem de visualizações da resposta coerente com a do banco);

- `GET /api/my-<entidades>` — os itens do usuário logado, do mais novo para o mais antigo;

- `GET /api/<sua-entidade>/:id/edit` — dados do item para pré-preencher um formulário, **só para o dono** (`404` se não existe, `403` se não é seu);

- `PUT /api/<sua-entidade>/:id` — edição de título/descrição **e troca opcional do arquivo de capa/imagem**, apagando o arquivo antigo do disco;

- `DELETE /api/<sua-entidade>/:id` — exclusão do registro **e** dos arquivos em disco, decrementando o contador do usuário;

- `GET /api/profile/:username` devolvendo o perfil **com a lista de itens** da pessoa e `isOwner`;

- O `errorHandler` limpando arquivos órfãos de requisições que falharam.

### Do lado do front-end:

- **Menu suspenso no avatar da Navbar** (Editar Perfil, Ver Perfil, Meus Itens, Sair), controlado por estado, que fecha ao clicar fora, em um item ou com Esc;

- Componente-base `BaseModal` (genérico) e composable `useClickOutside`;

- Seu componente de card refatorado (sem `<a>` gigante, com autor clicável e opcional, e um slot de ações);

- Tela de **Perfil Público**, tela de **Meus Itens** (editar + excluir com confirmação em modal) e tela de **Editar Item**;

- Botão "Editar" na tela de detalhe, **só para o dono**.

Você também deve ser capaz de **explicar com suas palavras**:

- A diferença entre `401`, `403` e `404`, e por que a verificação de "existe?" vem antes da de "é seu?";

- Por que, ao excluir ou trocar um arquivo, o **banco** é atualizado **antes** do disco, e o que poderia dar errado na ordem inversa;

- O que é um **arquivo órfão**, dê dois exemplos reais do seu projeto e diga onde a limpeza acontece;

- Por que o botão de excluir **não pode** ficar dentro de um `<a>`, e por que o modal **não pode** ficar dentro do card;

- Por que esconder o botão "Editar" de quem não é dono **não** é segurança.

## Antes de começar: verifique seu projeto

Releia o seu projeto:

- **Projetos com arquivo de vídeo/áudio + capa separada:** o item tem **dois** arquivos. Na **edição**, só a **capa** pode ser trocada (o arquivo de mídia principal não muda — para trocar a mídia, a pessoa exclui e envia de novo). Na **exclusão**, **os dois** arquivos são apagados do disco.

- **Projetos com arquivo único, que já é a imagem:** o item tem **um** arquivo. Na **edição**, esse arquivo (a imagem) pode ser trocado opcionalmente. Na **exclusão**, **um** arquivo é apagado. Onde o roteiro fala em "capa", leia "a imagem do seu item".

Em ambos os casos, o campo opcional de arquivo da edição usa `multer.single('<nome-do-campo>')`: o nome do campo é o da capa (Grupo A) ou o da imagem (Grupo B).

> 💡 Nenhuma linha nova na ficha de preparação hoje.

## PARTE A — Backend

### Checklist das tarefas:

- `reload()` adicionado ao seu detalhe

- Duas chamadas seguidas ao detalhe devolvem contagens **consecutivas**

- Verificação `404` antes de `403`, nas duas funções que verificam dono

- Ordem banco → disco respeitada

- Contador do usuário decrementado na exclusão

- Quatro handlers no controller (`getMy<SuasEntidades>`, `get<SuaEntidade>ForEdit`, `update<SuaEntidade>` e `delete<SuaEntidade>`)

- Quatro rotas, com Multer **antes** do validador no `PUT`

- `include` + `order` no nível de cima em `getPublicProfile`

- `isOwner` devolvido no perfil público

- `/profile/:username` com `optionalAuth`, depois de `/profile/me`

- `errorHandler.js` atualizado para limpeza de arquivos órfãos e ainda sendo o **último** `app.use` do `app.js`

### Checklist dos testes:

- `GET /my-<entidades>` sem token → `401`; com A → lista, mais novo primeiro; com B (sem itens) → `[]`.

- `GET /<rota>/:id/edit`: sem token → `401`; com B → `403`; id inexistente → `404`; com A → `200` (e a contagem de visualizações **não** muda).

- `PUT` só com texto, com A → `200`, arquivo inalterado, **nenhuma mudança** na contagem de arquivos.

- `PUT` com arquivo novo, com A → `200`, nome do arquivo mudou, a contagem de arquivos da pasta **continua igual** (entrou um, saiu outro).

- **Órfãos:** `PUT` com arquivo novo feito por B → `403`; `PUT` com arquivo novo e título vazio feito por A → `400`. Nos dois casos, a contagem de arquivos **não pode subir**.

- `DELETE` com B → `403`; com A → `200`; `GET` do item → `404`; arquivos sumiram das pastas; contador do usuário caiu em 1; repetir o `DELETE` → `404`.

- `GET /profile/:username` anônimo (`isOwner: false`, lista de itens ordenada), com o token do dono (`isOwner: true`), com o token de B (`false`), e de um usuário inexistente (`404`).

## PARTE B — Frontend

### Contextualização rápida e Checagem de Alcançabilidade

Verifique os itens listados abaixo. Se você só conseguir acessar pelo menos um dos itens **só digitando a URL** quer dizer que você deixou alguma coisa passar das tarefas anteriores e o seu sistema não está pronto para as tarefas de hoje.

### Checklist das tarefas:

- `useClickOutside.js` criado

- `BaseModal.vue` criado

- Funções `getMy<SuasEntidades>()`, `get<SuaEntidade>ForEdit(id)`, `update<SuaEntidade>(id, formData)` e `delete<SuaEntidade>(id)` criadas

- `getPublicProfile` criada

- Card sem `<a>` gigante, com autor clicável/opcional e slot `actions`

- O Feed da Atividade 08 continua funcionando **sem alteração**

- Menu abre pelo clique, alinha à direita, fecha ao clicar fora/em um item/com Esc

- Perfil Público com os três botões corretos (dono / logado / visitante)

- Meus Itens com modal fora do card, `busy` e remoção local da lista

- Editar Item com e sem arquivo novo

- Autor clicável e botão "Editar" condicional no Detalhe

- Link para Meus Itens na mensagem de sucesso do Upload

### Checklist dos testes:

- Menu do avatar: abre, fecha fora, fecha com Esc, fecha ao escolher um item.

- "Ver Perfil" → seu perfil, com **Editar Perfil** (não "Seguir") e seus itens. Clique no autor de um card de **outra** conta → perfil dela, com "Seguir" (que ainda não faz nada). Dentro dele, clique no autor de outro card: a tela troca sem recarregar.

- Janela anônima em `/profile/<username>` → sem "Seguir" e sem "Editar Perfil". Username inexistente → mensagem de erro, tela intacta.

- Meus Itens: com uma conta sem itens → estado vazio com link; com itens → grade com Editar/Excluir. Clique em **Excluir** → o modal abre sem navegar para o detalhe, **centralizado mesmo com o mouse sobre o card**; Cancelar/X/clicar fora/Esc fecham; clicar dentro da caixa branca não fecha.

- Confirme uma exclusão → o item some sem recarregar; os arquivos sumiram da pasta de uploads da API; o contador do perfil caiu.

- Edição: formulário pré-preenchido; salve só o texto → arquivo mantido; troque o arquivo → prévia imediata, e o antigo some da pasta; apague o título → mensagem do cliente, **sem** requisição nova na aba Network.

- DevTools → Network: o `PUT` com arquivo tem `Content-Type: multipart/form-data; boundary=...`.

- Logado como B, digite na URL a edição de um item da A → mensagem de permissão, sem a tela quebrar. Id inexistente → mensagem de não encontrado.

- Deslogado, abra a URL de Meus Itens → vai ao login e **volta** para ela depois de entrar. Detalhe de um item seu → "Editar" visível; de outra pessoa → ausente.

- Regressão: Feed, Detalhe com player/imagem, Upload, Meu Perfil, Login/Logout.

## Entrega

Envie em resposta a esta tarefa:

1. Na subpasta `01 - Docs` do seu projeto frontend, dentro de uma nova subpasta `atividade09`:
   - Um print do menu do avatar aberto, em `.jpg`, com o nome `menu-avatar.jpg`;
   - Um print do seu Perfil Público com itens, em `.jpg`, com o nome `perfil-publico.jpg`;
   - Um print de Meus Itens com o modal de exclusão aberto, em `.jpg`, com o nome `modal-exclusao.jpg`;
   - Um print da tela de edição, em `.jpg`, com o nome `editar.jpg`;
   - Um print de cada `curl` da Parte A, Etapa 6, em `.jpg` — incluindo a **contagem de arquivos antes e depois** dos testes 4, 5 e 6;
   - Um **parágrafo curto** (em `respostas.md`) explicando, com suas palavras, as cinco perguntas da Seção 1 ("Você também deve ser capaz de explicar...");
   - Atualize `checklists.md` com todos os checklists desta atividade marcados (pule, sem culpa, os itens que não se aplicam ao seu Grupo).

2. Um `.zip` do seu projeto de back-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-backend.zip`, incluindo o `errorHandler.js` atualizado;

3. Um `.zip` do seu projeto de front-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-frontend.zip`, incluindo `composables/`, `components/base/BaseModal.vue`, o card refatorado e as três telas novas.
