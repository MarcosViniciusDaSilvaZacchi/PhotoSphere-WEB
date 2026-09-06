# Checklists — PhotoSphere | Atividade 1

> **Disciplina:** Programação Web (FrontEnd)
> **Projeto:** PhotoSphere (#15)
> **Aluno:** Marcos Vinicius da Silva Zacchi
> **Entrega:** N1 — Atividade 1 (E1)

---

## PARTE A — Backend (API)

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

## PARTE B — Frontend (Vue)

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

## ENTREGA — Documentação (01 - Docs)

- [X] Pasta `01 - Docs/` criada dentro de `photosphere-frontend/`
- [X] `Funcionalides-e-Telas.md` — tabela funcionalidade → tela preenchida
- [X] `checklist.md` — este arquivo, com todos os itens marcados
- [X] `curl-api.jpg` — print do terminal com `curl.exe http://localhost:3000/api`
- [X] `landing-status.jpg` — print da Landing Page com badge "✅ online"
- [X] `erro-cors.jpg` — print do erro de CORS no console + confirmação da correção
