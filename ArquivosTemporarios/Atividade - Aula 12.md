# Atividade Prática - Aula 12

## Checkpoint 2: Leitura Crítica da API, Constantes, `useAsyncData()`, Toasts e Regressão (Trilhas API + Frontend)

**Baseado em:** roteiro da Aula 12 — trilha API (Shortz-App API) e roteiro da Aula 12 — trilha Frontend (Shortz-App)

**Aplicação:** este enunciado vale para qualquer projeto sorteado na Lista de Projetos para Programação Web. Como é um checkpoint (nenhuma funcionalidade nova), o trabalho de hoje é aplicar ao seu projeto o que o roteiro fez na Shortz-App: nomes de arquivos, telas e rotas mudam de acordo com a sua entidade principal (aquela que, na Shortz-App, é o "vídeo"). Use a mesma ficha de preparação das aulas anteriores. O Grupo A/B não altera nada.

**Pré-requisito:** Atividade 11 concluída nas duas trilhas — curtir/comentar, seguir, feed filtrado, perfil público, e três contas de usuário para os testes.

> ⚠️ **Ordem de execução:** faça a Parte A (API) antes da Parte B (Frontend), como nas atividades anteriores — a correção de paginação da API define o teto de itens por página que o front respeita.

---

## 1. Objetivo

Ao final desta atividade, você deve ter, no seu próprio projeto:

**Do lado do back-end (API):**

- Um arquivo `checkpoint-02.md` com a leitura guiada dos seus módulos, respondendo, com evidência do código, às perguntas do Bloco 2 do roteiro de API;
- A paginação dos seus feeds (o feed geral e o feed filtrado) corrigida: `PAGINATION` em `config/constants.js`, `utils/pagination.js` com `parsePagination`, usada nos controllers, e o número "tamanho de página" deixando de estar solto nos Services;
- O Service da sua entidade que cria um registro e mexe num contador do usuário (o equivalente ao upload de vídeo) com as duas escritas dentro de uma transação;
- Uma bateria de regressão por `curl` sem nenhuma surpresa.

**Do lado do front-end:**

- `config/constants.js` com chaves de armazenamento, limites de validação, tamanho de página, durações de toast e mensagens padrão;
- O sistema de toasts (`useToast`, `ToastContainer`) montado em `App.vue`, alimentado pelo interceptor do Axios com a regra "ação que falha vira toast, salvo `silent`; leitura que falha é da tela; `401` leva ao login";
- Os composables `useAsyncData`, `usePaginatedList` e `useAuthenticatedAction`, aplicados nas suas telas (lista na Parte B, Etapa 4);
- As constantes de validação nos formulários, sem números soltos;
- Um teste de regressão completo de tudo o que foi construído nas Aulas 01 a 11.

**Você também deve ser capaz de explicar com suas palavras:**

1. Por que `useAsyncData` recebe `() => minhaChamada()` e não `minhaChamada()`;
2. O que é a corrida entre respostas, como ela se manifesta para o usuário e como o `lastCallId` a evita;
3. Quem avisa o usuário quando uma ação falha, quando uma leitura falha e quando um formulário falha — e por que "toast para todo erro" seria um erro de design;
4. Por que a lista de toasts fica fora da função `useToast()` (singleton) e que vantagem isso traz sobre uma store do Pinia neste caso;
5. Por que `?limit=-3` era um problema, por que `Number.parseInt('abc') >= 1` dá `false` (e o que isso tem de útil), e por que existe um teto para o `limit`;
6. Por que o miolo da atualização otimista não foi extraído hoje, e o que é a "regra dos três";
7. O que pode dar errado quando um Service grava o registro e o contador do autor sem transação.

---

## 2. Antes de começar: adapte os nomes à sua entidade

| Nome | Exemplo (Shortz-App) | O seu projeto |
|---|---|---|
| Entidade principal | `Video` | |
| Service que a cria e mexe no contador do usuário | `videoService.uploadVideo` | |
| Contador do usuário afetado | `videosCount` | |
| Controller do feed geral | `userController.getFeed` | |
| Controller do feed filtrado | `followController.getFollowingVideos` | |
| Telas que leem dados ao montar (Parte B, Etapa 4) | Detalhe, Perfil Público, Curtidas, Meus Vídeos, Listas de seguidores, Comentários, Feed, Feed filtrado | liste as suas |

> 💡 Se o seu projeto não tem um contador do usuário (porque a sua entidade não precisa de `xCount` no `User`), diga isso no `checkpoint-02.md` e procure, no lugar, outro Service que grave em duas tabelas — na Aula 10, o equivalente foi o `toggleLike`. Se todas as suas escritas duplas já estão em transação, registre isso (é um resultado válido da leitura!).

---

# PARTE A — Backend

