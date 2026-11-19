# Prints — Atividade 15

Salvar tudo em `.jpg` em `photosphere-frontend/01 - Docs/atividade15/` (crie a pasta se ainda não existir), **com os nomes exatos da lista**.

**Ordem do trabalho em casa:** 0. trocar para o código da E15 → 1. banco → 2. curl → 3. testes de controle → 4. telas → 5. teste completo → 6. finalizar (script). O código e os documentos (`respostas.md`, `checklists.md`) já estão prontos.

## 0. Preparar

1. Troque o código para a tag `entrega-e15` (o Claude de casa faz isso) e suba a API e o front.
2. O `sync` acrescenta à tabela `reports` as colunas **`status`** e **`reviewed_at`**.
3. **Quatro contas:** **ADMIN** (crie uma nova pelo site, ex.: `admin1`), **A**, **B** e **C**. A e B com pelo menos uma foto cada; precisa haver denúncias (as da E14 servem).
4. **Promova a conta ADMIN** (Terminal, na pasta `photosphere-api`, com a API rodando ou não):

   ```powershell
   node scripts/setAdmin.js admin1
   ```

   Faça isso **antes** de entrar com ela no site: o front lê o `isAdmin` no momento do login.

> ⚠️ **Mudança desta aula:** o login "ADM / 123456" que funcionava com o banco desligado e o atalho `dev-token` deixaram de existir. Administrador agora só pelo `setAdmin.js`.

---

## 1. Banco: `banco-denuncias.jpg` (Workbench)

```sql
SHOW CREATE TABLE reports;
SELECT status, COUNT(*) FROM reports GROUP BY status;
```

O print deve mostrar as colunas `status` (`enum('pending','reviewed')`, `DEFAULT 'pending'`) e `reviewed_at`, o índice `idx_reports_status` e a contagem por situação (as denúncias antigas aparecem como `pending`).

---

## 2. curl (PowerShell)

O token do ADMIN deve ser pedido **antes** de promovê-lo, para o teste 2 (a prova de que o papel vem do banco). Se você já promoveu, rebaixe (`node scripts/setAdmin.js admin1 off`), pegue o token, promova de novo e siga.

```powershell
$U = "http://localhost:3000/api"
$W = '  [HTTP %{http_code}]\n'
$J = "Content-Type: application/json"
$ADM = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_ADMIN","password":"SENHA_ADMIN"}').data.token
$A = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_A","password":"SENHA_A"}').data.token
$B = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_B","password":"SENHA_B"}').data.token
$IDADM = (Invoke-RestMethod -Uri $U/profile/me -Headers @{ Authorization = "Bearer $ADM" }).data.id
$IDB = (Invoke-RestMethod -Uri $U/profile/me -Headers @{ Authorization = "Bearer $B" }).data.id
'{"isBlocked":true}'   | Set-Content -Encoding ascii b-true.json
'{"isBlocked":false}'  | Set-Content -Encoding ascii b-false.json
'{}'                   | Set-Content -Encoding ascii b-vazio.json
'{"isBlocked":"true"}' | Set-Content -Encoding ascii b-texto.json
```

Agora promova a conta ADMIN (`node scripts/setAdmin.js admin1`, em outro terminal) e siga.

**`curl-1-guarda.jpg`**: as sete rotas + uma inexistente: `401` sem token e `403` com o token de A

```powershell
$rotas = @('GET /admin/dashboard', 'GET /admin/reports', 'PATCH /admin/reports/1/review', 'GET /admin/users', 'PATCH /admin/users/1/block', 'GET /admin/photos', 'DELETE /admin/photos/1', 'GET /admin/rota-inexistente')
foreach ($r in $rotas) {
  $m, $p = $r.Split(' ')
  $sem = curl.exe -s -o NUL -w "%{http_code}" -X $m "$U$p"
  $com = curl.exe -s -o NUL -w "%{http_code}" -X $m -H "Authorization: Bearer $A" "$U$p"
  "{0,-34} sem token={1}  comum={2}" -f $r, $sem, $com
}
```

**`curl-2-dashboard.jpg`**: com o token do ADMIN pedido **antes** da promoção → `200` e as sete chaves (confira com o banco: `SELECT COUNT(*) FROM users;` etc.)

```powershell
curl.exe -s -w $W -H "Authorization: Bearer $ADM" $U/admin/dashboard
```

**`curl-3-denuncias.jpg`**: padrão (pendentes), `all`, `reviewed`, `xyz` → `400`, página 2 com limite 1

