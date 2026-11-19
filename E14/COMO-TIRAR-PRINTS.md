# Prints — Atividade 14

Salvar tudo em `.jpg` em `photosphere-frontend/01 - Docs/atividade14/` (crie a pasta se ainda não existir), **com os nomes exatos da lista**.

**Ordem do trabalho em casa:** 0. trocar para o código da E14 → 1. curl → 2. banco → 3. testes de controle → 4. telas → 5. teste completo → 6. finalizar (script). O código e os documentos (`respostas.md`, `checklists.md`) já estão prontos.

## 0. Preparar

1. Troque o código para a tag `entrega-e14` (o Claude de casa faz isso) e suba a API e o front.
2. O `sync` cria as tabelas **`notifications`** e **`reports`** (`✅ Banco de dados sincronizado!`).
3. Contas **A**, **B** e **C** (a C é da E11). B precisa de uma foto; A também, para o teste "curtir a própria foto".

---

## 1. curl (PowerShell)

```powershell
$U = "http://localhost:3000/api"
$W = '  [HTTP %{http_code}]\n'
$J = "Content-Type: application/json"
$A = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_A","password":"SENHA_A"}').data.token
$B = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_B","password":"SENHA_B"}').data.token
$C = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"contac@teste.com","password":"123456"}').data.token
$IDB = (Invoke-RestMethod -Uri $U/profile/me -Headers @{ Authorization = "Bearer $B" }).data.id
$FB = (Invoke-RestMethod -Uri $U/my-photos -Headers @{ Authorization = "Bearer $B" }).data[0].id
$FA = (Invoke-RestMethod -Uri $U/my-photos -Headers @{ Authorization = "Bearer $A" }).data[0].id
function Get-Unread($t) { (curl.exe -s -H "Authorization: Bearer $t" $U/notifications/unread-count | ConvertFrom-Json).data.unreadCount }
function Get-Notifs($t, $q = '') { (curl.exe -s -H "Authorization: Bearer $t" "$U/notifications$q" | ConvertFrom-Json).data | Select-Object id, type, photoId, isRead, @{ n = 'actor'; e = { $_.Actor.username } } }
'{"content":"Que foto linda!"}' | Set-Content -Encoding ascii n-com.json
'{"reason":"spam"}'               | Set-Content -Encoding ascii r-spam.json
'{"reason":"harassment"}'         | Set-Content -Encoding ascii r-har.json
'{}'                              | Set-Content -Encoding ascii r-vazio.json
'{"reason":"feio"}'               | Set-Content -Encoding ascii r-fora.json
'{"reason":"Spam ou golpes"}'     | Set-Content -Encoding ascii r-rotulo.json
```

> Se as contas já tiverem notificações de testes anteriores, os números mudam, mas a **diferença** entre um comando e outro é o que importa (sobe 1, desce 1...). Para começar do zero: `DELETE FROM notifications;` no Workbench.

**`curl-01-sem-token.jpg`**: as quatro rotas → `401`

```powershell
curl.exe -s -w $W $U/notifications
curl.exe -s -w $W $U/notifications/unread-count
curl.exe -s -w $W -X PATCH $U/notifications/1/read
curl.exe -s -w $W -X POST -H $J --data-binary "@r-spam.json" $U/photos/$FB/report
```

**`curl-02-curtir.jpg`**: A curte a foto de B → B com +1 e o aviso com `actor` e foto; A curte a própria → A continua igual; descurtir apaga; curtir de novo → uma só

```powershell
"B antes: " + (Get-Unread $B)
curl.exe -s -o NUL -w "A curte B   %{http_code}\n" -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
"B depois: " + (Get-Unread $B)
(curl.exe -s -H "Authorization: Bearer $B" $U/notifications | ConvertFrom-Json).data[0] | ConvertTo-Json -Depth 3
"A antes: " + (Get-Unread $A)
curl.exe -s -o NUL -w "A curte a propria %{http_code}\n" -X POST -H "Authorization: Bearer $A" $U/photos/$FA/toggle-like
"A depois: " + (Get-Unread $A)
curl.exe -s -o NUL -w "A descurte  %{http_code}\n" -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
"B: " + (Get-Unread $B)
curl.exe -s -o NUL -w "A curte de novo %{http_code}\n" -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
"B: " + (Get-Unread $B)
```

**`curl-03-comentar.jpg`**: C comenta na foto de B → B +1; B comenta na própria → B igual

