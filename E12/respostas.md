# Respostas — Atividade 12

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15)  
**Aluno:** Marcos Vinicius da Silva Zacchi  

---

### 1. Por que `useAsyncData` recebe `() => minhaChamada()` e não `minhaChamada()`?

`minhaChamada()` executa a requisição na hora em que a linha é lida e entrega ao composable uma promessa que já está em andamento. É uma requisição só, sem como repetir. `() => minhaChamada()` entrega a receita da requisição, e o composable decide quando executá-la: ao montar a tela, quando o parâmetro da rota muda (o `watch` em `route.params.id` no Detalhe e no Perfil) e no botão "Tentar de novo" (`execute`). A função também é lida de novo a cada execução, então ela sempre usa o `route.params` atual. Uma promessa já criada guardaria o id antigo.

### 2. O que é a corrida entre respostas, como ela se manifesta para o usuário e como o `lastCallId` a evita?

Quando duas requisições da mesma tela estão no ar ao mesmo tempo, nada garante que as respostas voltem na ordem em que foram pedidas. No PhotoSphere: a pessoa abre o perfil de @ana e, antes de carregar, clica no perfil de @bia. Se a resposta da @ana chegar por último, a tela mostra a @ana com a URL da @bia. O erro não aparece no Console; a tela simplesmente fica errada. No `useAsyncData` (e na `FollowListView`, quando se troca de aba rápido), cada chamada recebe um número crescente (`callId = ++lastCallId`). Quando a resposta chega, ela só é aplicada se `callId === lastCallId`, ou seja, se ainda for a chamada mais recente. As respostas velhas são descartadas.

### 3. Quem avisa o usuário quando uma ação falha, quando uma leitura falha e quando um formulário falha — e por que "toast para todo erro" seria um erro de design?

- **Ação** (curtir, seguir, comentar, excluir): avisa o interceptor do Axios, com um toast. A tela só desfaz a mudança visual (rollback) ou mantém o modal aberto.
- **Leitura** (abrir o Detalhe, o Perfil, as listas): avisa a própria tela, que mostra o erro no lugar do conteúdo, com "Tentar de novo" quando faz sentido. O interceptor não mostra toast para `GET`.
- **Formulário** (login, cadastro, edição de perfil, upload e edição da foto): avisa o próprio formulário, perto dos campos. Essas chamadas vão com `{ silent: true }`.

Mostrar toast para todo erro duplicaria avisos (a tela de erro e o toast dizendo a mesma coisa) e tiraria a mensagem do lugar onde ela é útil: "senha incorreta" precisa ficar ao lado do campo de senha, não num aviso que some em 6 segundos no canto da tela. Além disso, quando a sessão expira (`401`), a pessoa já é levada ao Login, e um toast a mais só faria barulho.

### 4. Por que a lista de toasts fica fora da função `useToast()` (singleton) e que vantagem isso traz sobre uma store do Pinia neste caso?

O `const toasts = ref([])` fica no topo do módulo e é criado uma única vez, quando o arquivo é importado. Toda chamada de `useToast()` devolve essa mesma lista. Se a lista fosse criada dentro da função, cada tela teria a sua lista, e o `ToastContainer` nunca veria os avisos dos outros. A vantagem sobre o Pinia, neste caso: o maior "cliente" dos toasts é o `api.js`, que não é componente e roda fora de qualquer `setup()`. Usar uma store ali exigiria a instância do Pinia já ativa e criaria um vínculo entre a camada de serviços e a de estado (justamente o tipo de dependência circular evitado desde a Aula 04, quando o token passou a ser lido direto do `localStorage`). Para um estado tão pequeno (uma lista e três funções), o módulo singleton resolve sem nenhuma infraestrutura a mais.

### 5. Por que `?limit=-3` era um problema, por que `Number.parseInt('abc') >= 1` dá `false` (e o que isso tem de útil), e por que existe um teto para o `limit`?

No feed filtrado, `Number.parseInt('-3') || 12` dava `-3`, porque `-3` é *truthy* e o `||` não troca pelo padrão. O valor ia parar no SQL como `LIMIT -3`, e o MySQL respondia com erro: um `500` provocado só pela URL. No feed geral, o clamp antigo transformava `-3` em `1` sem avisar ninguém. `Number.parseInt('abc')` é `NaN`, e qualquer comparação com `NaN` dá `false`. O útil disso é que a mesma condição `value >= 1` recusa ao mesmo tempo os negativos, o zero e o lixo (texto, vazio, `undefined`), e tudo cai no padrão sem um `if` para cada caso. O teto (`MAX_LIMIT = 50`) existe porque `?limit=100000` faria uma única requisição puxar a tabela inteira com os autores juntos: lenta para quem pede, cara para o banco, e uma porta fácil para sobrecarregar a API.

### 6. Por que o miolo da atualização otimista não foi extraído hoje, e o que é a "regra dos três"?

Hoje só existem dois casos (curtir e seguir), e eles ainda são diferentes nos detalhes. O `LikeButton` guarda o estado num `ref` próprio e avisa o pai por evento. O `FollowButton` usa `defineModel` e precisa da variável local `nowFollowing` por causa da pegadinha da leitura logo após atribuir. Extrair agora significaria adivinhar qual é a parte comum a partir de duas amostras. O risco é criar uma abstração com o formato errado, que depois atrapalha mais do que ajuda. A "regra dos três" diz: na primeira vez, escreva; na segunda, aceite a repetição; na terceira, extraia, porque com três casos dá para ver o que é realmente igual. O terceiro caso chega na Aula 13 (marcar e desmarcar uma coleção), e o `runOptimistic` nasce ali. Por isso, hoje foi extraída só a "cerca" (`useAuthenticatedAction`), que já era idêntica nos dois botões.

### 7. O que pode dar errado quando um Service grava o registro e o contador do autor sem transação?

As duas escritas passam a poder dar certo ou errado de forma independente. No `createPhoto`, se o `Photo.create` funcionar e o `User.increment('photosCount')` falhar (queda de conexão, erro no meio, processo reiniciado), a foto existe, mas o perfil mostra uma foto a menos. No sentido inverso, o contador sobe sem foto nenhuma. Como o contador é guardado e não recalculado, essa divergência fica para sempre, e ninguém percebe até alguém contar à mão. Dentro de `sequelize.transaction`, com `{ transaction: t }` nas duas escritas, ou as duas são confirmadas juntas (commit), ou nenhuma (rollback).
