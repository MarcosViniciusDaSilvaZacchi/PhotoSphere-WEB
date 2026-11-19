# Prints — Atividade 13

Salvar tudo em `.jpg` em `photosphere-frontend/01 - Docs/atividade13/` (crie a pasta se ainda não existir), **com os nomes exatos da lista**.

**Ordem do trabalho em casa:** 0. trocar para o código da E13 → 1. curl → 2. banco → 3. teste de controle → 4. telas → 5. teste completo → 6. finalizar (script). O código e os documentos (`respostas.md`, `checklists.md`) já estão prontos.

## 0. Preparar

1. Troque o código para a tag `entrega-e13` (o Claude de casa faz isso) e suba a API e o front de novo.
2. Na primeira subida, o `sync` cria as tabelas **`albums`** e **`album_photos`**. Confira se o terminal da API mostra `✅ Banco de dados sincronizado!`.
3. Contas: **A** e **B** (as de sempre). B precisa ter pelo menos uma foto; A pode ter as dela.

---

## 1. curl (PowerShell)

```powershell
$U = "http://localhost:3000/api"
$W = '  [HTTP %{http_code}]\n'
$A = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_A","password":"SENHA_A"}').data.token
$B = (Invoke-RestMethod -Method Post -Uri $U/login -ContentType 'application/json' -Body '{"email":"EMAIL_B","password":"SENHA_B"}').data.token
$FB = (Invoke-RestMethod -Uri $U/my-photos -Headers @{ Authorization = "Bearer $B" }).data[0].id
$J = "Content-Type: application/json"
function Save-Json($name, $text) { $text | Set-Content -Encoding ascii $name }
Save-Json c-ab.json       '{"title":"ab"}'
Save-Json c-espacos.json  '{"title":"     "}'
Save-Json c-sim.json      '{"title":"Viagens","isPublic":"sim"}'
Save-Json c-privada.json  '{"title":"   Viagens   "}'
Save-Json c-publica.json  '{"title":"Favoritas","isPublic":true}'
Save-Json c-b.json        '{"title":"Album da B"}'
Save-Json p-foto.json     ('{"photoId":' + $FB + '}')
Save-Json p-99999.json    '{"photoId":99999}'
Save-Json p-vazio.json    '{}'
Save-Json p-abc.json      '{"photoId":"abc"}'
```

**`curl-01-criar.jpg`**: esperado `401`, `400`, `400`, `400`, `201` (privado, título sem espaços), `201` (público)

```powershell
curl.exe -s -w $W -X POST -H $J --data-binary "@c-ab.json" $U/albums
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@c-ab.json" $U/albums
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@c-espacos.json" $U/albums
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@c-sim.json" $U/albums
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@c-privada.json" $U/albums
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@c-publica.json" $U/albums
curl.exe -s -w $W -X POST -H "Authorization: Bearer $B" -H $J --data-binary "@c-b.json" $U/albums
```

Anote os ids que voltaram e guarde nas variáveis:

```powershell
$PRIV = <id do "Viagens">; $PUB = <id do "Favoritas">; $ALB = <id do "Album da B">
```

**`curl-02-listar.jpg`**: só os álbuns de A, o mais novo primeiro ("Favoritas" antes de "Viagens", criados em sequência)

```powershell
(curl.exe -s -H "Authorization: Bearer $A" $U/my-albums | ConvertFrom-Json).data | Select-Object id, title, isPublic, photosCount, createdAt
```

**`curl-03-adicionar.jpg`**: esperado `201`/1, `200`/1, `404`, `400`, `400`, `403`, `404`, `400`

```powershell
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-foto.json" $U/albums/$PUB/photos
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-foto.json" $U/albums/$PUB/photos
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-99999.json" $U/albums/$PUB/photos
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-vazio.json" $U/albums/$PUB/photos
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-abc.json" $U/albums/$PUB/photos
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-foto.json" $U/albums/$ALB/photos
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-foto.json" $U/albums/99999/photos
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-foto.json" $U/albums/abc/photos
```

**`curl-04-remover.jpg`**: esperado `200` (contador 1 → 0), repetir `404`, de outra pessoa `403`. Depois, adiciona a foto de novo para os próximos testes.

