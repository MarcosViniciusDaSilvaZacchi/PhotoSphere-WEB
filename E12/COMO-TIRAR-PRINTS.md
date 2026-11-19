# Prints — Atividade 12

Salvar tudo em `.jpg` em `photosphere-frontend/01 - Docs/atividade12/` (crie a pasta se ela ainda não existir), **com os nomes exatos da lista**.

**Ordem do trabalho em casa:** 0. print "antes" (ainda com o código da E11) → 1. trocar para o código da E12 → 2. curl → 3. telas → 4. regressão completa → 5. finalizar (script). O código e os documentos (`checkpoint-02.md`, `respostas.md`, `checklists.md`) já estão prontos.

## 0. `paginacao-antes.jpg` — AINDA com o código da E11

Este print mostra o problema **antes** da correção, então precisa ser tirado com a API da Atividade 11 (tag `entrega-e11`). Faça logo depois de terminar a E11, antes de trocar o código. Com a API rodando, no PowerShell:

```powershell
$U = "http://localhost:3000/api"
$W = '  [HTTP %{http_code}]\n'
$A = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_A","password":"SENHA_A"}').data.token
curl.exe -s -w $W -H "Authorization: Bearer $A" "$U/following-photos?limit=-3"
curl.exe -s -w $W -H "Authorization: Bearer $A" "$U/following-photos?page=-2&limit=2"
curl.exe -s -w $W -H "Authorization: Bearer $A" "$U/feed?limit=-3"
```

Esperado com a E11: o feed filtrado responde **`500`** (o MySQL recusa `LIMIT -3` e o `OFFSET` negativo), e o feed geral responde `200` com **um item só**, o clamp antigo transformando `-3` em `1` sem avisar. Tire o print com os três comandos e as respostas.

## 1. Trocar para o código da E12

Pare a API e o front (`Ctrl+C`), troque o código para a tag `entrega-e12` (o Claude de casa faz isso) e suba os dois de novo. A E12 não traz pacote novo nem tabela nova.

---

## 2. curl (PowerShell)

Prepare as variáveis (as contas A, B e C são as da E11):

```powershell
$U = "http://localhost:3000/api"
$W = '  [HTTP %{http_code}]\n'
$A = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_A","password":"SENHA_A"}').data.token
$B = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_B","password":"SENHA_B"}').data.token
$IDA = (Invoke-RestMethod -Uri $U/profile/me -Headers @{ Authorization = "Bearer $A" }).data.id
$IDB = (Invoke-RestMethod -Uri $U/profile/me -Headers @{ Authorization = "Bearer $B" }).data.id
$UB = "USERNAME_B"
$FB = (Invoke-RestMethod -Uri $U/my-photos -Headers @{ Authorization = "Bearer $B" }).data[0].id
```

**`paginacao-depois.jpg`**: esperado: tudo `200`, sem erro; `-3` e `abc` caem no padrão (12); `100000` é cortado em 50; `page=-2` vira a página 1

```powershell
curl.exe -s -o NUL -w "following-photos?limit=-3          %{http_code}\n" -H "Authorization: Bearer $A" "$U/following-photos?limit=-3"
curl.exe -s -o NUL -w "following-photos?page=-2&limit=2   %{http_code}\n" -H "Authorization: Bearer $A" "$U/following-photos?page=-2&limit=2"
curl.exe -s -o NUL -w "following-photos?limit=100000      %{http_code}\n" -H "Authorization: Bearer $A" "$U/following-photos?limit=100000"
curl.exe -s -o NUL -w "feed?limit=-3                      %{http_code}\n" -H "Authorization: Bearer $A" "$U/feed?limit=-3"
curl.exe -s -o NUL -w "feed?page=abc&limit=xyz            %{http_code}\n" -H "Authorization: Bearer $A" "$U/feed?page=abc&limit=xyz"
(curl.exe -s -H "Authorization: Bearer $A" "$U/feed?limit=-3" | ConvertFrom-Json).data.Count
(curl.exe -s -H "Authorization: Bearer $A" "$U/feed?page=2&limit=1" | ConvertFrom-Json).data | Select-Object id, title
```

Os prints abaixo são a **regressão da API** (Parte A, Etapa 4). Em cada um, deixe comandos e respostas visíveis; se não couber, divida em `-a.jpg` e `-b.jpg`.

**`curl-1-perfil-feeds.jpg`**: perfil com `isFollowing`, feed e feed filtrado (todos `200`)

```powershell
(curl.exe -s -H "Authorization: Bearer $A" $U/profile/$UB | ConvertFrom-Json).data | Select-Object username, isOwner, isFollowing, followersCount, photosCount
curl.exe -s -o NUL -w "GET /feed              %{http_code}\n" -H "Authorization: Bearer $A" $U/feed
curl.exe -s -o NUL -w "GET /following-photos  %{http_code}\n" -H "Authorization: Bearer $A" $U/following-photos
```

**`curl-2-seguir.jpg`**: deixar de seguir (`200`) e seguir de novo (`201`); seguidores de B

```powershell
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDB/toggle-follow
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDB/toggle-follow
curl.exe -s -w $W $U/users/$IDB/followers
```

**`curl-3-curtir.jpg`**: curtir (`201`), lista de curtidas, descurtir (`200`)