```powershell
(curl.exe -s -H "Authorization: Bearer $ADM" $U/admin/reports | ConvertFrom-Json).data | Select-Object id, reason, status, @{ n = 'foto'; e = { $_.photo.title } }, @{ n = 'autor'; e = { $_.photo.author.username } }, @{ n = 'denunciou'; e = { $_.Reporter.username } } | Format-Table
(curl.exe -s -H "Authorization: Bearer $ADM" "$U/admin/reports?status=all" | ConvertFrom-Json).data.Count
(curl.exe -s -H "Authorization: Bearer $ADM" "$U/admin/reports?status=reviewed" | ConvertFrom-Json).data.Count
curl.exe -s -w $W -H "Authorization: Bearer $ADM" "$U/admin/reports?status=xyz"
(curl.exe -s -H "Authorization: Bearer $ADM" "$U/admin/reports?limit=1&page=2" | ConvertFrom-Json).data | Select-Object id, reason, status
```

**`curl-4-revisar.jpg`**: `200` com `reviewedAt`; repetir → o **mesmo** `reviewedAt`; `404`; `400`; token comum `403`; o Dashboard acompanha

```powershell
$RID = (curl.exe -s -H "Authorization: Bearer $ADM" $U/admin/reports | ConvertFrom-Json).data[0].id
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" $U/admin/reports/$RID/review
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" $U/admin/reports/$RID/review
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" $U/admin/reports/99999/review
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" $U/admin/reports/abc/review
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $A" $U/admin/reports/$RID/review
(curl.exe -s -H "Authorization: Bearer $ADM" $U/admin/dashboard | ConvertFrom-Json).data | Select-Object pendingReports, reviewedReports
```

**`curl-5-usuarios.jpg`**: lista com `email` e flags (sem `password`); busca por username e por e-mail; `%%` vazio; `search` duplicado sem erro. Troque `TRECHO_USERNAME` e `TRECHO_EMAIL`.

```powershell
(curl.exe -s -H "Authorization: Bearer $ADM" $U/admin/users | ConvertFrom-Json).data | Select-Object id, username, email, isAdmin, isBlocked, photosCount | Format-Table
(curl.exe -s -H "Authorization: Bearer $ADM" "$U/admin/users?search=TRECHO_USERNAME" | ConvertFrom-Json).data | Select-Object username, email
(curl.exe -s -H "Authorization: Bearer $ADM" "$U/admin/users?search=TRECHO_EMAIL" | ConvertFrom-Json).data | Select-Object username, email
(curl.exe -s -H "Authorization: Bearer $ADM" "$U/admin/users?search=%25%25" | ConvertFrom-Json).data.Count
curl.exe -s -o NUL -w "search duplicado: %{http_code}\n" -H "Authorization: Bearer $ADM" "$U/admin/users?search=a&search=b"
```

**`curl-6-bloquear.jpg`**: bloquear `200` (2x); o token antigo de B → `401` com a mensagem; login de B → `403` (senha certa) e genérica (senha errada); perfil público visível; desbloquear e o token volta; os erros `400`/`400`/`400`/`404`/`400`. Se não couber, divida em `-a`/`-b`.

```powershell
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-true.json" $U/admin/users/$IDB/block
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-true.json" $U/admin/users/$IDB/block
curl.exe -s -w $W -H "Authorization: Bearer $B" $U/profile/me
'{"email":"EMAIL_B","password":"SENHA_B"}' | Set-Content -Encoding ascii login-b.json
'{"email":"EMAIL_B","password":"senhaerrada"}' | Set-Content -Encoding ascii login-b-errada.json
curl.exe -s -w $W -X POST -H $J --data-binary "@login-b.json" $U/login
curl.exe -s -w $W -X POST -H $J --data-binary "@login-b-errada.json" $U/login
curl.exe -s -o NUL -w "perfil publico de B: %{http_code}\n" $U/profile/USERNAME_B
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-false.json" $U/admin/users/$IDB/block
curl.exe -s -o NUL -w "token antigo de B de novo: %{http_code}\n" -H "Authorization: Bearer $B" $U/profile/me
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-vazio.json" $U/admin/users/$IDB/block
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-texto.json" $U/admin/users/$IDB/block
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-true.json" $U/admin/users/$IDADM/block
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-true.json" $U/admin/users/99999/block
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-true.json" $U/admin/users/abc/block
```

Para o "outro administrador → `403`": promova C (`node scripts/setAdmin.js USERNAME_C`), tente bloqueá-lo e depois rebaixe (`... USERNAME_C off`). Pode ser no mesmo print:

```powershell
$IDC = <id da conta C>
curl.exe -s -w $W -X PATCH -H "Authorization: Bearer $ADM" -H $J --data-binary "@b-true.json" $U/admin/users/$IDC/block
```

