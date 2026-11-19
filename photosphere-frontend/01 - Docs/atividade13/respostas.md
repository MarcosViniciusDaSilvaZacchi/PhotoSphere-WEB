# Respostas — Atividade 13

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15)  
**Aluno:** Marcos Vinicius da Silva Zacchi  

> No PhotoSphere, a "coleção pessoal" do roteiro (a playlist da Shortz-App) é o **álbum**: tabela `albums`, junção `album_photos`, contador `photosCount` e campo `hasPhoto` no status.

---

### 1. Por que uma relação muitos-para-muitos precisa de uma tabela de junção, e por que ela tem dois índices (o que cada um acelera)?

Um álbum tem muitas fotos, e uma foto pode estar em muitos álbuns, inclusive de pessoas diferentes. Não dá para guardar isso numa coluna de `photos` (uma foto teria vários `albumId`) nem de `albums` (um álbum teria vários `photoId`). A tabela `album_photos` resolve: cada linha é um par "a foto Y está no álbum X". O primeiro índice, **único composto** `(album_id, photo_id)`, impede o mesmo par duas vezes (o banco recusa até com dois cliques simultâneos). Como `album_id` vem primeiro, ele também acelera "quais fotos estão no álbum X", que é o detalhe do álbum. O segundo, **simples** `photo_id`, existe porque o composto não serve para buscar só pela segunda coluna. Ele acelera "em quais álbuns está a foto Y", que é a pergunta do modal "Salvar" (`albums-status`) e da exclusão da foto, que precisa descontar o contador de cada álbum.

### 2. O que significa uma ação ser idempotente, e por que adicionar duas vezes responde `200` enquanto remover duas vezes responde `404`?

Uma ação é idempotente quando repeti-la deixa o sistema no mesmo estado da primeira vez. Adicionar a foto ao álbum é assim: depois da primeira chamada, "a foto está no álbum"; a segunda não muda nada (o `findOrCreate` encontra a linha, `created` é `false`, o contador não sobe). Por isso a resposta é `200` com `added: false`, e não erro: o pedido "quero esta foto no álbum" está atendido. Remover duas vezes é diferente: na segunda chamada não existe a linha que se pediu para apagar (o `destroy` devolve 0). A API responde `404` ("Esta foto não está neste álbum.") para avisar que o recurso pedido, o vínculo foto ↔ álbum, não existe. O contador só desce quando uma linha foi de fato apagada.

### 3. Por que, mesmo com `ON DELETE CASCADE` no banco, excluir uma foto deixa o contador dos álbuns errado se o código não o descontar — e que tipo de dado é esse contador?

O `ON DELETE CASCADE` em `album_photos` faz o banco apagar as linhas da junção quando a foto é apagada, e só isso. O `photosCount` do álbum é um **dado derivado** (um contador guardado, desnormalizado): uma cópia de "quantas linhas da junção existem para este álbum", gravada em `albums` para não precisar de um `COUNT(*)` a cada listagem. O banco não sabe que um número numa coluna de `albums` depende das linhas de outra tabela, então ninguém o atualiza. **No teste de controle** (o bloco do `deletePhoto` comentado): criei um álbum, adicionei duas fotos e excluí uma. A exclusão respondeu `200` e o `CASCADE` apagou a linha da junção (o detalhe do álbum mostrava só **1** foto), mas o `GET /my-albums` continuou dizendo **`photosCount: 2`**. Com o bloco de volta, o mesmo teste deixa o contador em 1, porque o código desconta 1 de cada álbum afetado, na mesma transação da exclusão.

### 4. A ordem `400` → `404` → `403` nas rotas de escrita, e as duas opções (`403` ou `404`) para um álbum privado de outra pessoa.

Primeiro **`400`**: o pedido nem é válido (id `abc` na URL, `photoId` ausente ou texto, título curto). Sem um id válido não dá nem para procurar. Depois **`404`**: o id é válido, mas o álbum ou a foto não existe. Por último **`403`**: o álbum existe, mas é de outra pessoa. Verificar o dono antes da existência faria um id inexistente responder `403`, e a API mentiria dizendo que o item existe. Para **ler** um álbum privado de outra pessoa há duas escolhas. `403` ("existe, mas você não pode ver") é mais honesto e ajuda a depurar, mas confirma que aquele id existe. `404` ("não encontrado") esconde até a existência do álbum, o que é melhor para a privacidade, mas confunde quem tem o link e acha que o álbum sumiu. O PhotoSphere segue o roteiro e usa `403`, e a tela mostra "Este álbum é privado".