```powershell
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
(curl.exe -s -H "Authorization: Bearer $A" $U/liked-photos | ConvertFrom-Json).data | Select-Object id, title
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
```

**`curl-4-comentar.jpg`**: comentar (`201`) e listar comentários (`200`)

```powershell
'{"content":"Regressao da Aula 12"}' | Set-Content -Encoding ascii c12.json
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H "Content-Type: application/json" --data-binary "@c12.json" $U/photos/$FB/comments
curl.exe -s -w $W $U/photos/$FB/comments
```

**`curl-5-minhas-fotos.jpg`**: "minhas fotos" com B (`200`) e sem token (`401`)

```powershell
(curl.exe -s -H "Authorization: Bearer $B" $U/my-photos | ConvertFrom-Json).data | Select-Object id, title, likesCount, commentsCount
curl.exe -s -w $W $U/my-photos
```

**`curl-6-criar-foto.jpg`**: a transação da Etapa 3: `201` e o `photosCount` de A sobe 1. Troque o caminho por uma imagem `.jpg` qualquer do seu PC; esta foto nova é excluída no fim.

```powershell
$UA = "USERNAME_A"
(curl.exe -s $U/profile/$UA | ConvertFrom-Json).data.photosCount
curl.exe -s -w $W -H "Authorization: Bearer $A" -F "title=Teste da transacao" -F "image=@C:\caminho\para\uma-foto.jpg" $U/photos
(curl.exe -s $U/profile/$UA | ConvertFrom-Json).data.photosCount
```

Depois do print, exclua a foto de teste em "Minhas Fotos" da conta A.

---

## 3. Telas (navegador, `http://localhost:5173`)

Entre como **A**. Para os prints com DevTools, abra com `F12`.

| Arquivo | Como tirar |
|---|---|
| `toast-erro.jpg` | Abra uma foto de B. F12 → **Network** → throttling **Offline**. Clique no coração. Ele muda, **volta ao que era** e aparece o **toast vermelho** no canto inferior direito. Tire o print com o coração já revertido e o toast na tela. Volte para **No throttling**. |
| `toast-sucesso.jpg` | Menu do avatar → **Minhas Fotos** → **Excluir** numa foto de teste (publique uma antes, se precisar) → **Excluir foto**. Tire o print com o **toast verde** "... foi excluída." |
| `toast-modal.jpg` | Em **Minhas Fotos**, clique em **Excluir** para abrir o modal. Com o modal aberto, mude para **Offline** e clique em **Excluir foto**. Tire o print com o **toast vermelho na frente do modal escurecido** (o modal continua aberto). Volte para **No throttling** e cancele. |
| `uma-requisicao.jpg` | Numa foto de B, Network → filtro **Fetch/XHR** → throttling **Slow 4G**. Limpe a lista (🚫) e clique **três vezes bem rápido** no coração. Tire o print com **uma só** linha `toggle-like` na lista. Volte para **No throttling**. |
| `formulario-sem-toast.jpg` | Saia da conta. No **Login**, digite o e-mail de A com uma **senha errada** e envie. Tire o print com a mensagem de erro **dentro do formulário** e **nenhum toast** no canto. |

## 4. Teste de regressão completo (sem print; marca o checklist)

Do zero, com uma **conta nova** (sem o Console mostrar erro vermelho, exceto nos passos com Offline):

1. Início (badge "online") → **Cadastrar** com campos vazios → erros nos campos, sem requisição.
2. Cadastro com senha curta → erro no campo. Cadastro válido → vai ao Login.
3. Login com senha errada → erro no formulário, **sem toast**. Login certo → volta à tela inicial.
4. **Publicar** uma foto (barra de progresso) → link para Minhas Fotos.
5. **Feed** → a foto aparece; "Carregar mais" (se houver mais de 12 fotos).
6. Abrir a foto → Detalhe com a imagem; F5 → as visualizações sobem.
7. **Curtir** → muda na hora; **Offline** + curtir → volta e **toast vermelho**.
8. **Comentar** vazio → erro no campo; comentário válido → entra no topo; **Offline** + comentar → **toast** e o texto continua no campo.
9. Clicar no autor de uma foto de B → Perfil de B → **Seguir** → contador sobe; **Offline** + clicar → volta e **toast**.
10. "Seguidores"/"Seguindo" → listas com abas.
11. **Seguindo** (Navbar) → só fotos de quem você segue.
12. **Coração da Navbar** → Fotos Curtidas.
13. **Minhas Fotos** → Editar (salvar só o texto) → Excluir com **toast verde**; **Offline** ao excluir → **toast na frente do modal**.
14. **Editar Perfil** → trocar a bio e salvar → mensagem de sucesso no formulário.
15. Sair → a Navbar volta a mostrar Entrar/Cadastrar.

---

## 5. Finalizar a entrega

Com os 13 prints na pasta `atividade12`, rode no PowerShell, na raiz `PhotoSphere-WEB`:

```powershell
powershell -ExecutionPolicy Bypass -File .\E12\finalizar-entrega.ps1
```

O script confere os prints, marca os itens da Atividade 12 nos três checklists e gera em `E12/` os dois `.zip` da entrega. O zip do frontend já leva `01 - Docs/atividade12` com os prints, o `respostas.md`, o `checkpoint-02.md` e o `checklists.md`.

**O que enviar:** os dois `.zip` de `E12/`.
