# PhotoSphere — guia para o Claude (Programação Web, entregas E11 a E15)

Projeto do Marcos (aluno) na disciplina Programação Web: **PhotoSphere**, plataforma de fotos (API Express + Sequelize/MySQL em `photosphere-api/`; front Vue 3 + Pinia + Vite em `photosphere-frontend/`). Os enunciados de todas as aulas estão em `ArquivosTemporarios/Atividade - Aula NN.md`.

## Situação (preparado em 19/11/2026, em outro computador)

- **O código das entregas E11, E12, E13, E14 e E15 está pronto**, um commit por entrega, cada um marcado com uma tag: `entrega-e11` … `entrega-e15`. `main` = E15.
- **Já estão prontos em cada `E{N}/`:** `respostas.md`, `checklists.md` (o que é código já marcado), `COMO-TIRAR-PRINTS.md` (o roteiro completo) e `finalizar-entrega.ps1`. A E12 também tem `checkpoint-02.md`. Tudo espelhado em `photosphere-frontend/01 - Docs/atividadeNN/`.
- **Falta (é o trabalho de casa):** para cada entrega, rodar o projeto com o MySQL de verdade, executar os testes, **tirar os prints** e rodar o script de finalização, que confere os prints, marca os checklists de teste e gera os dois `.zip`.
- O que já foi verificado no outro PC, sem MySQL (com um SQLite em memória): todos os testes de API dos enunciados, por `curl`/fetch (E11: 29, E12: 18, E13: 50, E14: 42, E15: 63), os testes de controle, o build do front e um passeio no navegador por todas as telas de cada tag, **sem nenhum erro no Console**.

## O Marcos tira os prints; você o guia

- Ele salva os `.jpg` em `photosphere-frontend/01 - Docs/atividadeNN/` com os nomes exatos do `COMO-TIRAR-PRINTS.md`. Você não tira prints. Quando ele avisar, abra as imagens (Read) e confira se mostram o que o enunciado pede.
- Você pode fazer por ele: trocar de tag, subir e derrubar a API e o front, preparar as variáveis do PowerShell, comentar e descomentar o código dos testes de controle, rodar o `setAdmin.js` e o script de finalização.

## Ambiente (PC de casa)