```powershell
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $A" $U/albums/$PUB/photos/$FB
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $A" $U/albums/$PUB/photos/$FB
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $A" $U/albums/$ALB/photos/$FB
curl.exe -s -w $W -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-foto.json" $U/albums/$PUB/photos
```

**`curl-05-ler.jpg`**: público para visitante `200` (`isOwner:false`, sem `password`); privado `403` para visitante e para B; privado da dona `200` (`isOwner:true`); `404`; `400`

```powershell
curl.exe -s -w $W $U/albums/$PUB
curl.exe -s -w $W $U/albums/$PRIV
curl.exe -s -w $W -H "Authorization: Bearer $B" $U/albums/$PRIV
curl.exe -s -w $W -H "Authorization: Bearer $A" $U/albums/$PRIV
curl.exe -s -w $W $U/albums/99999
curl.exe -s -w $W $U/albums/abc
```

**`curl-06-status.jpg`**: `401`; para A, "Favoritas" com `hasPhoto: true` e "Viagens" com `false`; foto inexistente `404`; B vê só o álbum dela

```powershell
curl.exe -s -w $W $U/photos/$FB/albums-status
(curl.exe -s -H "Authorization: Bearer $A" $U/photos/$FB/albums-status | ConvertFrom-Json).data | Select-Object id, title, isPublic, photosCount, hasPhoto
curl.exe -s -w $W -H "Authorization: Bearer $A" $U/photos/99999/albums-status
(curl.exe -s -H "Authorization: Bearer $B" $U/photos/$FB/albums-status | ConvertFrom-Json).data | Select-Object id, title, hasPhoto
```

**`curl-07-excluir-album.jpg`**: um álbum temporário com a foto: B tenta excluir `403`; A exclui `200`; depois `404`; a foto continua existindo (`200`)

```powershell
Save-Json c-tmp.json '{"title":"Temporario"}'
$TMP = (curl.exe -s -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@c-tmp.json" $U/albums | ConvertFrom-Json).data.id
curl.exe -s -o NUL -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-foto.json" $U/albums/$TMP/photos
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $B" $U/albums/$TMP
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $A" $U/albums/$TMP
curl.exe -s -w $W -H "Authorization: Bearer $A" $U/albums/$TMP
curl.exe -s -o NUL -w "foto ainda existe: %{http_code}\n" $U/photos/$FB
```

**`curl-08-excluir-foto.jpg`**: B publica uma foto nova, que entra num álbum de A e num de B; B exclui a foto; os dois contadores voltam a 0. Troque o caminho por uma imagem do seu PC.

```powershell
$NOVA = (curl.exe -s -H "Authorization: Bearer $B" -F "title=Foto para excluir" -F "image=@C:\caminho\para\uma-foto.jpg" $U/photos | ConvertFrom-Json).data.id
Save-Json p-nova.json ('{"photoId":' + $NOVA + '}')
Save-Json c-a2.json '{"title":"Album de teste A"}'
$A2 = (curl.exe -s -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@c-a2.json" $U/albums | ConvertFrom-Json).data.id
curl.exe -s -o NUL -X POST -H "Authorization: Bearer $A" -H $J --data-binary "@p-nova.json" $U/albums/$A2/photos
curl.exe -s -o NUL -X POST -H "Authorization: Bearer $B" -H $J --data-binary "@p-nova.json" $U/albums/$ALB/photos
"antes: A2=" + (curl.exe -s -H "Authorization: Bearer $A" $U/albums/$A2 | ConvertFrom-Json).data.photosCount + "  ALB=" + (curl.exe -s -H "Authorization: Bearer $B" $U/albums/$ALB | ConvertFrom-Json).data.photosCount
curl.exe -s -w $W -X DELETE -H "Authorization: Bearer $B" $U/photos/$NOVA
"depois: A2=" + (curl.exe -s -H "Authorization: Bearer $A" $U/albums/$A2 | ConvertFrom-Json).data.photosCount + "  ALB=" + (curl.exe -s -H "Authorization: Bearer $B" $U/albums/$ALB | ConvertFrom-Json).data.photosCount
```

**`curl-09-busca.jpg`**: vazios: sem `q`, vazio, espaços, 1 letra; achados: um trecho do título de uma foto (em MAIÚSCULAS) e do username de B; `?q=ab&q=cd` e `?q[x]=1` sem `500`; `%%` e `__` vazios. Troque `TRECHO_DO_TITULO` e `TRECHO_DO_USERNAME`.

