# Respostas — Atividade 14

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15)  
**Aluno:** Marcos Vinicius da Silva Zacchi  

---

### 1. Por que a notificação é criada dentro da mesma transação da curtida/comentário/seguida, e o que acontece (sintoma e causa) se você esquecer de repassar a transação?

Porque o aviso só é verdadeiro se a ação aconteceu. Dentro da transação, ou a curtida, o `likesCount` e o aviso são gravados juntos, ou nenhum dos três. Se o `increment` falhar, o rollback também apaga o aviso, e o dono não recebe "fulano curtiu sua foto" de uma curtida que não existe. Esquecer o `t` no `createNotification` faz o `INSERT` em `notifications` rodar **fora** da transação, em outra conexão do pool. Essa linha tem chave estrangeira para a foto, e a transação ainda aberta está segurando o lock da linha dessa foto (por causa do `increment` no `likesCount`). A outra conexão fica esperando esse lock, e a transação fica esperando o `INSERT` terminar para seguir: uma espera circular. O sintoma é a requisição "travada", até o MySQL desistir depois de uns 50 segundos (`innodb_lock_wait_timeout`) e a API responder `500` "Lock wait timeout exceeded".

### 2. As regras de uma notificação verdadeira: por que ninguém é avisado das próprias ações, por que descurtir apaga o aviso e por que comentar não tem "desfazer"?

O aviso existe para contar ao dono algo que **outra pessoa** fez. Curtir a própria foto não traz informação nenhuma, por isso o `createNotification` não faz nada quando `userId === actorId`. Descurtir apaga o aviso porque ele deixou de ser verdade: "fulano curtiu sua foto" sobre uma curtida que não existe mais é um aviso falso. Além disso, curtir e descurtir dez vezes encheria a lista de avisos repetidos. Com o `removeNotification` na mesma transação, a lista sempre reflete o estado atual. O comentário não tem "desfazer" porque a API não exclui comentários: depois de publicado, ele continua existindo, e o aviso "comentou na sua foto" continua verdadeiro.

### 3. Por que existe uma rota `unread-count` separada da lista, e o que cada um dos dois índices de `notifications` acelera?

O sino pergunta a cada 30 segundos, em todas as abas logadas, e só precisa de **um número**. A lista traz até 12 notificações com quem agiu e a foto (dois `JOIN`s), paginada, e só é necessária quando a pessoa abre a tela. Usar a lista para contar seria buscar e enviar muito mais dados a cada ciclo, e ainda contaria só a página carregada, não o total. A rota `unread-count` é um `COUNT(*)` que devolve `{ unreadCount }`. O índice **`(user_id, is_read)`** atende exatamente essa pergunta ("quantas linhas do usuário X com `is_read = 0`"), com os dois filtros no mesmo índice, e também acelera a lista do usuário. O índice **`(photo_id)`** acelera achar os avisos de uma foto, que é o que a exclusão da foto faz para apagá-los.

### 4. Por que denunciar de novo responde `409` (e não o `200` de "adicionar ao álbum"), e o que garante isso mesmo com dois cliques simultâneos?

Adicionar ao álbum de novo é inofensivo: o estado pedido ("a foto está no álbum") já vale, então `200` está correto. Denunciar de novo é diferente: a pessoa tenta registrar uma **segunda** denúncia, e ela **não** é registrada. Responder `200` faria a pessoa achar que denunciou duas vezes, ou que o motivo novo substituiu o anterior. O `409 Conflict` diz que o pedido conflita com algo que já existe, e o modal mostra "Você já denunciou esta foto." A garantia contra dois cliques simultâneos é o **índice único** `(user_id, photo_id)`: o `findOrCreate` faz a parte normal, e se dois pedidos passarem juntos pela busca, o banco recusa a segunda linha. Uma denúncia por pessoa por foto vale mesmo que o código falhe.

### 5. As duas defesas do motivo da denúncia (o validator e o `ENUM`) e por que o banco guarda chaves e a tela mostra rótulos.

A primeira defesa é o **validator** (`body('reason').isIn(REPORT.REASONS)`), que responde `400` com uma mensagem clara antes de chegar ao banco. A segunda é o **`ENUM`** da coluna `reason`: mesmo que alguém pule a API e escreva direto no banco (ou que um bug deixe passar), o MySQL recusa um valor fora da lista ("Data truncated for column 'reason'"). O banco guarda a **chave** (`harassment`) porque ela é estável, curta e não depende de idioma. Os rótulos ("Assédio ou discurso de ódio") podem mudar de texto, ser traduzidos ou corrigidos sem mexer em nenhuma linha já gravada. A tela faz a tradução chave → rótulo com o `REPORT_REASONS` do `config/constants.js`, e a Aula 15 lê as denúncias com a mesma lista.

### 6. Os três comportamentos de chave estrangeira ao excluir um item (`CASCADE`, `NO ACTION`, `SET NULL`) e o que você viu no teste de controle.

- **`CASCADE`**: apagar o pai apaga os filhos junto. É o caso de `album_photos` (Aula 13).
- **`NO ACTION`**: o banco **recusa** apagar o pai enquanto houver filhos apontando para ele. É o caso de `reports.photo_id`, que é obrigatório.
- **`SET NULL`**: o pai é apagado e a coluna do filho vira `NULL`, mas o filho continua existindo. É o caso de `notifications.photo_id`, que é opcional.