### 5. Por que digitar `%%` na busca devolvia tudo, como o escape resolve, e por que `req.query.q` precisa ser conferido com `typeof`?

No `LIKE`, `%` significa "qualquer sequência" e `_` significa "qualquer caractere". A busca monta `'%' + termo + '%'`, então o termo `%%` virava `LIKE '%%%%'`, que casa com qualquer título, e `__` casava com qualquer título de duas letras ou mais. O `escapeLike` coloca uma `\` antes de cada `%`, `_` e da própria `\`. Para o MySQL, `\%` é o caractere `%` literal, e a busca passa a procurar títulos que contêm `%%` de verdade (nenhum, então "Nada encontrado"). O `typeof` é necessário porque o Express interpreta a query string: `?q=ab&q=cd` chega como **array** (`['ab', 'cd']`) e `?q[x]=1` chega como **objeto** (`{ x: '1' }`). Chamar `.trim()` num array ou num objeto lança erro e vira `500`. Com `typeof req.query.q === 'string'`, qualquer outro formato vira busca vazia.

### 6. O que muda e o que não muda entre os três casos de atualização otimista (curtir, seguir, marcar álbum), e por que `apply` devolve a função de desfazer?

**Não muda** a sequência: aplicar na tela antes da resposta, fazer a requisição, confirmar com os números do servidor ou, se der erro, desfazer. Essa sequência foi para o `runOptimistic` (`utils/optimistic.js`). **Muda** o que se altera e como: o `LikeButton` mexe em `refs` próprios e emite `change`; o `FollowButton` mexe em dois `defineModel` e precisa da variável local `nowFollowing`; a caixa do álbum mexe num item de uma lista (`album.hasPhoto` e `album.photosCount`) e ainda escolhe **qual** requisição fazer (adicionar ou remover) pelo estado de antes. Como cada caso tem um estado diferente, só quem aplicou a mudança sabe desfazê-la. Por isso o `apply` devolve o `undo`: uma função que "lembra" do estado anterior (closure) e restaura exatamente aquilo. O `runOptimistic` não precisa conhecer o estado de ninguém, só chamar `undo()` no erro.

### 7. A diferença entre as duas defesas da busca — o debounce e o `lastCallId` — e que problema cada uma resolve.

O **debounce** (`useDebouncedValue`) resolve o excesso de requisições: sem ele, digitar "montanha" dispararia oito buscas, uma por letra. Ele só libera o termo depois de 400 ms sem digitação, então uma palavra digitada sem pausa vira uma requisição. Isso aparece na aba Network. O **`lastCallId`** (dentro do `useAsyncData`) resolve a ordem das respostas: mesmo com debounce, a pessoa pode pausar em "mon", continuar e pausar em "montanha", deixando duas buscas no ar. Se a de "mon" voltar por último, sem a proteção ela sobrescreveria os resultados de "montanha". Com o número da chamada, só a resposta da busca mais recente é aplicada. Uma defesa diminui quantas requisições saem; a outra garante que, entre as que saíram, vale a última.

### 8. Por que "Remover do álbum" espera a API (pessimista) e a caixa do modal não (otimista)?

Na caixa do modal, a mudança é pequena e local: uma marca e um número. Se a API falhar, desfazer é natural (a caixa volta, com o toast avisando), e a pessoa vê a reação na hora mesmo com a rede lenta, e às vezes clica em várias caixas seguidas. "Remover do álbum" faz o card **sumir** da grade. Se ele sumisse antes da resposta e a API falhasse, teria de reaparecer do nada, na posição certa, e a pessoa acharia que a remoção deu certo e depois "desfez sozinha". Remover também é uma ação deliberada e rara, então esperar meio segundo com o botão em "Removendo..." custa pouco e evita uma tela que mente.
