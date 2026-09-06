# Checklists — PhotoSphere | Atividades 1 e 2

> **Disciplina:** Programação Web (FrontEnd)
> **Projeto:** PhotoSphere (#15)
> **Aluno:** Marcos Vinicius da Silva Zacchi

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

