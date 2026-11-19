# Atividade Prática - Aula 08

## Streaming, Detalhe da Entidade Principal e Feed Paginado (Trilhas API + Frontend)

**Baseado em:** roteiro da **Aula 08 — trilha API (Shortz-App API)** e roteiro da **Aula 08 — trilha Frontend (Shortz-App)**

**Pré-requisito:** Atividade 07 concluída nas duas trilhas — model da sua entidade principal, `config/associations.js`, upload funcionando de ponta a ponta, pelo menos um item enviado de verdade (é ele que você vai exibir hoje).

Ao final desta atividade, você deve ter, no seu próprio projeto:

### Do lado do back-end (API):

- `middlewares/optionalAuth.js` — a primeira rota pública da sua API que ainda assim tenta identificar quem está pedindo;

- `GET /api/<sua-entidade>/:id`, pública (`optionalAuth`), devolvendo o item com os dados do autor "populados" via `include` (nunca vazando a senha), incrementando uma contagem de visualizações/reproduções a cada chamada, e informando se quem está vendo é o dono (`isOwner`);

- `GET /api/feed`, protegida (`isAuthenticated`), devolvendo uma página de itens recentes, paginada por `page` / `limit`;

- **Se você é Grupo A** (arquivo de vídeo ou áudio, ver Seção 2): `GET /api/<sua-entidade>/:id/stream`, com suporte a requisições `Range` (`206 Partial Content`) — construída por completo, mas **não** usada pelo player do seu frontend, exatamente para você comprovar, na prática, a mesma inconsistência de arquitetura discutida no roteiro da Shortz-App.

### Do lado do front-end:

- Sua tela de Feed (placeholder desde a Aula 01) exibindo itens reais, em grade, com paginação via botão "Carregar mais";

- Sua tela de Detalhe (placeholder desde a Aula 01) exibindo o item real — **se Grupo A:** um player de vídeo/áudio funcional, apontando para o arquivo estático, nunca para a rota `/stream`; **se Grupo B:** a imagem em resolução real, sem nenhum player;

- Um componente de card reutilizável para a grade do Feed.

Você também deve ser capaz de **explicar com suas palavras**:

- A diferença entre um middleware que **bloqueia** sem token (`isAuthenticated`) e um que **tenta identificar, mas nunca bloqueia** (`optionalAuth`) — e por que o detalhe do seu item precisa do segundo;

- Por que uma tag `<video>` / `<audio>` / `<img>` não consegue enviar um cabeçalho `Authorization`, e como isso decide para onde o `src` deve apontar;

- **Se Grupo A:** o que é uma requisição `Range`, e por que ela importa para um arquivo de mídia grande;

- Como a fórmula `offset = (page - 1) * limit` converte "página" (o que o cliente pede) em "quantos registros pular" (o que o banco entende).

## Antes de começar: seu projeto decide o tamanho desta atividade

Releia o seu projeto:

- **Projetos com arquivo de vídeo ou áudio + capa separada:** esta atividade tem **duas partes técnicas completas** — o detalhe/feed (igual para todo mundo) **e** a rota de streaming com `Range`. Não pule o Bloco de streaming: é conteúdo novo, não uma repetição do upload da Aula 07.

- **Projetos com arquivo único, que já é a imagem em si):** sua entidade não tem "reprodução" nenhuma — só uma imagem para exibir em resolução real. **Pule os itens de streaming** (rota de streaming, `Range`, `206`) — eles não se aplicam ao seu projeto. Sua tela de detalhe troca o player por uma simples tag `<img>` apontando para o arquivo já enviado.

> 💡 Nenhuma linha nova na ficha de preparação hoje — os campos que importam (nome do model, nome dos campos de arquivo, Grupo) já foram preenchidos na Atividade 07.

## PARTE A — Backend: Detalhe, Feed e Streaming

### Checklist das tarefas:

- `middlewares/optionalAuth.js` criado

- `get<SuaEntidade>Details` / `getFeed<SuaEntidade>` adicionados ao service

