# Prints — Atividade 10

Salvar tudo em `.jpg` nesta pasta (`01 - Docs/atividade10/`).

**Antes:** API e frontend rodando; reinicie a API uma vez para o `sync` criar as tabelas `likes` e `comments`. Contas A e B; A com pelo menos 2 fotos.

## Telas

| Arquivo | Como tirar |
|---|---|
| `detalhe-interacao.jpg` | Logado como B, abra uma foto da A, curta (coração vermelho) e publique um comentário. |
| `otimista.jpg` | F12 → aba **Network** → throttling **Slow 4G**. Clique no coração e tire o print com o coração já alterado e a requisição `toggle-like` ainda pendente. |
| `rollback.jpg` | Na mesma aba, troque para **Offline**, clique no coração e tire o print com a mensagem vermelha embaixo do botão. Volte para **No throttling**. |
| `curtidas.jpg` | Clique no coração ao lado de **Publicar** na Navbar. |
| `unique.jpg` | No cliente do banco (Workbench/HeidiSQL), rode o SQL abaixo com um par que já existe em `likes` e tire o print do erro `Duplicate entry`. |

```sql
SELECT user_id, photo_id FROM likes;
INSERT INTO likes (user_id, photo_id, created_at, updated_at) VALUES (2, 5, NOW(), NOW());
```

## curl (PowerShell, na pasta `photosphere-api`)

```powershell
$A = (Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/login -ContentType 'application/json' -Body '{"email":"USUARIO_A","password":"SENHA_A"}').data.token
$B = (Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/login -ContentType 'application/json' -Body '{"email":"USUARIO_B","password":"SENHA_B"}').data.token
$ID = 5      # foto da A ainda sem curtidas
$ID2 = 6     # outra foto da A (será excluída no print 6)
$U = "http://localhost:3000/api"
'{"content":"oi"}'                        | Set-Content -Encoding ascii c-ok.json
'{"content":"     "}'                     | Set-Content -Encoding ascii c-espacos.json
('{"content":"' + ('a' * 501) + '"}')     | Set-Content -Encoding ascii c-501.json
'{"content":"   Que luz incrivel!   "}'   | Set-Content -Encoding ascii c-trim.json
```

**`curl-1-curtir.jpg`**
```powershell
curl.exe -s -X POST $U/photos/$ID/toggle-like
curl.exe -s -X POST -H "Authorization: Bearer $B" $U/photos/9999/toggle-like
curl.exe -s -X POST -H "Authorization: Bearer $B" $U/photos/$ID/toggle-like
curl.exe -s -X POST -H "Authorization: Bearer $B" $U/photos/$ID/toggle-like
curl.exe -s -X POST -H "Authorization: Bearer $B" $U/photos/$ID/toggle-like
curl.exe -s -X POST -H "Authorization: Bearer $A" $U/photos/$ID/toggle-like
```

**`curl-2-like-status.jpg`**
```powershell
curl.exe -s $U/photos/$ID/like-status
curl.exe -s -H "Authorization: Bearer $B" $U/photos/$ID/like-status
curl.exe -s $U/photos/$ID
curl.exe -s -H "Authorization: Bearer $B" $U/photos/$ID
```

**`curl-3-liked-photos.jpg`**
```powershell
curl.exe -s -H "Authorization: Bearer $B" $U/liked-photos
curl.exe -s $U/liked-photos
```

**`curl-4-comentar.jpg`**
```powershell
curl.exe -s -X POST -H "Content-Type: application/json" --data-binary "@c-ok.json" $U/photos/$ID/comments
curl.exe -s -X POST -H "Authorization: Bearer $B" -H "Content-Type: application/json" --data-binary "@c-espacos.json" $U/photos/$ID/comments
curl.exe -s -X POST -H "Authorization: Bearer $B" -H "Content-Type: application/json" --data-binary "@c-501.json" $U/photos/$ID/comments
curl.exe -s -X POST -H "Authorization: Bearer $B" -H "Content-Type: application/json" --data-binary "@c-ok.json" $U/photos/9999/comments
curl.exe -s -X POST -H "Authorization: Bearer $B" -H "Content-Type: application/json" --data-binary "@c-trim.json" $U/photos/$ID/comments
```

**`curl-5-listar-comentarios.jpg`**
```powershell
curl.exe -s $U/photos/$ID/comments
curl.exe -s $U/photos/$ID
```

**`curl-6-excluir-com-interacoes.jpg`** — antes, curta e comente a `$ID2` com B:
```powershell
curl.exe -s -X POST -H "Authorization: Bearer $B" $U/photos/$ID2/toggle-like
curl.exe -s -X POST -H "Authorization: Bearer $B" -H "Content-Type: application/json" --data-binary "@c-ok.json" $U/photos/$ID2/comments
curl.exe -s -X DELETE -H "Authorization: Bearer $A" $U/photos/$ID2
curl.exe -s -H "Authorization: Bearer $B" $U/liked-photos
curl.exe -s -H "Authorization: Bearer $A" $U/profile/me
```
No cliente do banco, confira (deve voltar 0 nas duas): `SELECT COUNT(*) FROM likes WHERE photo_id = 6; SELECT COUNT(*) FROM comments WHERE photo_id = 6;`

**`curl-7-trim.jpg`**
```powershell
node scripts/testeTrim.js $A $ID
```
