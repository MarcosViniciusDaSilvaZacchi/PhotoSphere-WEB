# Respostas — Atividade 10

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15)  
**Aluno:** Marcos Vinicius da Silva Zacchi  

---

### 1. Por que "uma pessoa só curte uma vez" precisa estar no banco (índice único composto) e não só no código?

A checagem no código (`Like.findOne` antes do `Like.create`) tem uma brecha de concorrência: dois cliques quase simultâneos (ou duas abas) podem passar os dois pelo `findOne` antes de qualquer um gravar, e os dois criariam a curtida. O índice único composto `idx_unique_like_user_photo (user_id, photo_id)` faz o próprio MySQL recusar a segunda linha, não importa de onde ela venha — da API, de outro sistema ou de um `INSERT` manual. No teste, o `INSERT` repetido no banco foi recusado com `Duplicate entry '2-1' for key 'idx_unique_like_user_photo'`.

### 2. Qual a diferença entre contador guardado e contador calculado? Qual o risco do primeiro e como a transação o elimina?

O contador calculado é obtido na hora com um `COUNT(*)` em `likes` ou `comments`: está sempre certo, mas custa uma consulta a mais para cada foto do feed. O contador guardado (`likesCount` e `commentsCount` na tabela `photos`) é lido junto com a foto, sem custo extra, mas é uma cópia da informação e pode **divergir** da contagem real: se a linha da curtida for criada e o `increment` falhar (ou o contrário), o número exibido fica errado para sempre. A transação junta as duas escritas numa unidade só: ou a linha e o contador são gravados juntos (commit), ou nenhum dos dois (rollback).

### 3. O que acontece se um comando dentro de `sequelize.transaction` esquecer `{ transaction: t }`?

Esse comando roda **fora** da transação, em outra conexão do pool. Com isso: (1) ele é gravado na hora e **não é desfeito** se a transação der rollback — exatamente a divergência que a transação deveria evitar; (2) ele não enxerga o que a transação ainda não confirmou; e (3) ele pode travar esperando um lock que a própria transação está segurando, até estourar o tempo limite. Não aparece nenhum erro de sintaxe, por isso é um erro fácil de cometer. Em `likeService.js`, `commentService.js` e no `deletePhoto` todos os comandos recebem `{ transaction: t }`.

### 4. O que é atualização otimista, quais são seus três passos e quando não usá-la?

É mudar a interface **antes** da resposta do servidor, supondo que a operação vai dar certo, para a tela responder na hora mesmo numa rede lenta. No `LikeButton.vue`: (1) guardar o estado anterior (curtido e contador); (2) aplicar a mudança imediatamente (o coração muda e o número sobe); (3) quando a resposta chega, confirmar com os números do servidor ou, em caso de erro, fazer o rollback para o estado guardado e mostrar a mensagem. O `isBusy` impede um segundo clique enquanto o primeiro não voltou. Não se deve usar quando a operação falha com frequência, quando o resultado depende de algo que só o servidor sabe, ou quando ela é crítica ou irreversível (pagamento, exclusão, publicação) — aí o usuário precisa ver a confirmação real.

### 5. Por que o texto do comentário deve sair com `{{ }}` e nunca com `v-html`?

A interpolação `{{ }}` do Vue escapa o conteúdo: `<b>` vira texto literal, sem ser interpretado como HTML. Com `v-html`, o navegador interpretaria o texto, e um comentário como `<img src=x onerror="alert(1)">` executaria JavaScript no navegador de **todas** as pessoas que abrissem a foto (XSS armazenado) — podendo, por exemplo, ler o token guardado no `localStorage`. No teste, esse comentário apareceu como texto puro, sem negrito e sem alerta. As quebras de linha continuam visíveis por CSS (`white-space: pre-wrap`), sem precisar de HTML.

### 6. Por que `.trim()` precisa vir antes de `.notEmpty()`?

O `express-validator` executa as regras na ordem em que foram encadeadas, e o `trim()` também altera o valor. Com `notEmpty()` primeiro, `"     "` passa na verificação (não está vazio) e só depois é aparado para `""` — e um título, nome ou comentário em branco seria gravado. Com `trim()` primeiro, a validação já recebe `""` e responde `400`. Essa era a ordem errada no `registerValidator` e no `loginValidator`, corrigida nesta atividade; o script `scripts/testeTrim.js` confirmou o `400` para título e nome só com espaços (o `curl -F` apara os espaços sozinho e por isso não serve para esse teste).