**Teste (a)**, com o `destroy` das denúncias comentado: uma foto curtida e denunciada por outra conta, ao ser excluída, deu **`500`**, com o erro de chave estrangeira de `reports` ("Cannot delete or update a parent row: a foreign key constraint fails (... `reports` ...)"). Como tudo estava na mesma transação, **nada** foi apagado: a foto, a curtida e o aviso continuaram lá. **Teste (b)**, com o `destroy` das notificações comentado: a exclusão respondeu **`200`**, mas a notificação da curtida sobrou no banco com `photo_id = NULL`. É um aviso órfão, "curtiu sua foto" de uma foto que não existe. O código precisa apagar as duas tabelas antes da foto (filhas antes do pai), na mesma transação.

### 7. Como o polling se mantém correto: por que 30 segundos, quem liga e quem desliga, para que serve o `if (timerId !== null)` e por que a aba escondida não pergunta?

**30 s** é o equilíbrio: o número parece "ao vivo" para quem está usando, e o custo é baixo (duas requisições por minuto por aba, e cada uma é um `COUNT` indexado). Quem **liga** é a `AppNavbar`, com um `watch(isAuthenticated, ..., { immediate: true })`: entrou na conta, `startPolling()`. Quem **desliga** é a mesma Navbar: saiu da conta, `stopPolling()`, que também zera o número, e no `onUnmounted`. O **`if (timerId !== null) return`** impede um segundo temporizador quando o `startPolling` é chamado de novo (o `watch` imediato, um login logo depois de outro). Sem ele, cada chamada criaria mais um `setInterval`, as requisições dobrariam, e o `stopPolling` só pararia o último. A **aba escondida** não pergunta (`document.visibilityState`) porque ninguém está olhando para o sino: seriam requisições à toa. Ao voltar para a aba, o evento `visibilitychange` faz uma pergunta na hora.

### 8. A corrida do contador: a história (resposta velha do polling sobrescrevendo o número novo) e por que `setUnreadCount` também sobe o `lastRefreshId`.

A história: o sino mostra 3. O polling dispara e pergunta o número, e a rede está lenta. Nesse meio tempo, a pessoa marca uma notificação como lida, e a API devolve `unreadCount: 2`, que vai para o sino. Aí chega a resposta **velha** do polling, contada antes da marcação, dizendo 3, e sobrescreve o 2. O sino "desmarca sozinho". O `refresh` numera cada pergunta e só aplica a resposta se ela ainda for a mais recente. O `setUnreadCount` também **sobe o `lastRefreshId`**: assim, qualquer `refresh` que estava no ar antes da marcação passa a ser "velho" e tem a resposta descartada. O número que veio da marcação, mais novo que aquela pergunta, é o que fica. No `stopPolling`, o mesmo truque impede que uma resposta atrasada acenda o sino depois do logout.

### 9. O que muda e o que não muda no quarto caso do `runOptimistic`, e por que o desfazer do contador do sino é relativo (`+ 1`) e não um "volte ao número que eu vi".

**Não muda** nada no `utils/optimistic.js`: continua `apply` (muda a tela e devolve o `undo`), `request` e `confirm`. **Muda** o que o `apply` mexe: duas coisas ao mesmo tempo, a linha (`isRead`) e um estado **compartilhado**, o número do sino na store. O `confirm` entrega à store o `unreadCount` que a API calculou. O desfazer é relativo porque o número do sino é compartilhado entre linhas. Se duas linhas forem marcadas juntas (Slow 4G e depois Offline): o sino vai de 5 para 4 (linha 1) e de 4 para 3 (linha 2). Se cada `undo` voltasse "ao número que viu", o da linha 1 poria 5, mas o da linha 2 chegaria depois e poria 4, e o sino terminaria em 4 com as duas linhas não lidas. Com `+ 1` em cada `undo`, 3 + 1 + 1 = 5, o número certo, em qualquer ordem.

### 10. Por que um `400` do logout aparecia como erro de CORS no Console, e o que a ordem dos middlewares tem a ver com isso.

O `authService` chamava `api.post('/logout', null, ...)`. Com `null` no corpo, o Axios envia o texto `null` com `Content-Type: application/json`, e o `express.json()`, em modo *strict* (só aceita objeto ou array), recusa com `400`. Esse erro é gerado pelo próprio `express.json`, antes das rotas. Se o `app.use(cors(...))` estivesse **depois** do `express.json()`, a resposta `400` sairia **sem** o cabeçalho `Access-Control-Allow-Origin`. O navegador, sem essa autorização, nem deixa o JavaScript ler a resposta e mostra no Console um "erro de CORS", escondendo o `400` verdadeiro. Por isso o `cors` precisa vir antes dos parsers. No PhotoSphere, o `cors` já estava antes do `express.json` desde a Aula 01, então o Console mostrava o `400 (Bad Request)` em vermelho a cada logout, e não o erro de CORS. O teste 10 da Parte A confirma: o `400` volta com o `Access-Control-Allow-Origin`. A correção do front foi trocar `null` por `undefined`: a requisição sai sem corpo, o `express.json` não tem o que recusar, e o Console fica limpo.
