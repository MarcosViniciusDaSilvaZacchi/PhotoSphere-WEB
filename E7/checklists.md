# Checklists — PhotoSphere | Atividades 1, 2, 3, 4, 5, 6 e 7

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