- MySQL 8.0 nativo, serviço **MySQL80**, cliente **MySQL Workbench**, banco **`photosphere_db`**, usuário `root`. **Não usar Docker.**
- `photosphere-api/.env` (fora do Git): `PORT=3000`, `FRONTEND_URL=http://localhost:5173`, `DB_HOST=localhost`, `DB_PORT=3306`, `DB_NAME=photosphere_db`, `DB_USER=root`, `DB_PASSWORD=<senha do root>`, `JWT_SECRET=<frase>`, `JWT_EXPIRES_IN=7d`.
- `npm install` nas duas pastas, se faltar `node_modules`. Nenhuma entrega de E11 a E15 trouxe pacote novo.
- API: `cd photosphere-api` e `node server.js` (o `sync({ alter: true })` cria e ajusta as tabelas). Front: `cd photosphere-frontend` e `npm run dev` (http://localhost:5173).
- As tabelas só podem andar **para a frente** (E11 → E15): o `alter` de uma tag antiga removeria colunas criadas por uma tag nova.

## Fluxo de casa, uma entrega por vez (sem merge)

```powershell
git pull; git fetch --tags
git checkout entrega-e11          # código da E11 (HEAD destacado, é normal)
# ...seguir E11/COMO-TIRAR-PRINTS.md, tirar os prints, depois:
powershell -ExecutionPolicy Bypass -File .\E11\finalizar-entrega.ps1
# → E11/MarcosViniciusDaSilvaZacchi-PhotoSphere-backend.zip e -frontend.zip (para enviar)

git checkout -- .                 # descarta só as marcações de checklist (a próxima tag já as traz)
git checkout entrega-e12          # os prints e os zips continuam na pasta (são arquivos fora do Git)
# ...E12, E13, E14...
git checkout main                 # a E15 é o próprio main
# ...E15 e o script dela...
```

Por que funciona:
- Os prints (`01 - Docs/atividadeNN/*.jpg`) e os zips não estão no Git. Trocar de tag não mexe neles, e o zip de cada entrega leva os prints de todas as anteriores.
- Cada tag já traz marcados os checklists das entregas anteriores. O `git checkout -- .` só desfaz as marcações que o script acabou de fazer, e a tag seguinte já as contém.
- **Pare a API antes de trocar de tag** e suba de novo depois (o `sync` cria as tabelas novas).
- **Antes de trocar da E11 para a E12:** tire o `paginacao-antes.jpg` da E12, que precisa do código da E11 (está no passo 0 de `E12/COMO-TIRAR-PRINTS.md`).

No fim (no `main`, com a E15 finalizada): `git add -A`, depois `git commit -m "Prints, checklists e zips das entregas E11 a E15"`, depois `git push` (confirme com o Marcos antes do push). Não commitar `photosphere-api/.env` (ele está no `.gitignore`). A pasta `.vscode/` da raiz é dele e não entra no commit.

Se algum teste falhar e precisar de correção de código numa entrega antiga: corrija, gere os zips daquela entrega com a correção, e aplique a mesma correção nas tags seguintes (ou ao menos no `main`), avisando o Marcos.

## Mapa Shortz-App (roteiro) → PhotoSphere

| Roteiro | PhotoSphere |
|---|---|
| `app.js` | `photosphere-api/server.js` |
| vídeo / `Video` / `videoId` | foto / `Photo` / `photoId`; contador do usuário `photosCount` |
| `TheSidebar.vue`, `TheNavbar.vue` | não há sidebar: tudo na `AppNavbar.vue` (links centrais Início/Explorar/Feed/Seguindo, busca, sino, coração, menu do avatar com Meus Álbuns e Painel de administração) |
| playlist / `PlaylistVideo` / `hasVideo` | álbum / `AlbumPhoto` (`album_photos`) / `hasPhoto`; telas `AlbumsView`, `AlbumDetailView` |
| `MyPlaylistsView` | `AlbumsView` (rota `albums`) |
| `ReportVideoModal`, `AdminVideosView` | `ReportPhotoModal`, `AdminPhotosView` (`admin-photos`); denúncias em `AdminModerationView` (`admin-moderation`) |
| `shortz_token` / `shortz_user` | `token` / `user` no `localStorage` |
| busca `{ query, videos, users }` | `{ query, fotos, users }` (o nome `fotos` vem da Aula 02) |
| virar admin | `node scripts/setAdmin.js <username>` (e `... off`), dentro de `photosphere-api` |

## Pontos de atenção

- **E12 `checkpoint-02.md`:** o enunciado manda responder "as perguntas do Bloco 2 do roteiro de API", e o roteiro não estava disponível. A leitura foi organizada em 2.1–2.6 pelos temas do enunciado (camadas, números soltos/paginação, transações, validação, ids inválidos, segurança). Se o Marcos tiver o roteiro, ajuste às perguntas reais.
- **Respostas que descrevem experimentos:** E13 pergunta 3 e E14 pergunta 6 vêm dos testes de controle rodados no SQLite (com o resultado esperado também no MySQL). E15 perguntas 8, 9 e 10 descrevem os experimentos da aula (8 confirmado no SQLite). Depois que ele fizer os testes em casa, confira se o que viu bate com o texto e ajuste se preciso.
- Nomes de print no E10: o enunciado da Aula 10 pede `curtidos.jpg`; o roteiro antigo do E10 dizia `curtidas.jpg` (entrega já enviada, só para registro).
- Armadilha do ambiente: o heredoc do Bash come barras invertidas (`\\` → `\`). Escreva arquivos com regex ou caminhos pelo Write. Isso já quebrou o `escapeLike` uma vez (corrigido na E13).
- `git worktree` com junção de `node_modules` + `git worktree remove --force` apaga o `node_modules` real. Desfaça a junção (`cmd /c rmdir`) antes de remover.