**`curl-7-rebaixado.jpg`**: `node scripts/setAdmin.js admin1 off` → o mesmo token dá `403`; promover de novo → `200`. Deixe no print os comandos do `setAdmin` e os dois curl.

```powershell
node scripts/setAdmin.js admin1 off
curl.exe -s -w $W -H "Authorization: Bearer $ADM" $U/admin/dashboard
node scripts/setAdmin.js admin1
curl.exe -s -o NUL -w "dashboard: %{http_code}\n" -H "Authorization: Bearer $ADM" $U/admin/dashboard
```

(Rode o `setAdmin` dentro da pasta `photosphere-api`.)

**`curl-8-fotos.jpg`**: lista com autor e `pendingReportsCount`; busca; `%` vazio; rota comum com o token do ADMIN → `403`; a do painel → `200`; repetir `404`; `abc` `400`. Use uma foto **de teste** denunciada (publique uma como B e denuncie como A, se precisar).

```powershell
(curl.exe -s -H "Authorization: Bearer $ADM" $U/admin/photos | ConvertFrom-Json).data | Select-Object id, title, @{ n = 'autor'; e = { $_.author.username } }, pendingReportsCount | Format-Table
(curl.exe -s -H "Authorization: Bearer $ADM" "$U/admin/photos?search=TRECHO_DO_TITULO" | ConvertFrom-Json).data | Select-Object id, title
(curl.exe -s -H "Authorization: Bearer $ADM" "$U/admin/photos?search=%25" | ConvertFrom-Json).data.Count
$FT = <id da foto de teste>
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $ADM" $U/photos/$FT
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $ADM" $U/admin/photos/$FT
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $ADM" $U/admin/photos/$FT
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $ADM" $U/admin/photos/abc
```

No Workbench (mesmo print ou `curl-8-fotos-b.jpg`), troque `<FT>`: `SELECT COUNT(*) FROM reports WHERE photo_id = <FT>; SELECT COUNT(*) FROM notifications WHERE photo_id = <FT>; SELECT COUNT(*) FROM likes WHERE photo_id = <FT>;` → três zeros.

**`curl-9-regressao.jpg`**: tudo como antes; token lixo → `401`

```powershell
curl.exe -s -o NUL -w "GET /feed               %{http_code}\n" -H "Authorization: Bearer $A" $U/feed
curl.exe -s -o NUL -w "GET /profile/me         %{http_code}\n" -H "Authorization: Bearer $A" $U/profile/me
curl.exe -s -o NUL -w "GET /notifications      %{http_code}\n" -H "Authorization: Bearer $B" $U/notifications
curl.exe -s -o NUL -w "GET /search?q=%%25%%25    %{http_code}\n" "$U/search?q=%25%25"
curl.exe -s -o NUL -w "GET /my-albums          %{http_code}\n" -H "Authorization: Bearer $A" $U/my-albums
curl.exe -s -o NUL -w "token lixo              %{http_code}\n" -H "Authorization: Bearer lixo" $U/feed
```

---

## 3. Testes de controle

**(a) `controle-bloqueio.jpg`**

1. Em `photosphere-api/middlewares/auth.js`, **comente** as três linhas do `if (user.isBlocked) { ... }`. Reinicie a API.
2. Bloqueie B (`curl ... b-true.json ... /admin/users/$IDB/block`) e rode `curl.exe -s -w $W -H "Authorization: Bearer $B" $U/profile/me`: dá **`200`** (o token de um bloqueado funcionando). Print.
3. **Descomente**, reinicie, desbloqueie B.

**(b) `controle-isadmin.jpg`**

1. Em `photosphere-api/modules/admin/adminRoutes.js`, troque `router.use('/admin', isAuthenticated, isAdmin);` por `router.use('/admin', isAuthenticated);`. Reinicie a API.
2. `curl.exe -s -w $W -H "Authorization: Bearer $A" $U/admin/dashboard` → **`200`** com os números (usuário comum lendo o painel). Print.
3. **Desfaça**, reinicie e confirme que volta a dar **`403`** (pode ficar no mesmo print).

---

## 4. Telas (janela normal como **ADMIN**; anônima como **A** ou **B**)