```powershell
foreach ($q in @('', '?q=', '?q=%20%20%20', '?q=a', '?q=inexistentexyz', '?q=ab&q=cd', '?q[x]=1', '?q=%25%25', '?q=__')) {
  $r = curl.exe -s -g "$U/search$q" | ConvertFrom-Json
  "{0,-22} fotos={1} users={2}" -f $q, $r.data.fotos.Count, $r.data.users.Count
}
(curl.exe -s "$U/search?q=TRECHO_DO_TITULO" | ConvertFrom-Json).data.fotos | Select-Object id, title, @{ n = 'autor'; e = { $_.author.username } }
(curl.exe -s "$U/search?q=TRECHO_DO_USERNAME" | ConvertFrom-Json).data.users
```

**`curl-11-regressao.jpg`**: todos `200`/`201`, e `GET /users/abc/followers` → `400`

```powershell
$IDB = (Invoke-RestMethod -Uri $U/profile/me -Headers @{ Authorization = "Bearer $B" }).data.id
curl.exe -s -o NUL -w "GET /feed                    %{http_code}\n" -H "Authorization: Bearer $A" $U/feed
curl.exe -s -o NUL -w "GET /photos/$FB              %{http_code}\n" $U/photos/$FB
curl.exe -s -o NUL -w "GET /following-photos        %{http_code}\n" -H "Authorization: Bearer $A" $U/following-photos
curl.exe -s -o NUL -w "POST toggle-like             %{http_code}\n" -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
curl.exe -s -o NUL -w "POST toggle-like (desfaz)    %{http_code}\n" -X POST -H "Authorization: Bearer $A" $U/photos/$FB/toggle-like
curl.exe -s -o NUL -w "GET comments                 %{http_code}\n" $U/photos/$FB/comments
curl.exe -s -o NUL -w "GET /users/$IDB/followers    %{http_code}\n" $U/users/$IDB/followers
curl.exe -s -o NUL -w "GET /users/abc/followers     %{http_code}\n" $U/users/abc/followers
```

---

## 2. Banco: `colecoes-banco.jpg` (Workbench)

```sql
SHOW INDEX FROM albums;
SHOW INDEX FROM album_photos;
SHOW CREATE TABLE album_photos;
SELECT * FROM album_photos;
INSERT INTO album_photos (album_id, photo_id, created_at, updated_at) VALUES (<PUB>, <FB>, NOW(), NOW());
```

Troque `<PUB>` e `<FB>` pelos números das variáveis. No print, devem aparecer as duas tabelas, os índices (`idx_unique_album_photo`, `idx_album_photos_photo_id`, `idx_albums_user_id`), o `ON DELETE CASCADE` das duas chaves no `SHOW CREATE TABLE` e o erro `Duplicate entry '...' for key 'idx_unique_album_photo'`. Se não couber, use mais de um print e junte numa imagem só, ou envie `colecoes-banco-a.jpg` e `colecoes-banco-b.jpg`.

---

## 3. Teste de controle: `contador-controle.jpg` e `contador-certo.jpg`

1. Em `photosphere-api/modules/photo/photoService.js`, na função `deletePhoto`, **comente** o bloco que começa em `// Aula 13: álbuns que contêm esta foto` e vai até `await AlbumPhoto.destroy({ where: { photoId: photo.id }, transaction: t });`. O Claude de casa pode fazer isso.
2. Reinicie a API. Pelo site, como A: publique duas fotos de teste e salve as duas num álbum novo, "Controle" (botão **Salvar** no Detalhe de cada foto).
3. Em **Minhas Fotos**, exclua uma das duas.
4. Rode e tire o print **`contador-controle.jpg`**, que deve mostrar o álbum "Controle" com `photosCount: 2` e só **1** foto:

   ```powershell
   (curl.exe -s -H "Authorization: Bearer $A" $U/my-albums | ConvertFrom-Json).data | Select-Object id, title, photosCount
   $CTRL = <id do álbum Controle>
   (curl.exe -s -H "Authorization: Bearer $A" $U/albums/$CTRL | ConvertFrom-Json).data.photos.Count
   ```