- Controller e rota do detalhe criados, com `optionalAuth`

- Coluna de visualizações confirmada (criada ou reaproveitada)

- Rota de streaming criada, protegida por `isAuthenticated` (apenas para os projetos que possuem streaming)

- `Content-Type` ajustado ao seu tipo real de arquivo (apenas para os projetos que possuem streaming)

- `getFeed` adicionado a `userController.js` / `userRoutes.js`

### Checklist dos testes:

- Detalhe sem token → `200`, `isOwner: false`, contagem de visualizações em `1`.

- Detalhe com o token do dono → `200`, `isOwner: true`, contagem em `2`.

- Detalhe de um item inexistente → `404`.

- **Se seu projeto possui streaming:** `/stream` sem token → `401`; `/stream` com token → `200` / `206`; o mesmo arquivo via `/uploads/...` sem token nenhum → `200` (a mesma inconsistência discutida no roteiro da Shortz-App, reproduzida no seu projeto); uma requisição com `Range: bytes=0-1023` → `206`, com `Content-Range` correto.

- Feed sem token → `401`.

- Feed com token, `?page=1&limit=1` → um item só.

- Feed com token, `?page=2&limit=1` → `[]` (se você só tem um item), ou o próximo item.

## PARTE B — Frontend: Feed e Detalhe com Dados Reais

### Checklist das tarefas:

- Função(ões) de URL adicionadas a `utils/media.js`, coerentes com seu Grupo

- Classes de card adicionadas, com a proporção certa para o seu tipo de conteúdo

- Classe de player adicionada (para projetos que possuem streaming)

- Funções `get<SuaEntidade>ById` e `getFeed` criadas no `userService.js`

- Componente de card criado, adaptado ao seu domínio

- Tela de Feed exibindo itens reais, com paginação "Carregar mais" funcionando

- Tela de Detalhe exibindo o item real, com o player/imagem correto para o seu projeto

- `isOwner`, recebido da API, guardado no estado da tela, mesmo sem uso visual ainda (chega na Aula 09)

### Checklist desta etapa:

- Faça login → clique no link do seu Feed na Navbar/Sidebar → confirme itens reais aparecendo.

- Clique num card → confirme a navegação para o detalhe, sem recarregar a página.

- **Se seu projeto possui streaming:** confirme que o player reproduz, e que dá para arrastar a barra de progresso livremente (seek). Nas DevTools → Network, confirme que o arquivo carrega do caminho estático, não da rota `/stream`, e que ao menos uma requisição tem status `206`.

- **Se seu projeto não possui streaming:** confirme que a imagem carrega em resolução real (maior que a miniatura do card).

- Recarregue a tela de detalhe (F5) uma segunda vez → confirme, via `curl` em `GET /api/<sua-rota>/:id`, que a contagem de visualizações subiu.

- Acesse um id inexistente diretamente pela URL → confirme a mensagem de erro, sem a tela quebrar.

## Entrega

Envie em resposta a esta tarefa:

1. Na subpasta `01 - Docs` do seu projeto frontend, dentro de uma nova subpasta `atividade08`:
   - Um print do seu Feed com itens reais, em `.jpg`, com o nome `feed-real.jpg`;
   - Um print da sua tela de Detalhe carregada, em `.jpg`, com o nome `detalhe-real.jpg`;
   - **Se seu projeto possui streaming:** um print da aba Network mostrando uma requisição `206` durante a reprodução, em `.jpg`, com o nome `range-206.jpg`;
   - Um print de cada `curl` da Etapa 5 (Parte A), em `.jpg`;
   - Atualize `checklists.md` com todos os checklists desta atividade marcados (pule, sem culpa, os itens que não se aplicam ao seu Grupo).

2. Um `.zip` do seu projeto de back-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-backend.zip`, incluindo `middlewares/optionalAuth.js`;

3. Um `.zip` do seu projeto de front-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-frontend.zip`, incluindo `components/` (com o card novo) e as duas telas atualizadas.