## 3. Etapa 1 — Leitura guiada (`checkpoint-02.md`)

Siga o Bloco 2 do roteiro de API (2.1 a 2.6) sobre os módulos do seu projeto. Responda cada pergunta com sim/não e, quando a resposta for "sim, há um problema", indique arquivo e linha. As buscas (`Ctrl+Shift+F`) são as mesmas do roteiro; o que muda são os nomes dos módulos.

Além das perguntas do roteiro, responda:

1. Quantas vezes o padrão `const error = new Error(...)` / `error.status = N` / `throw error` aparece no seu código? (Basta o número e a lista de arquivos.)
2. Que outro valor numérico solto (que não seja o tamanho de página) aparece em mais de um arquivo do seu projeto?
3. Rode os três `curl` de id inválido do Bloco 2.5 nas suas rotas equivalentes. Os módulos respondem com o mesmo status?

**Checklist desta etapa:**

- [ ] `checkpoint-02.md` criado, com as respostas dos Blocos 2.1 a 2.6 e as três perguntas extras

## 4. Etapa 2 — Corrigindo a paginação

1. Reproduza o problema nos seus dois feeds (geral e filtrado) com `?limit=-3`, `?limit=100000` e `?page=-2&limit=2`. Anote o que o seu banco fez (devolveu tudo? deu erro `500`?) — print.
2. Em `config/constants.js`, crie o grupo `PAGINATION` (`DEFAULT_PAGE: 1`, `DEFAULT_LIMIT: 12`, `MAX_LIMIT: 50`).
3. Crie `utils/pagination.js` com `parsePagination(query)` (Bloco 3.2 do roteiro de API).
4. Use-a nos dois controllers de feed e troque os valores padrão dos dois services pelas constantes.
5. Confira, com a busca, que o número "tamanho de página" não aparece mais solto em `modules/`.
6. Reinicie e repita os testes do Bloco 3.4.

> ⚠️ **Dois erros comuns:** (1) deixar o `|| 12` num dos controllers "por esquecimento" — a busca existe para isso; (2) escrever `limit > 1` em vez de `limit >= 1` na função: aí `?limit=1` cairia para o valor padrão (12) e o teste `page=2&limit=1` do Bloco 3.4 devolveria a lista errada — releia a explicação do Bloco 3.2.

**Checklist desta etapa:**

- [ ] Problema reproduzido e anotado antes da correção
- [ ] `PAGINATION` e `utils/pagination.js` criados e usados nos dois controllers e nos dois services
- [ ] Testes do Bloco 3.4 com o resultado esperado

## 5. Etapa 3 — A transação do registro + contador

No Service da sua entidade que cria o registro e mexe num contador do usuário (Seção 2), envolva as duas escritas em `sequelize.transaction(async (t) => { ... })`, com `{ transaction: t }` em ambas (Bloco 3.5 do roteiro de API). Confirme que, depois de criar um registro pela API, o contador do usuário subiu em 1.

**Checklist desta etapa:**

- [ ] Service da entidade dentro de uma transação, com `{ transaction: t }` nas duas escritas
- [ ] Criação testada: `201` e contador incrementado

## 6. Etapa 4 — Regressão da API

Rode a bateria do Bloco 4 do roteiro de API adaptada aos seus nomes (perfil com `isFollowing`, feed, feed filtrado, seguir, seguidores, curtir, curtidas, comentar, comentários, "meus itens"). Faça um print de cada resposta.

**Checklist desta etapa:**

- [ ] Todas as chamadas respondem como esperado, sem regressão

---

# PARTE B — Frontend

## 7. Etapa 1 — Constantes

Crie `src/config/constants.js` (Bloco 3 do roteiro de Frontend), com os limites do seu projeto — eles devem combinar com `config/constants.js` da sua API. Troque, em `api.js` e `stores/auth.js`, as chaves de `localStorage` escritas à mão por `STORAGE_KEYS`; nos services dos feeds, o tamanho de página por `PAGE_SIZE`.

**Checklist desta etapa:**

- [ ] `constants.js` criado, com limites iguais aos da API
- [ ] `api.js`, `stores/auth.js` e os services de feed usam as constantes

## 8. Etapa 2 — Toasts e interceptor

1. Crie `useToast.js` e `ToastContainer.vue` (Bloco 4) e monte o container uma vez em `App.vue`.
2. Reescreva `services/api.js` com `notifyIfNeeded` (Bloco 5.1).
3. Marque `silent: true` nos services dos seus formulários (login, cadastro, edição de perfil, criação e edição da sua entidade) — e somente neles. Lembre do logout e do detalhe do segundo/terceiro argumento do Axios.
4. Teste: login com senha errada (erro no formulário, sem toast); curtir com Offline (toast, e o botão volta).

**Checklist desta etapa:**

