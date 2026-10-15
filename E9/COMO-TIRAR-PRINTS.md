# Prints — Atividade 09

Salvar tudo em `.jpg` nesta pasta (`01 - Docs/atividade09/`).

**Antes:** API (`node server.js`) e frontend (`npm run dev`) rodando, duas contas (A com pelo menos 2 fotos, B com nenhuma ou poucas). Uma imagem qualquer `nova.jpg` na pasta da API.

## Telas (logado como A)

| Arquivo | Como tirar |
|---|---|
| `menu-avatar.jpg` | Clique no avatar no canto direito da Navbar com o menu aberto. |
| `perfil-publico.jpg` | Menu do avatar → **Ver Perfil**. |
| `modal-exclusao.jpg` | Menu do avatar → **Minhas Fotos** → **Excluir** em um card (não confirme). |
| `editar.jpg` | Minhas Fotos → **Editar** em um card. |

## curl (PowerShell, na pasta `photosphere-api`)

Pegue os tokens (troque usuário/senha pelos seus):

```powershell
$A = (Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/login -ContentType 'application/json' -Body '{"email":"USUARIO_A","password":"SENHA_A"}').data.token
$B = (Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/login -ContentType 'application/json' -Body '{"email":"USUARIO_B","password":"SENHA_B"}').data.token
$ID = 5      # id de uma foto da A
$ID2 = 6     # outra foto da A (será excluída no print 6)
function Conta { (Get-ChildItem public\uploads\photos).Count }
```

Um print por bloco:

**`curl-1-detalhe-reload.jpg`** — contagens consecutivas
```powershell
curl.exe -s http://localhost:3000/api/photos/$ID
curl.exe -s http://localhost:3000/api/photos/$ID
```

**`curl-2-my-photos.jpg`**
```powershell
curl.exe -s http://localhost:3000/api/my-photos
curl.exe -s -H "Authorization: Bearer $A" http://localhost:3000/api/my-photos
curl.exe -s -H "Authorization: Bearer $B" http://localhost:3000/api/my-photos
```

**`curl-3-edit.jpg`**
```powershell
curl.exe -s http://localhost:3000/api/photos/$ID/edit
curl.exe -s -H "Authorization: Bearer $B" http://localhost:3000/api/photos/$ID/edit
curl.exe -s -H "Authorization: Bearer $A" http://localhost:3000/api/photos/9999/edit
curl.exe -s -H "Authorization: Bearer $A" http://localhost:3000/api/photos/$ID/edit
```

**`curl-4-put.jpg`** — texto e arquivo novo, com contagem antes/depois
```powershell
Conta
curl.exe -s -X PUT -H "Authorization: Bearer $A" -F "title=Titulo editado" http://localhost:3000/api/photos/$ID
Conta
curl.exe -s -X PUT -H "Authorization: Bearer $A" -F "title=Titulo editado" -F "image=@nova.jpg" http://localhost:3000/api/photos/$ID
Conta
```

**`curl-5-orfaos.jpg`** — a contagem não pode subir
```powershell
Conta
curl.exe -s -X PUT -H "Authorization: Bearer $B" -F "title=hack" -F "image=@nova.jpg" http://localhost:3000/api/photos/$ID
curl.exe -s -X PUT -H "Authorization: Bearer $A" -F "title= " -F "image=@nova.jpg" http://localhost:3000/api/photos/$ID
Conta
```

**`curl-6-delete.jpg`** — contagem antes/depois e `photosCount`
```powershell
Conta
curl.exe -s -X DELETE -H "Authorization: Bearer $B" http://localhost:3000/api/photos/$ID2
curl.exe -s -X DELETE -H "Authorization: Bearer $A" http://localhost:3000/api/photos/$ID2
curl.exe -s http://localhost:3000/api/photos/$ID2
Conta
curl.exe -s -X DELETE -H "Authorization: Bearer $A" http://localhost:3000/api/photos/$ID2
curl.exe -s -H "Authorization: Bearer $A" http://localhost:3000/api/profile/me
```

**`curl-7-perfil-publico.jpg`** (troque `USUARIO_A`)
```powershell
curl.exe -s http://localhost:3000/api/profile/USUARIO_A
curl.exe -s -H "Authorization: Bearer $A" http://localhost:3000/api/profile/USUARIO_A
curl.exe -s -H "Authorization: Bearer $B" http://localhost:3000/api/profile/USUARIO_A
curl.exe -s http://localhost:3000/api/profile/naoexiste
```