```powershell
"B antes: " + (Get-Unread $B)
curl.exe -s -o NUL -w "C comenta %{http_code}\n" -X POST -H "Authorization: Bearer $C" -H $J --data-binary "@n-com.json" $U/photos/$FB/comments
"B: " + (Get-Unread $B)
curl.exe -s -o NUL -w "B comenta na propria %{http_code}\n" -X POST -H "Authorization: Bearer $B" -H $J --data-binary "@n-com.json" $U/photos/$FB/comments
"B: " + (Get-Unread $B)
```

**`curl-04-seguir.jpg`**: aviso de `follow` com `photoId` vazio; deixar de seguir apaga; seguir de novo cria. Se A já seguia B, o primeiro comando **deixa** de seguir; rode-o de novo.

```powershell
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDB/toggle-follow
Get-Notifs $B | Select-Object -First 1
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDB/toggle-follow
"B: " + (Get-Unread $B)
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDB/toggle-follow
"B: " + (Get-Unread $B)
```

**`curl-05-lista.jpg`**: ordem, página 2 com limite 1, além do fim `[]`, `abc`/`-5` → padrões; C só vê as dela

```powershell
Get-Notifs $B | Format-Table
Get-Notifs $B '?limit=1&page=2' | Format-Table
curl.exe -s -w $W -H "Authorization: Bearer $B" "$U/notifications?page=99"
(Get-Notifs $B '?page=abc&limit=-5' | Measure-Object).Count
Get-Notifs $C | Format-Table
```

**`curl-06-lida.jpg`**: outra conta `403`; inexistente `404`; `abc` `400`; a dona `200` com o número menor; repetir `200` com o mesmo número

```powershell
$NID = (curl.exe -s -H "Authorization: Bearer $B" $U/notifications | ConvertFrom-Json).data[0].id
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $C" $U/notifications/$NID/read
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $B" $U/notifications/99999/read
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $B" $U/notifications/abc/read
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $B" $U/notifications/$NID/read
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $B" $U/notifications/$NID/read
"unread-count: " + (Get-Unread $B)
```

**`curl-07-denuncia.jpg`**: `201`; repetir `409`; C `201`; sem motivo / fora da lista / rótulo → `400`; `abc` `400`; `99999` `404`; o dono `400`; sem token `401`; o dono não ganha aviso

```powershell
"B antes: " + (Get-Unread $B)
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@r-spam.json" $U/photos/$FB/report
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@r-spam.json" $U/photos/$FB/report
curl.exe -s -w $W -X POST -H "Authorization: Bearer $C" -H $J --data-binary "@r-har.json" $U/photos/$FB/report
curl.exe -s -w $W -X POST -H "Authorization: Bearer $C" -H $J --data-binary "@r-vazio.json" $U/photos/$FA/report
curl.exe -s -w $W -X POST -H "Authorization: Bearer $C" -H $J --data-binary "@r-fora.json" $U/photos/$FA/report
curl.exe -s -w $W -X POST -H "Authorization: Bearer $C" -H $J --data-binary "@r-rotulo.json" $U/photos/$FA/report
curl.exe -s -w $W -X POST -H "Authorization: Bearer $C" -H $J --data-binary "@r-spam.json" $U/photos/abc/report
curl.exe -s -w $W -X POST -H "Authorization: Bearer $C" -H $J --data-binary "@r-spam.json" $U/photos/99999/report
curl.exe -s -w $W -X POST -H "Authorization: Bearer $B" -H $J --data-binary "@r-spam.json" $U/photos/$FB/report
curl.exe -s -w $W -X POST -H $J --data-binary "@r-spam.json" $U/photos/$FB/report
"B depois: " + (Get-Unread $B)
```

**`curl-09-excluir.jpg`**: B publica uma foto nova; A curte, comenta e denuncia; C curte e comenta; B exclui → no banco, nada sobra da foto. Troque o caminho por uma imagem do seu PC.

```powershell
$NOVA = (curl.exe -s -H "Authorization: Bearer $B" -F "title=Foto para excluir (E14)" -F "image=@C:\caminho\para\uma-foto.jpg" $U/photos | ConvertFrom-Json).data.id
foreach ($t in $A, $C) {
  curl.exe -s -o NUL -X POST -H "Authorization: Bearer $t" $U/photos/$NOVA/toggle-like
  curl.exe -s -o NUL -X POST -H "Authorization: Bearer $t" -H $J --data-binary "@n-com.json" $U/photos/$NOVA/comments
}
curl.exe -s -o NUL -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@r-spam.json" $U/photos/$NOVA/report
"foto nova: $NOVA"
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $B" $U/photos/$NOVA
```

