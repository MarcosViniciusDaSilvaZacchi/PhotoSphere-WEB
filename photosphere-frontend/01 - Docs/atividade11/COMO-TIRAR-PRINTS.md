# Prints — Atividade 11

Salvar tudo em `.jpg` em `photosphere-frontend/01 - Docs/atividade11/`, **com os nomes exatos da lista**.

**Ordem do trabalho em casa:** 0. preparar → 1. curl → 2. banco → 3. telas → 4. finalizar (script). O código e os documentos (`respostas.md`, `checklists.md`) já estão prontos. Falta só executar, tirar os prints e rodar o script do passo 4.

## 0. Preparar (no PC de casa, com o MySQL80 e o Workbench)

1. **Trazer o código novo para o PC de casa:** `git pull` na pasta do projeto (ou copie a pasta inteira).
2. **MySQL ligado:** o serviço **MySQL80** liga sozinho com o Windows. Para conferir, abra o Workbench e entre em **Local instance MySQL80**. O banco `photosphere_db` deve aparecer na lista **SCHEMAS**.
3. **`photosphere-api/.env`:** se o seu PC de casa já rodava a API nas aulas anteriores, o `.env` já está lá e o `git pull` não mexe nele. Se não estiver, crie com este conteúdo, usando a sua senha do root:

   ```env
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=photosphere_db
   DB_USER=root
   DB_PASSWORD=SUA_SENHA_DO_ROOT
   JWT_SECRET=qualquer_frase_longa_e_secreta
   JWT_EXPIRES_IN=7d
   ```

4. **Dependências:** se as pastas `node_modules` não existirem, rode `npm install` em `photosphere-api` e em `photosphere-frontend`. A E11 não trouxe pacote novo.
5. **Terminal 1:** `cd photosphere-api` e depois `node server.js`. O `sync` cria a tabela `follows` sozinho, e o terminal deve mostrar `✅ Banco de dados sincronizado!`.
6. **Terminal 2:** `cd photosphere-frontend` e depois `npm run dev`. O site abre em `http://localhost:5173`.
7. **Contas:** **A** e **B** são as das atividades anteriores; **C** e **D** são criadas pelos comandos da seção 1. **B deve ter exatamente 1 foto**, para o teste `?page=2&limit=1` dar `[]`. Se B tiver mais, exclua as outras em "Minhas Fotos" ou crie uma conta nova para fazer o papel de B.

> Se algo der errado no meio dos testes e você quiser recomeçar o "seguir" do zero, rode no Workbench:
> `DELETE FROM follows; UPDATE users SET followers_count = 0, following_count = 0;`

---

## 1. curl (PowerShell, terminal 3)

Prepare as variáveis uma vez (troque os `USERNAME_*`, `EMAIL_*` e `SENHA_*`):

```powershell
$U = "http://localhost:3000/api"
$W = '  [HTTP %{http_code}]\n'

# Contas C e D (só se ainda não existirem)
Invoke-RestMethod -Method Post -Uri $U/register -ContentType 'application/json' -Body '{"username":"contac","email":"contac@teste.com","password":"123456","confirmPassword":"123456","fullName":"Conta C"}'
Invoke-RestMethod -Method Post -Uri $U/register -ContentType 'application/json' -Body '{"username":"contad","email":"contad@teste.com","password":"123456","confirmPassword":"123456","fullName":"Conta D"}'

$A = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_A","password":"SENHA_A"}').data.token
$B = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_B","password":"SENHA_B"}').data.token
$C = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"contac@teste.com","password":"123456"}').data.token
$D = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"contad@teste.com","password":"123456"}').data.token

$IDA = (Invoke-RestMethod -Uri $U/profile/me -Headers @{ Authorization = "Bearer $A" }).data.id
$IDB = (Invoke-RestMethod -Uri $U/profile/me -Headers @{ Authorization = "Bearer $B" }).data.id
$UA = "USERNAME_A"; $UB = "USERNAME_B"; $UC = "contac"
"A=$IDA  B=$IDB"
```