| Arquivo | Como tirar |
|---|---|
| `guarda-comum.jpg` | Na janela anônima, logado como **A**, digite `http://localhost:5173/admin/moderation`: volta ao Feed com o **toast vermelho** "Você não tem permissão para acessar a administração." Print. |
| `guarda-localstorage.jpg` | Ainda como **A**: F12 → **Application** → Local Storage → `http://localhost:5173` → chave **`user`**: troque `"isAdmin":false` por `"isAdmin":true` e dê F5. Abra o menu do avatar → **Painel de administração**. Print com a tela "Acesso restrito a administradores." e a aba **Network** mostrando os **`403`**. Desfaça saindo da conta e entrando de novo. |
| `dashboard.jpg` | Na janela do **ADMIN**: menu do avatar → **Painel de administração** (`/admin` → `/admin/dashboard`). Print dos cartões com o de **Denúncias pendentes** em vermelho. |
| `denuncias-lista.jpg` | Aba **Denúncias**: print com o grupo de filtros, o **motivo em português** e os selos Pendente/Revisada (use o filtro **Todas**). |
| `revisar-lenta.jpg` | Filtro **Pendentes**, F12 → Network → **Slow 3G** (ou 3G). Clique em **Marcar como revisada**: print com o botão em "**Salvando...**" e a linha ainda pendente. Volte para **No throttling**. |
| `pulo-paginacao.jpg` | Veja o passo 6 do teste completo abaixo. Print com a lista do painel (onde falta um item) e, ao lado (outra aba, ou o curl `GET /admin/reports?limit=50`), a lista do servidor mostrando o item que não apareceu. |
| `usuarios-busca.jpg` | Aba **Usuários**, Network → **Fetch/XHR** → limpe. Digite um nome sem pausa: print com **uma só** requisição `users?search=...`. |
| `bloquear-modal.jpg` | Clique em **Bloquear** num usuário comum: print da confirmação. |
| `bloqueado-login.jpg` | Confirme o bloqueio. Na janela anônima, logado como esse usuário, clique em qualquer coisa: vai para o Login (sem toast). Tente entrar: print com "**Sua conta foi bloqueada...**" no formulário. Depois, desbloqueie pelo painel. |
| `itens-excluir.jpg` | Aba **Fotos** → **Excluir** numa foto de teste: print da confirmação, que lista o que será apagado e avisa que não dá para desfazer. |

## 5. Teste prático completo (sem print, exceto o passo 6; marca o checklist)

1. **Guarda:** visitante em `/admin/dashboard` → Login com `?redirect=`; usuário comum em `/admin/moderation` → Feed com aviso, e sem a seção Administração no menu.
2. **`localStorage`:** veja `guarda-localstorage.jpg`.
3. **Layout:** o ADMIN chega pelo menu; quatro abas, a atual destacada; o cartão de pendentes leva às denúncias.
4. **Rebaixar com o painel aberto:** `node scripts/setAdmin.js admin1 off`, clique numa aba → "Acesso restrito" sem recarregar; promova de novo → volta a funcionar.
5. **Denúncias:** motivo em português; Slow 3G → "Salvando..." e a linha pendente até a resposta; clique duplo → uma requisição; Offline → a linha não muda e há toast; filtros Pendentes/Revisadas/Todas.
6. **O "pulo" (print `pulo-paginacao.jpg`):** precisa de pelo menos **5 denúncias pendentes** (crie com várias contas/fotos). Em `photosphere-frontend/src/config/constants.js`, troque `PAGE_SIZE = 12` por `PAGE_SIZE = 2`. No filtro Pendentes, clique em "Carregar mais" uma vez (4 itens na tela). Revise o **primeiro** item e clique em "Carregar mais" de novo: um item deixa de aparecer. "Atualizar" o traz de volta. **Volte o `PAGE_SIZE` para 12.**
7. **Usuários:** nenhuma requisição durante a digitação e uma depois da pausa; `%%` → vazio; Bloquear → Cancelar; Offline → o modal continua; bloqueio ok → selo; na janela do bloqueado, a próxima ação leva ao Login sem toast e o login mostra a mensagem do bloqueio; Desbloquear direto.
8. **Fotos:** busca; selo de denúncias; Excluir → Cancelar; Offline → o modal continua; excluir de verdade → a linha some, as denúncias da foto somem da aba Denúncias ("Atualizar") e a foto some da lista do dono.
9. **Regressão:** Feed e "Carregar mais", Seguindo, Notificações, Álbuns, sino, Denunciar, busca com debounce, Login/Logout (Console limpo); sessão expirada (`localStorage.setItem('token', 'lixo')` no Console + F5) → Login, sem toast e sem laço.

---

## 6. Finalizar a entrega

```powershell
powershell -ExecutionPolicy Bypass -File .\E15\finalizar-entrega.ps1
```

O script confere os prints, marca os itens da Atividade 15 nos três checklists e gera em `E15/` os dois `.zip`. **Envie os dois `.zip`.**
