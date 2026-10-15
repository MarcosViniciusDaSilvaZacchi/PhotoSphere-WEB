# Checklists — PhotoSphere | Atividades 1 a 10

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 10 — PARTE A: Backend (Curtidas e Comentários)

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| Contador de curtidas no model | `likesCount` | `likesCount` |
| Contador de comentários no model | `commentsCount` | `commentsCount` |
| Chave estrangeira nas tabelas novas | `videoId` | `photoId` |

- [X] `COMMENT_MAX: 500` adicionado em `config/constants.js` e coluna `commentsCount` adicionada ao model `Photo` (`likesCount` já existia)
- [X] Models `Like` (`modules/like/likeModel.js`) e `Comment` (`modules/comment/commentModel.js`) criados, com o índice único composto `idx_unique_like_user_photo (user_id, photo_id)` no `Like`
- [X] Associações nos dois sentidos em `config/associations.js` (`User`/`Photo` `hasMany` → `Like`/`Comment` `belongsTo`)
- [X] Tabelas `likes` e `comments` e coluna `comments_count` conferidas no banco
- [X] Módulo `like` completo (3 rotas: `toggle-like`, `like-status`, `liked-photos`) e registrado no `server.js`
- [X] Módulo `comment` completo (2 rotas, validador com `trim()` primeiro) e registrado no `server.js`
- [X] Todas as escritas duplas (linha + contador) dentro de `sequelize.transaction`, com `{ transaction: t }` em todos os comandos
- [X] Ordem dos parâmetros conferida entre controller e service: `(userId, photoId)` e `(userId, photoId, content)`
- [X] Comentário criado devolvido já com o autor (`include` do `author`)
- [X] Detalhe devolvendo `isLiked` (e os contadores `likesCount` / `commentsCount`)
- [X] Exclusão da foto em transação, apagando curtidas e comentários; arquivo removido só depois do commit
- [X] Contadores de curtidas e comentários no perfil público
- [X] `trim()` movido para o início nos campos obrigatórios (`username`, `email`, `fullName` no cadastro e `email` no login)
- [X] Script `scripts/testeTrim.js` criado para enviar campos só com espaços (o `curl -F` apara sozinho)
- [X] Teste curl: curtir sem token → `401`; foto inexistente → `404`
- [X] Teste curl: B curte → `201`, `liked: true`, `1`; B de novo → `200`, `liked: false`, `0`; de novo → `201`, `1`; A curte → `2`
- [X] Teste curl: `like-status` e `isLiked` no detalhe — visitante `false`; B `true`
- [X] Teste no banco: inserção manual de curtida repetida recusada (`Duplicate entry ... for key 'idx_unique_like_user_photo'`)
- [X] Teste curl: `liked-photos` com B → fotos com autor; sem token → `401`
- [X] Teste curl: comentar sem token `401`; só espaços `400`; 501 caracteres `400`; foto inexistente `404`; sucesso `201` com texto aparado e autor
- [X] Teste curl: listar comentários sem token → `200`, mais novos primeiro; `commentsCount` no detalhe igual ao número de itens
- [X] Teste: excluir foto com curtidas e comentários → `200`; nenhuma linha restante em `likes` / `comments`; arquivo removido; `photosCount` decrementado
- [X] Teste (`node scripts/testeTrim.js`): título e nome só com espaços → `400`
- [X] Regressão: upload, detalhe, feed, edição e perfil como antes

---

## ATIVIDADE 10 — PARTE B: Frontend (Curtir Otimista, Comentários e Fotos Curtidas)

- [X] Dois services criados: `src/services/likeService.js` e `src/services/commentService.js`
- [X] Formatador `src/utils/format.js` criado (`formatCount`, `pluralize`, `formatRelativeTime`, `formatDateTime`)
- [X] CSS criado em `src/assets/interactions.css` (importado no `main.js`)
- [X] `LikeButton.vue` com atualização otimista, rollback e `isBusy`
- [X] Visitante é levado ao login (`?redirect=`) e volta ao detalhe depois de entrar
- [X] `CommentSection.vue` com lista em carregando/erro/vazio e formulário validado (vazio, só espaços, > 500)
- [X] Comentário novo entra no topo, sem recarregar a lista
- [X] Texto escapado com `{{ }}` (nunca `v-html`) e quebras de linha preservadas (`white-space: pre-wrap`)
- [X] Detalhe com curtir + comentários
- [X] Contadores de curtidas e comentários no `PhotoCard` (Feed, Perfil, Minhas Fotos e Curtidas)
- [X] Tela `LikedPhotosView.vue` com rota `/liked`, acessível com um clique pelo coração da Navbar (e também pelo menu do avatar)
- [X] Teste: visitante vê o botão e a lista, sem formulário; curtir leva ao login e volta ao detalhe
- [X] Teste: logado, o coração muda na hora; F5 mantém; descurtir desfaz
- [X] Teste: Slow 4G → o coração muda imediatamente; Offline → muda, volta atrás e a mensagem de erro aparece
- [X] Teste: vazio, só espaços e > 500 caracteres geram erro sem chamar a API; comentário de duas linhas aparece no topo com as linhas preservadas e o contador sobe
- [X] Teste: `<b>teste</b> <img src=x onerror="alert(1)">` aparece como texto, sem negrito e sem alerta
- [X] Teste: contadores atualizados nos cards do Feed, do Perfil e de Minhas Fotos
- [X] Teste: tela de curtidas pela Navbar; descurtir no detalhe tira a foto da lista
- [X] Teste: A exclui uma foto com curtidas e comentários → funciona e a foto some das curtidas de B
- [X] Regressão: Feed, Perfil, Minhas Fotos (editar/excluir), Upload, Login/Logout