Em cada print, deixe os comandos e as respostas visíveis. Se não couber numa tela, divida em `-a.jpg` e `-b.jpg`.

**`curl-1-erros.jpg`**: esperado `401`, `400` (abc), `400` (a si mesmo), `404`

```powershell
curl.exe -s -w $W -X POST $U/users/$IDB/toggle-follow
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/abc/toggle-follow
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDA/toggle-follow
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/99999/toggle-follow
```

**`curl-2-toggle.jpg`**: esperado `201`/`1`, `200`/`0`, `201`/`1`, `201`/`2` (C segue B) e `201` (B segue A)

```powershell
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDB/toggle-follow
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDB/toggle-follow
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" $U/users/$IDB/toggle-follow
curl.exe -s -w $W -X POST -H "Authorization: Bearer $C" $U/users/$IDB/toggle-follow
curl.exe -s -w $W -X POST -H "Authorization: Bearer $B" $U/users/$IDA/toggle-follow
```

**`curl-3-contadores.jpg`**: esperado B = 2 e 1; A = 1 e 1; C = 0 e 1

```powershell
$UB, $UA, $UC | ForEach-Object { (curl.exe -s "$U/profile/$_" | ConvertFrom-Json).data } | Select-Object username, followersCount, followingCount | Format-Table
```

**`curl-4-status.jpg`**: esperado visitante `false`; A→B `true`; C→A `false`; B no próprio perfil `isOwner: true`, `isFollowing: false`

```powershell
(curl.exe -s $U/profile/$UB | ConvertFrom-Json).data | Select-Object username, isOwner, isFollowing
curl.exe -s -w $W -H "Authorization: Bearer $A" $U/users/$IDB/follow-status
(curl.exe -s -H "Authorization: Bearer $A" $U/profile/$UB | ConvertFrom-Json).data | Select-Object username, isOwner, isFollowing
curl.exe -s -w $W -H "Authorization: Bearer $C" $U/users/$IDA/follow-status
(curl.exe -s -H "Authorization: Bearer $C" $U/profile/$UA | ConvertFrom-Json).data | Select-Object username, isOwner, isFollowing
(curl.exe -s -H "Authorization: Bearer $B" $U/profile/$UB | ConvertFrom-Json).data | Select-Object username, isOwner, isFollowing
```

**`curl-5-listas.jpg`**: esperado: seguidores de B = C e depois A (sem `password`); A segue B; usuário inexistente `404`

```powershell
curl.exe -s -w $W $U/users/$IDB/followers
curl.exe -s -w $W $U/users/$IDA/following
curl.exe -s -w $W $U/users/99999/followers
```

**`curl-6-feed.jpg`**: esperado `401`; A vê só fotos de B; página 2 com limite 1 → `[]`; D (não segue ninguém) → `[]`

```powershell
curl.exe -s -w $W $U/following-photos
(curl.exe -s -H "Authorization: Bearer $A" $U/following-photos | ConvertFrom-Json).data | Select-Object id, title, @{ n = 'autor'; e = { $_.author.username } }
curl.exe -s -w $W -H "Authorization: Bearer $A" "$U/following-photos?page=2&limit=1"
curl.exe -s -w $W -H "Authorization: Bearer $D" $U/following-photos
```

**`curl-7-regressao.jpg`**: esperado: todos `200`/`201`

```powershell
$FB = (Invoke-RestMethod -Uri $U/my-photos -Headers @{ Authorization = "Bearer $B" }).data[0].id
curl.exe -s -o NUL -w "GET /feed                 %{http_code}\n" -H "Authorization: Bearer $A" $U/feed
curl.exe -s -o NUL -w "GET /photos/$FB           %{http_code}\n" $U/photos/$FB
curl.exe -s -o NUL -w "POST toggle-like (curtir)  %{http_code}\n" -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
curl.exe -s -o NUL -w "POST toggle-like (desfaz)  %{http_code}\n" -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
curl.exe -s -o NUL -w "GET comments              %{http_code}\n" $U/photos/$FB/comments
curl.exe -s -o NUL -w "GET /my-photos            %{http_code}\n" -H "Authorization: Bearer $B" $U/my-photos
curl.exe -s -o NUL -w "GET /profile/$UB          %{http_code}\n" $U/profile/$UB
```