5. **Descomente** o bloco, reinicie a API e repita os passos 2 a 4 com um álbum "Controle 2". O print **`contador-certo.jpg`** deve mostrar `photosCount: 1` e 1 foto.
6. Apague no site os álbuns e fotos de teste.

---

## 4. Telas (navegador, `http://localhost:5173`)

Entre como **A**.

| Arquivo | Como tirar |
|---|---|
| `colecao-privada.jpg` | Menu do avatar → **Meus Álbuns** → **Novo álbum**. Digite um título de **2 letras** e clique em **Criar álbum**: aparece o erro no campo, sem toast. Tire o print com o modal (erro visível) e, ao fundo, um cartão com o selo **"Privada"** (crie um álbum privado antes, se não houver). |
| `salvar-modal.jpg` | Abra uma foto de B → **Salvar**. Tire o print do modal com caixas **marcadas e desmarcadas** e o **cadeado** nos álbuns privados. |
| `otimista-modal.jpg` | Com o modal aberto: F12 → **Network** → **Slow 4G**. Marque uma caixa e tire o print com a caixa **já marcada** e a requisição `photos` (POST para `/albums/.../photos`) ainda **(pending)**. |
| `rollback-modal.jpg` | Mude para **Offline** e desmarque/marque uma caixa. Ela **volta ao estado anterior** e aparece o **toast vermelho**. Tire o print. Volte para **No throttling**. |
| `detalhe-colecao.jpg` | Em Meus Álbuns, clique no cartão de um álbum com fotos: o detalhe com título, selo, dona e os botões **"Remover do álbum"**. |
| `colecao-privada-visitante.jpg` | Copie o link de um álbum **privado** (barra de endereço) e abra numa **janela anônima**: tela "Este álbum é privado", sem toast. |
| `debounce.jpg` | Clique em **Explorar**. F12 → Network → filtro **Fetch/XHR** → limpe a lista. Digite uma palavra inteira **sem pausa** (ex.: "montanha"). Tire o print com **uma só** requisição `search?q=...`. |
| `busca.jpg` | Busque um termo que encontre **fotos e pessoas** (ex.: parte de um nome que também apareça num título). Print com as duas seções. |
| `navbar-busca.jpg` | Tire o print da Navbar com a **barra de busca** e o **menu do avatar aberto** mostrando "Meus Álbuns". |

## 5. Teste prático completo (sem print; marca o checklist)

1. **Álbuns:** avatar → Meus Álbuns; título curto → erro sem toast e sem requisição; criar sem "Pública" → selo "Privada"; criar um público; Offline ao criar → erro dentro do modal, sem toast; excluir com Offline → toast vermelho e modal aberto; excluir de verdade → toast verde.
2. **Salvar:** como visitante, clicar em Salvar → login → volta à foto; modal com álbuns, cadeados e contadores; marcar com Slow 4G → muda na hora; F5 e reabrir → continua marcada; Offline ao desmarcar → volta e toast; dois cliques rápidos na mesma caixa → uma requisição; conta sem álbuns → convite para criar.
3. **Detalhe do álbum:** abrir pelo cartão; remover (o card some depois da API; Offline → fica e toast); estado vazio; link do público em janela anônima → abre sem botões de remover; link do privado → "privado"; `/albums/99999` → "não encontrado".
4. **Busca:** "Explorar" (o campo com foco); barra da Navbar + Enter; uma requisição por palavra sem pausa; 1 letra → nenhuma requisição e a dica; maiúsculas/minúsculas; termo inexistente; `%%` → "Nada encontrado"; F5 mantém o termo; Voltar sai da busca.
5. **Exclusão com álbum:** excluir uma foto que está num álbum → o contador do álbum cai.
6. **Regressão:** curtir e seguir (Offline → volta + toast; visitante → login → volta), Login/Logout, Perfil, Feed, Seguindo, Curtidas, Minhas Fotos, comentários.

---

## 6. Finalizar a entrega

Com os prints na pasta `atividade13`, rode na raiz `PhotoSphere-WEB`:

```powershell
powershell -ExecutionPolicy Bypass -File .\E13\finalizar-entrega.ps1
```

O script confere os prints, marca os itens da Atividade 13 nos três checklists e gera em `E13/` os dois `.zip`. **Envie os dois `.zip`.**