Depois, no Workbench (coloque no mesmo print ou em `curl-09-excluir-b.jpg`), troque `<NOVA>` pelo número:

```sql
SELECT COUNT(*) FROM reports WHERE photo_id = <NOVA>;
SELECT COUNT(*) FROM notifications WHERE photo_id = <NOVA>;
SELECT COUNT(*) FROM notifications WHERE photo_id IS NULL AND type <> 'follow';
```

Os três devem dar **0**.

**`curl-10-logout.jpg`**: o `400` do logout **com** o cabeçalho `Access-Control-Allow-Origin`

```powershell
curl.exe -s -i -X POST $U/logout -H "Origin: http://localhost:5173" -H "Content-Type: application/json" -d "null"
```

**`curl-11-regressao.jpg`**: todos `200`, e `GET /users/abc/followers` → `400`

```powershell
curl.exe -s -o NUL -w "GET /feed                 %{http_code}\n" -H "Authorization: Bearer $A" $U/feed
curl.exe -s -o NUL -w "GET /my-albums            %{http_code}\n" -H "Authorization: Bearer $A" $U/my-albums
curl.exe -s -o NUL -w "GET /search?q=foto        %{http_code}\n" "$U/search?q=foto"
curl.exe -s -o NUL -w "GET /users/$IDB/followers %{http_code}\n" $U/users/$IDB/followers
curl.exe -s -o NUL -w "GET /photos/$FB/comments  %{http_code}\n" $U/photos/$FB/comments
curl.exe -s -o NUL -w "GET /users/abc/followers  %{http_code}\n" $U/users/abc/followers
```

---

## 2. Banco: `banco-notificacoes.jpg` (Workbench)

```sql
SHOW CREATE TABLE notifications;
SHOW CREATE TABLE reports;
SHOW INDEX FROM notifications;
SHOW INDEX FROM reports;
SELECT * FROM reports;
-- troque <A> e <FB> pelo id da conta A e da foto de B (já denunciada por A):
INSERT INTO reports (user_id, photo_id, reason, created_at, updated_at) VALUES (<A>, <FB>, 'spam', NOW(), NOW());
INSERT INTO reports (user_id, photo_id, reason, created_at, updated_at) VALUES (<A>, 99, 'feio', NOW(), NOW());
```

No print devem aparecer: os dois `ENUM`, os índices (`idx_notifications_user_read`, `idx_notifications_photo_id`, `idx_unique_report_user_photo`, `idx_reports_photo_id`), os `ON DELETE` (`SET NULL` na chave da foto em `notifications`; `NO ACTION` em `reports`, que aparece **sem** cláusula `ON DELETE` no `SHOW CREATE TABLE`, porque é o padrão) e os dois erros: `Duplicate entry ... 'idx_unique_report_user_photo'` e `Data truncated for column 'reason'`. Se não couber, envie `banco-notificacoes-a.jpg`, `-b.jpg`...

> O id da conta A aparece com `SELECT id, username FROM users;`.

---

## 3. Testes de controle

**(a) `controle-reports.jpg`**: o banco recusa apagar uma foto denunciada

1. Em `photosphere-api/modules/photo/photoService.js` (função `deletePhoto`), **comente** a linha `await Report.destroy({ where: { photoId: photo.id }, transaction: t });`. Reinicie a API.
2. Como B, publique uma foto; como A, curta e denuncie essa foto (pelo site ou por curl).
3. Como B, tente excluir a foto: o curl abaixo deve mostrar **`500`** com a mensagem de chave estrangeira de `reports`. Tire o print.

   ```powershell
   curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $B" $U/photos/<ID_DA_FOTO>
   ```

4. **Descomente** a linha e reinicie a API.

**(b) `controle-orfa.jpg`**: a notificação órfã

1. **Comente** a linha `await Notification.destroy({ where: { photoId: photo.id }, transaction: t });`. Reinicie a API.
2. Como B, publique outra foto; como A, só curta (sem denunciar).
3. Como B, exclua a foto (`200`). No Workbench, rode e tire o print com a linha órfã (`photo_id` `NULL`):

   ```sql
   SELECT id, user_id, actor_id, type, photo_id FROM notifications WHERE photo_id IS NULL AND type <> 'follow';
   ```

