# Checklists — PhotoSphere | Atividades 1 a 9

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 9 — PARTE A: Backend (CRUD da Foto, Perfil Público e Arquivos Órfãos)

- [X] `reload()` adicionado ao `getPhotoDetails` — a resposta passa a trazer a mesma `viewsCount` gravada no banco
- [X] Duas chamadas seguidas a `GET /api/photos/:id` devolvem contagens consecutivas
- [X] Verificação `404` antes de `403` nas duas funções que verificam dono (helper `findOwnedPhotoOrFail` usado por edição e exclusão)
- [X] Ordem banco → disco respeitada: `photo.update()` / `photo.destroy()` primeiro, `fs.unlink` da imagem depois
- [X] Contador `photosCount` do usuário decrementado na exclusão
- [X] Quatro handlers no `photoController.js`: `getMyPhotos`, `getPhotoForEdit`, `updatePhoto` e `deletePhoto`
- [X] Quatro rotas em `photoRoutes.js`: `GET /my-photos`, `GET /photos/:id/edit`, `PUT /photos/:id` (`isAuthenticated` → `uploadPhoto.single('image')` → `updatePhotoValidator`) e `DELETE /photos/:id`
- [X] `include` + `order` no nível de cima em `getPublicProfile` (fotos da pessoa da mais nova para a mais antiga)
- [X] `isOwner` devolvido no perfil público
- [X] `/profile/:username` com `optionalAuth`, registrado depois de `/profile/me`
- [X] `errorHandler.js` atualizado para limpeza de arquivos órfãos (`req.file` / `req.files`) e ainda sendo o último `app.use` do `server.js`
- [X] `utils/fileStorage.js` criado centralizando a remoção segura de arquivos (`removeFile` / `removeUpload`)
- [X] Fallback de "banco offline" restrito a erros de conexão (`utils/dbFallback.js`), para não mascarar erros reais do Sequelize
- [X] Teste curl: `GET /my-photos` sem token → `401`; com A → lista, mais nova primeiro; com B → só as fotos de B (ou `[]`)
- [X] Teste curl: `GET /photos/:id/edit` sem token → `401`; com B → `403`; id inexistente → `404`; com A → `200` (sem alterar `viewsCount`)
- [X] Teste curl: `PUT` só com texto, com A → `200`, arquivo inalterado, contagem de arquivos igual
- [X] Teste curl: `PUT` com arquivo novo, com A → `200`, nome do arquivo mudou, contagem de arquivos igual (entrou um, saiu outro)
- [X] Teste curl (órfãos): `PUT` com arquivo feito por B → `403`; `PUT` com arquivo e título vazio feito por A → `400`; contagem de arquivos não subiu
- [X] Teste curl: `DELETE` com B → `403`; com A → `200`; `GET` do item → `404`; arquivo removido da pasta; `photosCount` caiu 1; repetir o `DELETE` → `404`
- [X] Teste curl: `GET /profile/:username` anônimo (`isOwner: false`, fotos ordenadas), com o token do dono (`isOwner: true`), com o token de B (`false`) e usuário inexistente (`404`)

---

## ATIVIDADE 9 — PARTE B: Frontend (Menu do Avatar, Modal, Meus Itens, Edição e Perfil Público)

- [X] Checagem de alcançabilidade: Feed, Detalhe, Upload e Meu Perfil acessíveis por cliques (link "Feed" adicionado à Navbar)
- [X] `src/composables/useClickOutside.js` criado (ouvinte `pointerdown` no `document`, removido no `onBeforeUnmount`)
- [X] `src/components/base/BaseModal.vue` criado (genérico, `v-model`, `<Teleport to="body">`, fecha com X / Esc / clique no fundo, modo `persistent`)
- [X] Funções `getMyPhotos()`, `getPhotoForEdit(id)`, `updatePhoto(id, formData)` e `deletePhoto(id)` criadas em `src/services/photoService.js`
- [X] `getPublicProfile(username)` em `src/services/userService.js`
- [X] `PhotoCard.vue` refatorado: sem `<a>` gigante, autor clicável e opcional (`showAuthor`) e slot `actions`
- [X] O Feed da Atividade 08 continua funcionando sem alteração na lógica
- [X] Menu do avatar abre pelo clique, alinhado à direita, e fecha ao clicar fora, em um item ou com Esc
- [X] Perfil Público (`views/profile/PublicProfileView.vue`) com os três botões corretos (dono → Editar Perfil / logado → Seguir / visitante → nenhum)
- [X] Minhas Fotos (`views/MyPhotosView.vue`) com modal fora do card, estado `busy` e remoção local da lista
- [X] Editar Foto (`views/EditPhotoView.vue`) com e sem arquivo novo, prévia imediata e validação no cliente
- [X] Autor clicável e botão "Editar" condicional (`isOwner`) no Detalhe
- [X] Link para Minhas Fotos na mensagem de sucesso do Upload (e o erro real da API agora é exibido no Upload)
- [X] Rotas novas: `/my-photos`, `/photo/:id/edit` (com `requiresAuth`); `/profile/:username` e `/photo/:id` públicas
- [X] Tema escuro moderno aplicado em todas as telas (tokens em `main.css`, fonte Plus Jakarta Sans)
- [X] Teste: menu do avatar abre, fecha fora, fecha com Esc, fecha ao escolher um item
- [X] Teste: "Ver Perfil" → meu perfil com "Editar Perfil"; autor de um card de outra conta → perfil dela com "Seguir"; troca de perfil sem recarregar
- [X] Teste: janela anônima em `/profile/<username>` → sem "Seguir" e sem "Editar Perfil"; username inexistente → mensagem de erro, tela intacta
- [X] Teste: Minhas Fotos vazio → estado vazio com link; com fotos → grade com Editar/Excluir; modal centralizado, fecha com Cancelar/X/fundo/Esc e não fecha ao clicar na caixa
- [X] Teste: exclusão confirmada → item some sem recarregar, arquivo some da pasta, contador do perfil cai
- [X] Teste: edição pré-preenchida; só texto mantém o arquivo; troca de arquivo mostra prévia e apaga o antigo; título vazio → erro sem requisição na aba Network
- [X] Teste: `PUT` com arquivo enviado como `Content-Type: multipart/form-data; boundary=...`
- [X] Teste: logado como B, edição de foto da A pela URL → mensagem de permissão; id inexistente → não encontrada
- [X] Teste: deslogado em `/my-photos` → vai ao login e volta depois de entrar
- [X] Teste: Detalhe da minha foto → "Editar" visível; de outra pessoa → ausente
- [X] Regressão: Feed, Detalhe com imagem, Upload, Meu Perfil, Login/Logout
