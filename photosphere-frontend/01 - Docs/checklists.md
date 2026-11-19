# Checklists — PhotoSphere | Atividades 1 a 13

> **Disciplina:** Programação Web (FrontEnd)  
> **Projeto:** PhotoSphere (#15)  
> **Aluno:** Marcos Vinicius da Silva Zacchi  

---

## ATIVIDADE 1 — PARTE A: Backend (API)

- [X] Node.js 20+ instalado e verificado (`node -v`)
- [X] Execução de scripts liberada no PowerShell (`Set-ExecutionPolicy RemoteSigned`)
- [X] Pasta `photosphere-api/` criada
- [X] Projeto inicializado com `npm init -y` (sem scaffolding automático)
- [X] Dependências instaladas: `express`, `cors`, `dotenv`
- [X] Estrutura de pastas criada: `bin/`, `config/`, `middlewares/`, `modules/`, `routes/`
- [X] `.gitignore` criado (ignorando `node_modules/` e `.env`)
- [X] `.env` configurado com `PORT=3000` e `FRONTEND_URL=http://localhost:5173`
- [X] `middlewares/apiResponse.js` criado com padrão `{ success, message, data }` / `{ success, message, errors }`
- [X] `routes/index.js` criado com `GET /` retornando status "online"
- [X] `server.js` criado com Express + CORS + middlewares + rotas
- [X] CORS configurado via `.env`, autorizando explicitamente `http://localhost:5173`
- [X] API rodando na porta 3000 (`node server.js`)
- [X] Rota `GET /api` testada no navegador — retornou `{ success: true, data: { status: "online" } }`
- [X] Rota `GET /api` testada com `curl.exe http://localhost:3000/api`

---

## ATIVIDADE 1 — PARTE B: Frontend (Vue)

- [X] Projeto criado com `npm create vue@latest photosphere-frontend` (Vite + Vue 3)
- [X] Opções selecionadas: Vue Router ✅ | Pinia ✅ | TypeScript ❌ | outros ❌
- [X] `npm install` executado com sucesso
- [X] `npm run dev` rodando em `http://localhost:5173`
- [X] Estrutura de pastas criada: `views/`, `components/`, `services/`, `stores/`
- [X] `.env` criado com `VITE_API_URL=http://localhost:3000/api`
- [X] Vue Router configurado com todas as rotas do sistema (16 rotas)
- [X] Views criadas para todas as rotas (inicialmente com placeholder "em construção")
- [X] `components/AppNavbar.vue` criado com `<RouterLink>` para navegação
- [X] `components/AppFooter.vue` criado
- [X] `App.vue` atualizado com layout base: `Navbar` + `RouterView` + `Footer`
- [X] `services/api.js` criado centralizando a comunicação com a API
- [X] `HomeView.vue` (Landing Page) consumindo `GET /api` e exibindo status
- [X] Badge "✅ online" aparecendo na Landing Page — marco visual concluído
- [X] Erro de CORS reproduzido (API sem CORS) e corrigido (com CORS via `.env`)

---

## ATIVIDADE 2 — PARTE A: Módulo Search (Backend)

- [X] Pasta `modules/search/` criada
- [X] `searchService.js` criado — retorna `{ fotos: [], users: [] }` (sem banco de dados ainda)
- [X] `searchController.js` criado — lê `req.query.q`, chama service, responde com `res.success()`
- [X] `searchRoutes.js` criado — `router.get('/search', searchController.search)`
- [X] `searchRoutes` importado e registrado em `server.js` com `app.use('/api', searchRoutes)`
- [X] `curl ".../api/search?q=teste"` responde com `{ fotos: [], users: [] }`
- [X] `curl ".../api/search"` (sem `q`) responde com `query: ""`
- [X] `curl ".../api"` continua respondendo normalmente

---

## ATIVIDADE 2 — PARTE B: Camada de Serviços (Frontend)

- [X] `axios` instalado (`npm install axios`)
- [X] `src/services/api.js` reescrito com `axios.create()` usando `VITE_API_URL`
- [X] Interceptor de resposta adicionado com os 3 ramos (sucesso, erro de API, erro de rede)
- [X] Comentário em português no topo de `api.js` explicando os 3 ramos
- [X] `src/services/systemService.js` criado com `getApiStatus()`
- [X] `src/services/searchService.js` criado com `search(query)`
- [X] `src/services/authService.js` criado (placeholder: `login`, `register`, `logout`)
- [X] `HomeView.vue` atualizado para usar `getApiStatus()` do `systemService`
- [X] Console mostrou `Busca OK:` com o objeto `{ query: 'a', fotos: [], users: [] }`
- [X] Erro de rede provocado de propósito caiu na mensagem amigável do interceptor
- [X] Bloco de teste temporário removido da Landing Page

---

## ATIVIDADE 3 — PARTE A: Persistência de Dados (Backend)

- [X] Dependências instaladas: `sequelize`, `mysql2`, `bcryptjs`, `express-validator`
- [X] Banco de dados `photosphere_db` criado no MySQL
- [X] `.env` atualizado com credenciais do MySQL (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- [X] `config/database.js` criado com conexão Sequelize
- [X] `config/constants.js` criado com regras de validação centralizadas
- [X] `modules/user/userModel.js` criado com campo de contagem `photosCount`
- [X] `modules/user/userValidator.js` criado com validação declarativa
- [X] `modules/user/userService.js` criado com hash de senha (`bcryptjs`) e busca de perfil sem vazar senha
- [X] `middlewares/asyncHandler.js` criado para tratamento de erros assíncronos
- [X] `middlewares/errorHandler.js` criado como destino final de erros da API
- [X] `modules/user/userController.js` e `modules/user/userRoutes.js` criados
- [X] `userRoutes` e `errorHandler` registrados em `server.js` na ordem correta
- [X] Terminal exibe `✅ Banco de dados sincronizado!` ao subir a API com `sequelize.sync({ alter: true })`
- [X] Tabela `users` criada no MySQL com todas as colunas do Model
- [X] Teste `curl` de cadastro com sucesso responde 201 com `{ id, username, email }`
- [X] Teste `curl` de senha curta responde 400 com mensagem correta
- [X] Teste `curl` de duplicidade responde 500 com mensagem amigável
- [X] Teste `curl` de confirmação (`GET /profile/:username`) retorna dados persistidos

---

## ATIVIDADE 3 — PARTE B: Tela de Registro (Frontend)

- [X] Link clicável para `/register` verificado na Navbar (`AppNavbar.vue`)
- [X] Formulário controlado construído em `RegisterView.vue` com `v-model`
- [X] Validação client-side espelha exatamente os limites do backend
- [X] Mensagens de erro aparecem e somem reativamente em cada campo
- [X] Envio vazio não dispara chamada de rede
- [X] Envio de formulário integrado com `authService.register()`
- [X] Cadastro duplicado exibe mensagem de erro da API e status 500 na aba Network
- [X] Cadastro válido redireciona para a rota `/login`

---

## ATIVIDADE 4 — PARTE A: Login, JWT e Middleware de Autenticação (Backend)

- [X] `jsonwebtoken` instalado
- [X] `.env` atualizado com `JWT_SECRET` e `JWT_EXPIRES_IN`
- [X] `config/jwt.js` criado com funções de geração (`generateToken`) e verificação (`verifyToken`)
- [X] `middlewares/auth.js` criado com middleware `isAuthenticated`
- [X] `modules/user/userService.js` atualizado com `loginUser` e `getUserProfile`
- [X] `modules/user/userValidator.js` atualizado com `loginValidator`
- [X] `modules/user/userController.js` atualizado com `login`, `logout` e `getMyProfile`
- [X] `modules/user/userRoutes.js` atualizado, com `/profile/me` registrado antes de `/profile/:username`
- [X] Teste `curl`: Login com sucesso devolve token JWT e dados do usuário (incluindo `isAdmin`)
- [X] Teste `curl`: Senha errada devolve 500 com mensagem genérica de segurança
- [X] Teste `curl`: `GET /profile/me` sem token devolve 401
- [X] Teste `curl`: `GET /profile/me` com token válido devolve os dados do usuário logado
- [X] Teste `curl`: `GET /profile/me` com token inválido devolve 401

---

## ATIVIDADE 4 — PARTE B: Login, Pinia e Proteção de Rotas (Frontend)

- [X] `createPinia()` registrado em `main.js` antes de `.use(router)`
- [X] `stores/auth.js` criado com Pinia e persistência de sessão via `localStorage`
- [X] Interceptor de requisição no Axios anexando `Authorization: Bearer <token>` automaticamente
- [X] Interceptor de resposta tratando erro 401: limpa sessão e redireciona ao Login com `?redirect=...`
- [X] Nomes de chave (`token`, `user`) padronizados entre Store e Interceptors
- [X] Bootstrap 5 CSS incluído via CDN em `index.html`
- [X] `src/assets/main.css` criado com a cor de marca monocromática laranja (`#FF6622`)
- [X] Tela `LoginView.vue` funcional estilizada com Bootstrap 5 e cor de marca
- [X] Guarda de navegação (`Navigation Guard`) em `src/router/index.js` protegendo rotas com `requiresAuth: true`
- [X] `useAuthStore()` chamado dentro do callback do guard, evitando dependência circular
- [X] Navbar reativa: exibe links protegidos e botão "Sair" quando autenticado; "Entrar/Cadastrar" quando deslogado
- [X] Logout funcional: descarta token/user do `localStorage` e redireciona ao Login
- [X] Teste de login com sucesso redirecionando e exibindo `Perfil autenticado OK:` no Console

---

## ATIVIDADE 5 — PARTE A: Upload de Arquivos e Edição de Perfil (Backend)

- [X] `multer` instalado no backend (`npm install multer`)
- [X] Constante de validação `BIO_MAX: 255` adicionada em `config/constants.js`
- [X] Imagem padrão `default-profile.png` criada em `public/uploads/profiles/`
- [X] Middleware `middlewares/profileMulter.js` implementado com diskStorage, filtro de extensão (JPG, PNG, WEBP) e limite de 5MB
- [X] Servimento de arquivos estáticos configurado em `server.js` via `app.use('/uploads', express.static(...))` antes do registro das rotas
- [X] Validador `profileUpdateValidator` criado em `modules/user/userValidator.js` com `fullName` opcional e `bio` limitado a `BIO_MAX`
- [X] Método de serviço `updateUserProfile` implementado em `modules/user/userService.js` com remoção segura de foto antiga via `fs.unlink` (preservando `default-profile.png`)
- [X] Controlador `updateProfile` criado em `modules/user/userController.js`
- [X] Rota `PUT /profile/me` configurada em `modules/user/userRoutes.js` com `isAuthenticated`, `uploadProfile.single('profilePicture')` e `profileUpdateValidator`
- [X] Teste `curl` 1: Atualização de nome e bio sem foto respondendo com sucesso (200)
- [X] Teste `curl` 2: Bio com mais de 255 caracteres rejeitada com status 400
- [X] Teste `curl` 3: Upload de arquivo não-imagem rejeitado com erro de formato
- [X] Teste `curl` 4: Upload de foto de perfil salva em disco e dados do usuário atualizados

---

## ATIVIDADE 5 — PARTE B: Upload de Arquivos e Edição de Perfil (Frontend)

- [X] Variável de ambiente `VITE_API_STORAGE_URL=http://localhost:3000/uploads` configurada em `.env`
- [X] Utilitário `src/utils/media.js` criado com `getProfilePictureUrl(path)` para tratamento de imagens padrão e enviadas
- [X] Funções `getMyProfile()` e `updateProfile(formData)` adicionadas em `src/services/userService.js` enviando `multipart/form-data`
- [X] Link "Meu Perfil" exibido na Navbar (`AppNavbar.vue`) condicionalmente quando o usuário estiver autenticado
- [X] Rota `/profile/me` registrada no Vue Router apontando para `MyProfileView.vue` com `requiresAuth: true` antes de `/profile/:username`
- [X] View funcional `src/views/profile/MyProfileView.vue` desenvolvida com carregamento de dados reais via `getMyProfile()`
- [X] Prévia instantânea de imagem client-side implementada com `URL.createObjectURL(file)` sem disparar requisições de rede
- [X] Formulário multipart controlado com campos de nome, bio (com contador em tempo real até 255) e upload de imagem
- [X] Envio integrado com `updateProfile(formData)` e sincronização do usuário na Pinia Store / LocalStorage
- [X] Estilização completa alinhada à identidade visual monocromática laranja (`#FF6622`) e Bootstrap 5
- [X] Prints de evidência organizados na pasta `photosphere-frontend/01 - Docs/atividade05/`

---

## ATIVIDADE 6 — PARTE A: Backend (Checkpoint de Consistência)

- [X] Revisão de consistência dos módulos existentes (`search` e `user`) confirmando o padrão Route → Controller → Service → Model
- [X] Nenhuma rota (`*Routes.js`) contém lógica de negócio
- [X] Nenhum Controller consulta o Model diretamente, sem passar pelo Service
- [X] Nenhum Service faz referência a `req` / `res`
- [X] Todo Controller usa `success()` / `error()` de `apiResponse.js`
- [X] Toda rota que chama uma função async está envolvida em `asyncHandler`
- [X] Toda validação de entrada usa `express-validator`, sem nenhum `if` manual escondido
- [X] `config/constants.js` sem constantes soltas sem uso nem valores de validação fora dela
- [X] A constante de limite da bio (`BIO_MAX: 255`) é usada exatamente uma vez, no lugar certo
- [X] `checkpoint-01.md` criado e respondido em `01 - Docs/atividade06/` e em `E6/`
- [X] Todos os endpoints já construídos continuam respondendo como esperado
- [X] Nenhuma linha de código nova necessária no backend

---

## ATIVIDADE 6 — PARTE B: Frontend (Componentização e Consistência Visual)

- [X] `bootstrap-icons` incluído via CDN no `index.html`
- [X] Três componentes-base criados em `src/components/base/`: `BaseInput.vue`, `BaseButton.vue` e `FormCard.vue`
- [X] `BaseInput.vue` implementado com `defineModel()` do Vue 3 para binding bidirecional nativo
- [X] `BaseButton.vue` implementado com estados de `loading`, `disabled` e variantes da cor de marca (`#FF6622`)
- [X] `FormCard.vue` criado com cabeçalho, slots de alertas, corpo e rodapé para unificação de layout
- [X] As três telas refatoradas para usar `BaseInput` / `BaseButton` / `FormCard` (Registro, Login, Edição de Perfil)
- [X] Tela de Registro agora visualmente consistente com Login/Perfil, utilizando a cor de marca `#FF6622` e eliminando débitos visuais
- [X] Composable `src/composables/useAuth.js` criado centralizando o acesso ao estado de autenticação
- [X] Guarda de navegação global (`src/router/index.js`) atualizado para usar `useAuth()`
- [X] Navbar (`src/components/AppNavbar.vue`) atualizada para usar `useAuth()`
- [X] Navbar revisada removendo links de funcionalidades não construídas, atendendo estritamente à regra da ADR-013
- [X] Teste de Cadastro: confirmação do redirecionamento ao Login com a tela agora estilizada
- [X] Teste de Login: confirmação do redirecionamento à tela principal
- [X] Teste de Navbar: confirmação da alternância reativa correta entre estado logado e deslogado
- [X] Teste de Edição de Perfil: confirmação dos três comportamentos da Aula 05 (dados reais, edição, upload) passando pelos componentes-base
- [X] Teste do Guarda de Rota: deslogado tentando acessar tela protegida redireciona imediatamente ao Login
- [X] Console do DevTools sem nenhum erro novo durante os testes

---

## ATIVIDADE 7 — PARTE A: Backend (Model, Associação e Upload da Entidade Principal)

- [X] Pasta de upload da entidade principal criada (`public/uploads/photos/`)
- [X] Constantes `TITLE_MAX: 100` e `DESCRIPTION_MAX: 500` adicionadas ao objeto `VALIDATION` em `config/constants.js`
- [X] Model `Photo` criado em `modules/photo/photoModel.js` com campos apropriados ao Grupo B (`title`, `description`, `imageUrl`, `userId`, `viewsCount`, `likesCount`)
- [X] Arquivo `config/associations.js` criado centralizando os relacionamentos `User.hasMany(Photo)` e `Photo.belongsTo(User)` para evitar referências circulares
- [X] Middleware `middlewares/photoMulter.js` implementado com diskStorage, filtro MIME (JPG, PNG, WEBP) e limite de 10MB
- [X] Validador `createPhotoValidator` criado em `modules/photo/photoValidator.js` com validações de campos e verificação de `req.file`
- [X] Camada de serviço `modules/photo/photoService.js` implementada com persistência e incremento atômico de `user.photosCount`
- [X] Controlador `modules/photo/photoController.js` implementado com respostas padronizadas `res.success()`
- [X] Rotas `modules/photo/photoRoutes.js` criadas com ordem estrita de middlewares: `isAuthenticated` → `multer` → `validator` → `controller`
- [X] Roteador montado em `server.js` via `app.use('/api', photoRoutes)`
- [X] Associações carregadas em `server.js` antes da invocação de `sequelize.sync()`
- [X] Tabela `photos` mapeada com chave estrangeira vinculada à tabela `users`
- [X] Upload de foto funcional e coluna de contagem `photosCount` incrementada
- [X] Casos de erro validados com os status esperados (401 sem auth, 400 sem imagem, 400 título inválido, 400 formato proibido)

---

## ATIVIDADE 7 — PARTE B: Frontend (Formulário, Progresso e Alcançabilidade)

- [X] Camada de serviço `src/services/photoService.js` criada com `uploadPhoto()` recebendo `onUploadProgress` como parâmetro
- [X] Classes utilitárias `.progress-bar-brand` e `.thumbnail-preview` adicionadas em `src/assets/main.css`
- [X] Formulário completo construído em `src/views/UploadView.vue` com `FormCard`, `BaseInput` e `BaseButton`
- [X] Prévia instantânea de imagem client-side implementada via `URL.createObjectURL(file)` com zero chamadas de rede
- [X] Barra de progresso reativa conectada ao progresso real do Axios e exibida durante o envio
- [X] Botão/link "Publicar Foto" adicionado à Navbar (`AppNavbar.vue`), visível exclusivamente para usuários autenticados
- [X] Resposta formal ao checklist de alcançabilidade redigida em `alcancabilidade.md`
- [X] Ficha de preparação atualizada com a Seção 2 preenchida (Grupo B, `Photo`, `photos`, `image`, `photosCount`)
- [X] Teste de alcançabilidade: clique em "Publicar Foto" na Navbar altera a URL para `/upload` sem recarregar a página (SPA)
- [X] Teste de validação: tentativa de envio com campos vazios impede o disparo e exibe erros nos campos correspondentes
- [X] Teste de prévia: seleção de imagem exibe o thumbnail e botão de remoção instantaneamente
- [X] Teste de envio: barra de progresso visual avança na tela e exibe mensagem de sucesso
- [X] Inspeção na aba Network do DevTools confirmando cabeçalho `Content-Type: multipart/form-data; boundary=...`

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

---

## ATIVIDADE 11 — Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| Contador de seguidores no model `User` | `followersCount` | `followersCount` |
| Contador de seguindo no model `User` | `followingCount` | `followingCount` |
| Rota do feed filtrado | `/api/following-videos` | `/api/following-photos` |

---

## ATIVIDADE 11 — PARTE A: Backend (Seguir, Seguidores/Seguindo e Feed Filtrado)

**Etapa 1 — Model Follow e Associações**

- [X] `modules/follow/followModel.js` criado, com o índice único `idx_unique_follow_follower_following (follower_id, following_id)` e o índice simples `idx_follows_following_id (following_id)`
- [X] Associações com apelidos declaradas em `config/associations.js` (`Follower` por `followerId`, `Following` por `followingId`)
- [X] Tabela `follows` e os dois índices conferidos no banco

**Etapa 2 — Service, Controller e Rotas**

- [X] Três arquivos do módulo `follow` (`followService.js`, `followController.js`, `followRoutes.js`), registrados no `server.js` (o `app.js` do roteiro) antes do 404 e do `errorHandler`
- [X] `parseUserId` convertendo o id na borda (controller): `abc`, `2.5` e `-3` → `400`
- [X] Três escritas (linha + `followersCount` do seguido + `followingCount` de quem segue) numa só transação, todas com `{ transaction: t }`, e `reload()` do alvo antes de responder `{ isFollowing, followersCount }`
- [X] `toggle-follow` e `follow-status` autenticadas; `followers` e `following` públicas; `following-photos` autenticada

**Etapa 3 — Feed Filtrado e `isFollowing` no Perfil**

- [X] `photoService.getFollowingPhotos(userId, page, limit)` com `Op.in`, paginado (padrões `1` e `12` no controller), devolvendo `[]` cedo para quem não segue ninguém
- [X] `isFollowing` no perfil público (`userService.getPublicProfile`), consultado só quando há usuário logado que não é o dono; senão, `false`

**Etapa 4 — Testando (contas A, B e C)**

- [X] `toggle-follow` sem token `401`; id `abc` `400`; seguir a si mesmo `400`; usuário `99999` `404`
- [X] A segue B `201` (`followersCount: 1`); A de novo `200` (`0`); de novo `201` (`1`); C segue B (`2`); B segue A
- [X] Contadores: B com 2 seguidores e 1 seguindo; A com 1 e 1; C com 0 e 1
- [X] `follow-status` e `isFollowing`: visitante `false`; A olhando B `true`; C olhando A `false`; B no próprio perfil `false` e `isOwner: true`
- [X] `followers` de B → C e A (mais recente primeiro); `following` de A → B; sem `password`; usuário inexistente `404`
- [X] Feed filtrado: sem token `401`; A vê só as fotos de B; `?page=2&limit=1` → `[]` (B com 1 foto); conta que não segue ninguém → `[]`
- [X] No banco, linha repetida em `follows` recusada (`Duplicate entry ... for key 'idx_unique_follow_follower_following'`)
- [X] Regressão: curtir, comentar, upload, edição e exclusão; `GET /feed` como antes

---

## ATIVIDADE 11 — PARTE B: Frontend (FollowButton, Listas e Feed "Seguindo")

**Contextualização e Checagem de Alcançabilidade (ADR-012)**

| Peça | Caminho(s) de clique construídos |
|---|---|
| Seguir / deixar de seguir | botão no perfil público de outra pessoa; visitante → login (`?redirect=`) → volta ao perfil |
| Listas de seguidores/seguindo | os números "Seguidores"/"Seguindo" do perfil viram links; abas entre as duas listas; link "Voltar ao perfil" |
| Feed filtrado | um clique a partir de qualquer tela: item **"Seguindo"** da navegação principal da `AppNavbar` |

> **Verificação da Sidebar:** o PhotoSphere **não tem `TheSidebar.vue`**. A navegação principal do projeto fica na `AppNavbar.vue` (links centrais "Início" e "Feed", desde a Aula 09). Não existia nenhum link nem rota "Seguindo". **O que foi feito:** criada a rota `/following` (`name: 'following-feed'`, `requiresAuth`) e acrescentado o item "Seguindo" na navegação principal da Navbar, apontando para o mesmo path, visível só para quem está logado.

**Etapa 1 — Service**

- [X] `src/services/followService.js` criado (`toggleFollow`, `getFollowers`, `getFollowing`, `getFollowingPhotos`)

**Etapa 2 — FollowButton com `defineModel`**

- [X] `src/components/FollowButton.vue` com prop `userId`, dois `defineModel` (`following` e `followersCount`), otimista, com rollback, `isBusy` e visitante → login com `redirect`
- [X] Sem a leitura "logo após atribuir": o novo estado fica na variável local `nowFollowing`

**Etapa 3 — Perfil Público Ativo**

- [X] Placeholder "Seguir chega em breve" trocado pelo `FollowButton` com `v-model:following="profile.isFollowing"` e `v-model:followers-count="profile.followersCount"`; aparece para todos que não são o dono
- [X] Números "Seguidores"/"Seguindo" do perfil viram `router-link`s para as listas

**Etapa 4 — Listas e Feed Filtrado**

- [X] `src/views/FollowListView.vue`: uma tela para as duas rotas (`props: { kind }`), perfil → lista em sequência, `watch(() => [props.kind, route.params.username], loadList, { immediate: true })`, abas com a ativa vinda de `kind`, estados vazios com o nome da pessoa
- [X] `src/views/FollowingFeedView.vue`: mesma estrutura do Feed (`page` / `hasMore` / "Carregar mais") e estado vazio com link para o Feed
- [X] Rotas: `/following` (`requiresAuth`), `/profile/:username/followers` e `/profile/:username/following` (públicas)

**Etapa 5 — Teste Prático Completo (só de clique em clique)**

- [X] Visitante (janela anônima): o botão aparece; o clique leva ao login e volta ao perfil depois de entrar
- [X] Logado: "Seguir" muda botão e contador do cartão na hora; F5 mantém; "Seguindo" desfaz
- [X] Slow 4G: mudança instantânea. Offline: muda, volta atrás e mostra a mensagem de erro
- [X] O contador nunca vai para `-1` ao seguir
- [X] No meu perfil não há botão de seguir; os números são links
- [X] Seguidores → Seguindo (aba) troca sem recarregar; clicar numa pessoa leva ao perfil dela; usuário inexistente mostra o erro; listas vazias mostram a mensagem
- [X] Trocar de uma pessoa que sigo para uma que não sigo: o botão reflete a pessoa nova
- [X] Pelo item "Seguindo" da Navbar: só fotos de quem eu sigo; deixar de seguir tira as fotos da pessoa
- [X] Regressão: Perfil (editar, fotos), Feed, Detalhe (curtir/comentar), Minhas Fotos, Curtidas, Login/Logout

---

## ATIVIDADE 12 — Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| Entidade principal | `Video` | `Photo` |
| Service que a cria e mexe no contador do usuário | `videoService.uploadVideo` | `photoService.createPhoto` |
| Contador do usuário afetado | `videosCount` | `photosCount` |
| Controller do feed geral | `userController.getFeed` | `photoController.getFeed` |
| Controller do feed filtrado | `followController.getFollowingVideos` | `followController.getFollowingPhotos` |
| Telas que leem dados ao montar | Detalhe, Perfil Público, Curtidas, Meus Vídeos, Listas de seguidores, Comentários, Feed, Feed filtrado | `PhotoDetailView`, `PublicProfileView`, `LikedPhotosView`, `MyPhotosView`, `FollowListView`, `CommentSection`, `FeedView`, `FollowingFeedView` |

---

## ATIVIDADE 12 — PARTE A: Backend (Leitura Crítica, Paginação e Transação)

**Etapa 1 — Leitura guiada**

- [X] `checkpoint-02.md` criado, com as respostas dos Blocos 2.1 a 2.6 e as três perguntas extras

**Etapa 2 — Corrigindo a paginação**

- [X] Problema reproduzido e anotado antes da correção (`paginacao-antes.jpg`, com o código da Atividade 11)
- [X] `PAGINATION` (`DEFAULT_PAGE: 1`, `DEFAULT_LIMIT: 12`, `MAX_LIMIT: 50`) e `utils/pagination.js` (`parsePagination`, com `>= 1`) criados e usados nos dois controllers (`photoController.getFeed`/`listPhotos` e `followController.getFollowingPhotos`) e nos dois services
- [X] Busca em `modules/` sem nenhum `|| 12`, `|| 10`, `limit = 10` ou `limit = 12`
- [X] Testes do Bloco 3.4 com o resultado esperado (`limit=-3`, `limit=100000`, `page=-2&limit=2`, `page=2&limit=1`)

**Etapa 3 — A transação do registro + contador**

- [X] `photoService.createPhoto` dentro de `sequelize.transaction`, com `{ transaction: t }` no `Photo.create` e no `User.increment('photosCount')`
- [X] Criação testada: `201` e `photosCount` incrementado

**Etapa 4 — Regressão da API**

- [X] Perfil com `isFollowing`, feed, feed filtrado, seguir, seguidores, curtir, curtidas, comentar, comentários e "minhas fotos" respondendo como esperado, sem regressão

---

## ATIVIDADE 12 — PARTE B: Frontend (Constantes, Toasts, Composables e Regressão)

**Etapa 1 — Constantes**

- [X] `src/config/constants.js` criado (`STORAGE_KEYS`, `LIMITS`, `PAGE_SIZE`, `TOAST_DURATION`, `MESSAGES`), com limites iguais aos da API
- [X] `api.js`, `stores/auth.js` (e `MyProfileView`) usam `STORAGE_KEYS`; os services dos feeds usam `PAGE_SIZE`

**Etapa 2 — Toasts e interceptor**

- [X] `src/composables/useToast.js` (lista singleton fora da função) e `src/components/ToastContainer.vue` (montado uma vez em `App.vue`, `z-index` acima do modal)
- [X] `services/api.js` reescrito com `notifyIfNeeded`: `401` → Login; `silent` → sem toast; `GET` → sem toast; outras ações → toast de erro
- [X] `silent: true` apenas nos formulários: login, cadastro, logout, edição de perfil, upload e edição da foto (no Axios, a config é o 3º argumento do `post`/`put`)
- [X] Teste: login com senha errada → erro no formulário, sem toast; curtir com Offline → toast e o botão volta

**Etapa 3 — `useAsyncData` e `usePaginatedList` nas telas**

- [X] `useAsyncData` (com `lastCallId`, `initialData`, `watch`) e `usePaginatedList` criados
- [X] As oito telas de leitura refatoradas: Detalhe e Perfil Público (com `watch` na rota), Curtidas, Minhas Fotos, Listas de seguidores (`watch` em `[kind, username]`), Comentários (`watch` no `photoId`), Feed e Feed "Seguindo" (`usePaginatedList`), sem `apiErrorMessage`/`errorMessage` de estado sobrando
- [X] Cada tela testada individualmente no navegador

> **Decisão sobre telas de formulário:** `MyProfileView`, `EditPhotoView`, `UploadView`, `LoginView` e `RegisterView` **ficaram de fora** dos composables, de propósito. Elas não "exibem" o dado lido: copiam o que a API devolve para os campos de um formulário que a pessoa vai editar, e o erro que importa nelas é o do envio, campo a campo. Com o `useAsyncData`, seria preciso copiar o `data` para os campos de novo (num `watch`), e o resultado ficaria mais complicado do que o `onMounted` atual. Os composables servem às telas que **mostram** dados.

**Etapa 4 — `useAuthenticatedAction` e os botões**

- [X] `useAuthenticatedAction` criado e usado no `LikeButton` e no `FollowButton`; os dois perderam o `errorMessage` local e a cerca repetida, e o `catch` só desfaz a mudança visual
- [X] Três cliques rápidos, com Slow 4G, geram uma única requisição (`uma-requisicao.jpg`)

**Etapa 5 — Constantes nos formulários**

- [X] `RegisterView`, `UploadView`, `EditPhotoView`, `MyProfileView` e `CommentSection` usam `LIMITS.*`; a busca por `3`, `6`, `20`, `100`, `255` e `500` em `src/` só encontra os valores em `config/constants.js`

**Etapa 6 — Teste de regressão completo**

- [X] Todos os passos realizados (conta nova), sem regressão e sem erros vermelhos no Console (além dos provocados com Offline)

---

## ATIVIDADE 13 — Nomes adaptados à entidade

| Nome | Exemplo (Shortz-App) | PhotoSphere |
|---|---|---|
| A coleção do usuário | `Playlist` | `Album` (tabela `albums`, módulo `album`) |
| O model da junção | `PlaylistVideo` (tabela `playlist_videos`) | `AlbumPhoto` (tabela `album_photos`) |
| Contador de itens na coleção | `videosCount` | `photosCount` |
| Rotas | `/api/my-playlists`, `/api/playlists` | `/api/my-albums`, `/api/albums` |
| Rota do status | `/api/videos/:videoId/playlists-status` | `/api/photos/:photoId/albums-status` |
| Campo de texto usado na busca | `title` | `title` (da foto) + `username`/`fullName` |
| Campo `hasVideo` na resposta do status | `hasVideo` | `hasPhoto` |
| Telas | `MyPlaylistsView`, `PlaylistDetailView` | `AlbumsView` (Meus Álbuns), `AlbumDetailView` |

---

## ATIVIDADE 13 — PARTE A: Backend (Álbuns, Busca e Limpeza na Exclusão)

**Etapa 1 — Constantes, `parseId` e o `followController`**

- [X] `ALBUM_TITLE_MIN` (3), `ALBUM_TITLE_MAX` (100), `ALBUM_DESCRIPTION_MAX` (500) em `VALIDATION` e o bloco `SEARCH` (`MIN_LENGTH: 2`, `MAX_LENGTH: 100`, `LIMIT: 10`)
- [X] `utils/parseId.js` criado e usado pelo `followController` (as quatro ocorrências; o `parseUserId` antigo apagado); `GET /api/users/abc/followers` continua `400` com a mesma mensagem
- [X] Extra: `parseId` também nos controllers de foto, curtida e comentário (`/photos/abc` passou de `404` para `400`, como previsto no `checkpoint-02.md`), e `utils/httpError.js` substituindo a `httpError` copiada em quatro services (pendência da Aula 12 resolvida)

**Etapa 2 — Models e Associações**

- [X] `albumModel.js` (`title`, `description`, `isPublic` padrão `false`, `photosCount`, `userId`, índice `idx_albums_user_id`) e `albumPhotoModel.js` (índice único `idx_unique_album_photo (album_id, photo_id)` e `idx_album_photos_photo_id`)
- [X] Seis associações (`User`↔`Album`, `Album`↔`AlbumPhoto`, `Photo`↔`AlbumPhoto`), com `onDelete: 'CASCADE'` nos `hasMany`
- [ ] Tabelas, índices e chaves estrangeiras (`ON DELETE CASCADE`, via `SHOW CREATE TABLE album_photos`) conferidos no banco

**Etapa 3 — Validator, Service, Controller e Rotas**

- [X] Quatro arquivos do módulo `album`, registrados no `server.js` (o `app.js` do roteiro) antes do 404
- [X] Duas escritas (linha + `photosCount`) numa só transação nas três operações, com o `increment`/`decrement` dentro do `if`
- [X] `403` para privado de outra pessoa; `isOwner` com `currentUserId !== null` primeiro; `isPublic === true` (nunca `Boolean(isPublic)`)

**Etapa 4 — A Busca de Verdade**

- [X] `searchService` com `escapeLike`, `searchPhotos` (título, autor público, `createdAt`/`id` DESC, `SEARCH.LIMIT`), `searchUsers` (`Op.or` em `username`/`fullName`) e `globalSearch` com `Promise.all`
- [X] `searchController` `async`/`await`, `typeof === 'string'`, `trim()` + `slice(0, MAX_LENGTH)`, só consulta com `>= MIN_LENGTH`; rota com `asyncHandler`

**Etapa 5 — A exclusão da foto limpa os álbuns**

- [X] `deletePhoto` busca as linhas da junção, desconta 1 do `photosCount` de cada álbum e apaga as linhas, na mesma transação, antes do `destroy` da foto
- [ ] Teste de controle feito e descrito (bloco comentado → contador alto; restaurado → contador certo)

**Etapa 6 — Testando (contas A e B)**

- [ ] 1. Criar: `401`; `ab` `400`; só espaços `400`; `isPublic: "sim"` `400`; sem `isPublic` → privado e aparado; com `isPublic: true`
- [ ] 2. Listar: só as da conta, a mais nova primeiro (desempate com duas criadas no mesmo segundo)
- [ ] 3. Adicionar: `201`/1; repetir `200`/1; foto inexistente `404`; sem id ou `"abc"` `400`; de outra pessoa `403`; `99999` `404`; `abc` na URL `400`
- [ ] 4. Remover: `200` e o contador desce; repetir `404`; de outra pessoa `403`
- [ ] 5. Ler: público para visitante `200` (`isOwner: false`, autores, sem `password`); privado `403` para visitante e outra conta; privado da dona `200`; `99999` `404`; `abc` `400`
- [ ] 6. Status: `401`; `hasPhoto` correto; foto inexistente `404`; a outra conta vê os dela
- [ ] 7. Excluir o álbum: `403` / `200` / depois `404`; junção sem linhas dele; a foto continua existindo
- [ ] 8. Excluir uma foto que está em álbuns de duas pessoas: os dois contadores voltam a 0
- [ ] 9. Busca: vazio/1 letra → listas vazias; trecho do título (outra caixa) → a foto; trecho do username → a pessoa; inexistente → vazio; `?q=ab&q=cd` e `?q[x]=1` sem `500`; `%%` e `__` → vazio
- [ ] 10. No banco, linha repetida na junção recusada (`Duplicate entry ... idx_unique_album_photo`)
- [ ] 11. Regressão: feed, detalhe, perfil, curtir, comentar, seguir e listas, feed "Seguindo", upload, edição; `GET /users/abc/followers` → `400`

---

## ATIVIDADE 13 — PARTE B: Frontend (Álbuns, "Salvar", runOptimistic e Busca)

**Contextualização e Checagem de Alcançabilidade**

| Peça | Caminho(s) de clique construídos |
|---|---|
| Meus Álbuns | item **"Meus Álbuns"** no menu do avatar (novo) |
| Criar / excluir álbum | botão "Novo álbum" (modal) e "Excluir" em cada cartão (confirmação) |
| Detalhe do álbum | clique no cartão, na lista |
| Salvar uma foto | botão **"Salvar"** no Detalhe da foto (visitante → login → volta à foto) |
| Remover uma foto do álbum | botão em cada card, no detalhe do álbum (só para a dona) |
| Busca | barra da Navbar (Enter) e item **"Explorar"** da Navbar |

> **Verificação das rotas:** `/albums` e `/albums/:id` existiam desde a Aula 01 como placeholders, ambas com `requiresAuth`. **O que foi feito:** o detalhe `/albums/:id` ficou **público** (sem `requiresAuth`, como pede o enunciado); a rota da busca nasceu como `/search` (`name: 'search'`, o mesmo nome usado no `router.push`), e `/explore` (o placeholder antigo, usado pelo rodapé e pela Home) passou a redirecionar para ela. O PhotoSphere não tem `TheSidebar.vue`: "Explorar" foi para a navegação principal da Navbar, e "Meus Álbuns" para o menu do avatar.

> **Lacuna conhecida (decisão de escopo):** o álbum público de outra pessoa só é alcançável por link — nenhuma tela lista os álbuns públicos de alguém.

**Etapa 1 — Constantes, Service e a limpeza da Home**

- [X] `LIMITS.ALBUM_TITLE_MIN/MAX` e `ALBUM_DESCRIPTION_MAX` (iguais aos da API) e o bloco `SEARCH` (`MIN_LENGTH: 2`, `DEBOUNCE_MS: 400`)
- [X] `services/albumService.js` com as sete funções (`createAlbum` com `{ silent: true }` no 3º argumento; adicionar com o id no corpo; remover com o id na URL)
- [X] `HomeView` sem o `import` de `search` (e sem os imports sem uso de `api` e `useAuthStore`)

**Etapa 2 — `runOptimistic` e os dois botões refatorados**

- [X] `utils/optimistic.js` com `runOptimistic({ apply, request, confirm })` — `apply` devolve o `undo`; sem `if` e sem toast
- [X] `LikeButton` e `FollowButton` refatorados (template e cerca iguais; `nowFollowing` mantida)
- [ ] Os dois botões testados sem regressão (otimista; Offline → volta + toast; visitante → login → volta)

**Etapa 3 — Meus Álbuns e o Detalhe do Álbum**

- [X] `CreateAlbumModal.vue`: formulário no `BaseModal`, botão `type="submit"` com `form="create-album-form"`, `novalidate`, `validate()` com `LIMITS`, `isPublic` começando `false`, `isSubmitting` (`persistent`), erro dentro do modal, emite `created`
- [X] `AlbumsView.vue` (Meus Álbuns): `useAsyncData` com `initialData: []`, `isCreating` e `albumToDelete`, álbum novo no topo, excluir pessimista (modal aberto se falhar), cartão com `stretched-link` e "Excluir" por cima (`position-relative` + `z-index`), selo Pública/Privada, estado vazio, pluralização
- [X] `AlbumDetailView.vue`: `watch` no `:id`, `403`/`404` no lugar do conteúdo (sem toast) com botão para sair, "Remover do álbum" só para a dona e pessimista, toast de sucesso, estado vazio diferente para a dona
- [ ] Modal de criação, lista e detalhe testados; cartão clicável com "Excluir" funcionando por cima

**Etapa 4 — O modal "Salvar" e o botão no Detalhe**

- [X] `AddToAlbumModal.vue`: `useAsyncData` do status, caixas com `:checked` + `@change` (nunca `v-model`), cadeado nos privados, cerca por linha (`Set` reativo + `:disabled`), `toggle` com `runOptimistic`, cerca liberada no `.finally`, estado vazio com link para criar
- [X] Botão "Salvar" no Detalhe da foto para todos (visitante → login com `redirect`), com a cerca do `useAuthenticatedAction` e o modal num `v-if`
- [X] Extra: `BaseModal` com `watch(..., { immediate: true })` — modais montados já abertos também ligam o Esc e travam a rolagem
- [ ] Modal testado (marcado conforme o servidor, otimista, rollback, uma requisição por clique duplo)

**Etapa 5 — Debounce, Tela de Busca e Navbar**

- [X] `composables/useDebouncedValue.js` (`watch` + `setTimeout`/`clearTimeout`, valor inicial igual à origem, `onUnmounted` limpa o timer)
- [X] `SearchView.vue`: `typedText` / `term` / `normalizedTerm`, estado inicial de `route.query.q` (com `typeof`), resposta vazia pronta com termo curto, `watch` lendo e escrevendo a URL (`router.replace`), seções "Pessoas" e "Fotos", "Nada encontrado para ...", dica do mínimo, foco no campo
- [X] Navbar: `<form role="search">` com `@submit.prevent`, ignora vazio, `router.push({ name: 'search', query: { q } })` e limpa o campo, visível para visitantes; item "Meus Álbuns" no menu do avatar
- [ ] Uma palavra inteira sem pausa → uma requisição (Network); F5 e link com o termo funcionam; Voltar não passa por cada pausa

**Etapa 6 — Teste Prático Completo**

- [ ] Os seis passos testados em sequência, a partir do login, sem digitar nenhuma URL (exceto os links compartilhados e o id inexistente)