4. **Descomente** a linha, reinicie a API e apague a linha órfã: `DELETE FROM notifications WHERE photo_id IS NULL AND type <> 'follow';`

---

## 4. Telas (duas janelas: a normal logada como **B**, uma anônima logada como **A**)

| Arquivo | Como tirar |
|---|---|
| `sino-contador.jpg` | Na janela de A, curta, comente e siga B. Na de B, espere até 30 s: o **selo** aparece no sino. Clique com o botão direito no sino → **Inspecionar**: o print mostra o selo e, no DevTools, o `aria-label="Notificações (3 não lidas)"`. |
| `polling-network.jpg` | Na janela de B: F12 → **Network** → filtro **Fetch/XHR** → digite `unread` no filtro. Dê F5 e espere uns 70 s: aparecem a requisição **imediata** e as seguintes, de **30 em 30 s** (coluna "Time"/cascata). Print. |
| `lista-notificacoes.jpg` | Clique no sino: a lista com **lidas e não lidas** (marque uma como lida antes) e os **três tipos** (curtiu, comentou, seguiu). |
| `otimista-lida.jpg` | Na lista, Network → **Slow 4G**. Clique em **Marcar como lida** e tire o print com a linha **já sem destaque** e a requisição `read` ainda **(pending)**. |
| `rollback-lida.jpg` | Mude para **Offline** e clique em "Marcar como lida" em outra linha: a linha **volta** a ficar destacada, o **sino volta** ao número de antes e aparece o **toast vermelho**. Print. Volte para **No throttling**. |
| `denuncia-modal.jpg` | Na janela de **A**, abra uma foto de B → **Denunciar**. Print do modal com os **cinco motivos**. |
| `denuncia-toast.jpg` | Escolha um motivo e envie: print do **toast verde**. (Use uma foto que A ainda não denunciou.) |
| `denuncia-409.jpg` | Na mesma foto, **Denunciar** de novo, escolha um motivo e envie: print com "Você já denunciou esta foto." **dentro do modal**, sem toast. |
| `console-logout.jpg` | F12 → **Console** → limpe (🚫). Saia da conta pelo menu do avatar. Print do Console **limpo** logo depois do logout. |

## 5. Teste prático completo (sem print; marca o checklist)

1. **Sino:** o visitante não vê o sino; B vê sem número; A curte, comenta e segue → em até 30 s o selo mostra 3; logout/login três vezes → continua uma requisição a cada 30 s; ao sair, nenhuma.
2. **Intervalo curto (experimento):** em `photosphere-frontend/src/config/constants.js`, troque `POLL_MS: 30000` por `5000`; o número muda em até 5 s; com a aba escondida não há requisições (e uma imediata ao voltar). **Desfaça.**
3. **Lista:** o sino abre a lista; marcar como lida muda na hora (Slow 4G); Offline → linha e sino voltam + toast; duas linhas com Slow 4G e depois Offline → o sino volta ao número do começo; clique duplo → uma requisição.
4. **Navegar:** clicar numa notificação leva ao perfil (seguir) ou à foto (curtir/comentar) e a marca como lida.
5. **Atualizar e paginar:** "Atualizar" traz a nova; com mais de 12, "Carregar mais notificações".
6. **Denúncia:** visitante → login → volta; o dono não vê o botão; sem motivo → mensagem sem requisição; Offline → erro dentro do modal, sem toast; sucesso → toast verde; de novo → "Você já denunciou..."; o dono não recebe notificação.
7. **A corrida (opcional):** pule; não é obrigatória.
8. **Exclusão:** como dono, exclua a foto curtida, comentada e denunciada → a lista do dono fica só com os avisos de `follow`.
9. **Regressão:** curtir e seguir (Offline → volta + toast; visitante → login → volta), álbuns, "Salvar", busca com debounce, Login/Logout (Console limpo), Perfil, Feed, Seguindo, comentários; sessão expirada: no Console, `localStorage.setItem('token', 'lixo')` e F5 numa tela logada → vai ao Login, sem toast e sem laço.

---

## 6. Finalizar a entrega

```powershell
powershell -ExecutionPolicy Bypass -File .\E14\finalizar-entrega.ps1
```

O script confere os prints, marca os itens da Atividade 14 nos três checklists e gera em `E14/` os dois `.zip`. **Envie os dois `.zip`.**