(Upload, edição e exclusão ficam na regressão do navegador, passo 9 da Parte B.)

---

## 2. Banco: `follows.jpg`

No Workbench/HeidiSQL, rode as consultas abaixo e tire um print que mostre os dois índices e o erro. Troque `<IDA>` e `<IDB>` pelos números que o PowerShell mostrou.

```sql
SHOW INDEX FROM follows;
SELECT * FROM follows;
INSERT INTO follows (follower_id, following_id, created_at, updated_at) VALUES (<IDA>, <IDB>, NOW(), NOW());
```

Esperado: `idx_unique_follow_follower_following` (2 colunas, `Non_unique = 0`), `idx_follows_following_id` e o erro `Duplicate entry '<IDA>-<IDB>' for key 'idx_unique_follow_follower_following'`.

---

## 3. Telas (navegador, `http://localhost:5173`)

Entre como **A**. **C** e **D** servem para os testes de lista vazia.

| Arquivo | Como tirar |
| --- | --- |
| `seguindo.jpg` | No **Feed**, clique no nome de **B** num card para abrir o perfil dele. Se o botão estiver "Seguir", clique. Tire o print com o botão **"Seguindo"** e o número de **Seguidores** atualizado no cartão. Afaste o mouse do botão (com o mouse em cima ele mostra "Deixar de seguir"). |
| `otimista.jpg` | F12 → aba **Network** → throttling **Slow 4G** (se a resposta chegar rápido demais, use **3G**). Clique no botão e tire o print com o botão já trocado e a requisição `toggle-follow` ainda **(pending)** na lista. |
| `rollback.jpg` | Na mesma aba, troque o throttling para **Offline**. Clique no botão e tire o print com a mensagem vermelha embaixo dele (o botão e o contador voltam ao que eram). Depois volte para **No throttling**. |
| `seguidores.jpg` | No perfil de B, clique no número **"Seguidores"**. Tire o print da lista (C e A) com as abas **Seguidores / Seguindo**. |
| `feed-seguindo.jpg` | Clique em **"Seguindo"** na barra de navegação do topo. Tire o print com as fotos de B (só de quem A segue). |

---

## 4. Finalizar a entrega

Com os 13 prints salvos na pasta `atividade11`, rode no PowerShell, na pasta raiz `PhotoSphere-WEB`:

```powershell
powershell -ExecutionPolicy Bypass -File .\E11\finalizar-entrega.ps1
```

O script:

1. confere se os 13 prints estão na pasta e avisa quais faltam;
2. marca como feitos os itens da Atividade 11 nos três checklists (`E11/`, `01 - Docs/atividade11/` e o `checklists.md` geral);
3. gera em `E11/` os dois arquivos da entrega:
   - `MarcosViniciusDaSilvaZacchi-PhotoSphere-backend.zip` (sem `node_modules` e sem `.env`);
   - `MarcosViniciusDaSilvaZacchi-PhotoSphere-frontend.zip` (sem `node_modules`, já com a pasta `01 - Docs/atividade11` e os prints).

**O que enviar na tarefa:** os dois `.zip`. Os prints, o `respostas.md` e o `checklists.md` já vão dentro do zip do frontend, em `01 - Docs/atividade11/`, como o enunciado pede.

Se algum teste não sair como o esperado, anote qual foi e o que apareceu, e me mande. Eu ajusto o código antes de você enviar.

Por último, se quiser guardar no GitHub:

```powershell
git add -A
git commit -m "Implementacao da Aula 11 - Seguir, Seguidores/Seguindo e Feed Seguindo (Entrega E11)"
git push
```
