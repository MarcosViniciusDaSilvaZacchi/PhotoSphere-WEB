# Checklists — PhotoSphere | Atividades 1 a 8

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 8 — PARTE A: Backend (Detalhe, Feed Paginado e optionalAuth)

- [X] `middlewares/optionalAuth.js` criado — tenta identificar quem está pedindo sem bloquear caso não haja token
- [X] `getPhotoDetails` e `getFeed` adicionados ao `photoService.js`
- [X] `GET /api/photos/:id` configurado com `optionalAuth`, devolvendo dados do autor e calculando `isOwner`
- [X] Incremento da contagem de visualizações (`viewsCount`) a cada acesso a `GET /api/photos/:id`
- [X] `GET /api/feed` protegido por `isAuthenticated`, devolvendo fotos recentes com paginação `page` / `limit` (fórmula `offset = (page - 1) * limit`)
- [X] Teste curl: Detalhe sem token → `200 OK`, `isOwner: false`, visualizações incrementadas
- [X] Teste curl: Detalhe com token do dono → `200 OK`, `isOwner: true`
- [X] Teste curl: Detalhe de ID inexistente → `404 Not Found`
- [X] Teste curl: Feed sem token → `401 Unauthorized`
- [X] Teste curl: Feed com token (`?page=1&limit=1`) → devolve 1 item
- [X] Teste curl: Feed com token (`?page=2&limit=1`) → devolve array vazio `[]`
- [*] *Itens de streaming (Range / 206) ignorados por pertencerem ao Grupo B (fotografia / imagem única)*

---

## ATIVIDADE 8 — PARTE B: Frontend (Feed e Detalhe com Dados Reais)

- [X] Função `getPhotoUrl` adicionada em `src/utils/media.js`
- [X] `PhotoCard.vue` criado em `src/components/` como componente de card reutilizável adaptado ao domínio de fotografias
- [X] Funções `getFeed(page, limit)` e `getPhotoById(id)` adicionadas em `src/services/photoService.js`
- [X] `FeedView.vue` atualizada exibindo fotos reais em grade com paginação via botão "Carregar mais"
- [X] `PhotoDetailView.vue` atualizada exibindo a fotografia em resolução real (Grupo B), sem player de vídeo
- [X] Guarda de estado `isOwner` recebido da API e preservado no componente de detalhe
- [X] Teste visual: Navegação por clique nos cards do feed para a tela de detalhe em SPA sem recarregar a página (zero refresh)
- [X] Teste de recarregamento (F5): confirmação de aumento na contagem de visualizações
- [X] Teste de ID inexistente (`/photo/999`): mensagem amigável sem quebrar a aplicação