- [ ] Toasts funcionando, acima do modal
- [ ] `silent` apenas nos formulários; nenhum toast duplicado

## 9. Etapa 3 — `useAsyncData` e `usePaginatedList` nas suas telas

Crie os dois composables (Blocos 6 e 7) e refatore todas as telas da lista da Seção 2 (as suas equivalentes às oito do roteiro). Para cada tela:

- o `<script>` perde o esqueleto `isLoading` / `apiErrorMessage` / `try-catch-finally`;
- o `<template>` troca `apiErrorMessage` por `error`;
- se a tela reage a um parâmetro da rota, use `watch: () => route.params.<nome>`.

Teste cada tela no navegador antes de passar à próxima. Deixe de fora, conscientemente, as telas que apenas preenchem um formulário (como `MyProfileView`) — e registre a decisão no `checklists.md` (o Bloco 2.9 do roteiro explica por quê).

**Checklist desta etapa:**

- [ ] Todas as telas de leitura usam os composables, sem `apiErrorMessage` sobrando
- [ ] Cada tela testada individualmente
- [ ] Decisão sobre telas de formulário registrada no `checklists.md`

## 10. Etapa 4 — `useAuthenticatedAction` e os botões

Crie o composable (Bloco 9.1) e use-o nos dois botões de ação social que você tem (curtir e seguir, ou equivalentes). Remova o `errorMessage` local e a cerca repetida; o `catch` só desfaz a mudança visual.

**Checklist desta etapa:**

- [ ] Os dois botões usam `useAuthenticatedAction` e não têm mais `errorMessage`
- [ ] Três cliques rápidos, com a rede lenta, geram uma requisição (print da aba Network)

## 11. Etapa 5 — Constantes nos formulários

Troque, nos seus formulários, os limites escritos à mão por `LIMITS.<NOME>` (Bloco 10). Faça a busca (`Ctrl+Shift+F`) pelos números que você usava e confirme que só restam em `constants.js`.

**Checklist desta etapa:**

- [ ] Nenhum limite solto nos formulários

## 12. Etapa 6 — Teste de regressão completo

Faça o roteiro do Bloco 11 do roteiro de Frontend, adaptando os passos à sua entidade, do zero (conta nova). Não pule os passos de toast (11, 12, 14, 18 e 19 do roteiro): é neles que o trabalho de hoje aparece para o usuário. O passo 20 (corrida) é opcional, mas vale um ponto extra no `respostas.md` se você o fizer e explicar o resultado.

**Checklist desta etapa:**

- [ ] Todos os passos realizados, sem regressão e sem erros vermelhos no Console (além dos provocados com Offline)

## 13. Reflexão: sua própria pendência (ADR-013)

Encontre uma repetição ou inconsistência do seu projeto que não está listada nos Blocos 5 (API) ou 12 (Frontend) dos roteiros — por exemplo, uma tela que ainda tem uma formatação de data copiada, ou um componente quase igual a outro. Registre no `checkpoint-02.md`, numa tabela de três colunas (**O que é**; **Por que não foi resolvido hoje**; **Em qual aula será resolvido** — nomeada). Um adiamento sem a aula nomeada não vale como pendência: nesse caso, resolva-o hoje.

---

## 14. Entrega

Envie em resposta a esta tarefa:

1. Na subpasta `01 - Docs` do seu projeto frontend, dentro de uma nova subpasta `atividade12`:
   - `toast-erro.jpg`: um print do toast de erro (com Offline) e o botão de ação revertido;
   - `toast-sucesso.jpg`: um print do toast de sucesso da exclusão;
   - `toast-modal.jpg`: um print do toast na frente do modal de exclusão (Offline);
   - `uma-requisicao.jpg`: a aba Network, com Slow 4G, mostrando uma só requisição após três cliques rápidos;
   - `formulario-sem-toast.jpg`: o login com senha errada, com o erro no formulário e nenhum toast;
   - `paginacao-antes.jpg` e `paginacao-depois.jpg`: o `curl` com `limit=-3` antes e depois da correção;
   - Um print de cada `curl` da Parte A, Etapa 4, em `.jpg`;
   - `respostas.md` com um parágrafo curto para cada uma das sete perguntas da Seção 1 ("Você também deve ser capaz de explicar...");
   - `checkpoint-02.md` (a leitura guiada, com a tabela da Seção 13);
   - Atualize `checklists.md` com todos os checklists desta atividade marcados.
2. Um `.zip` do seu projeto de back-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-backend.zip`, incluindo `utils/pagination.js`;
3. Um `.zip` do seu projeto de front-end (sem `node_modules`), nomeado `<NomeSobrenome>-<NomeProjeto>-frontend.zip`, incluindo `config/`, os quatro composables novos e o `ToastContainer`.
