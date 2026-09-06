# 📸 PhotoSphere — Plataforma de Compartilhamento de Fotos

> Projeto desenvolvido para a disciplina de Programação Web (N1 - Atividade 1).
> PhotoSphere é uma plataforma onde usuários podem fazer upload de fotos, organizar álbuns e interagir com a comunidade.

---

## 📁 Estrutura do Projeto

```
Photosphere/
├── photosphere-api/         ← Back-end (Node.js + Express)
└── photosphere-frontend/    ← Front-end (Vite + Vue 3)  ← em construção
```

---

## 🛠️ Pré-requisitos

Antes de qualquer coisa, você precisa ter instalado na sua máquina:

### 1. Node.js (v20 ou superior)

1. Acesse [https://nodejs.org](https://nodejs.org)
2. Clique em **Windows Installer (.msi)** — versão **LTS**
3. Execute o instalador e siga os passos (Next → Next → Install → Finish)
4. **Feche** e **abra novamente** o terminal após instalar

Para verificar se instalou corretamente, abra o terminal e rode:

```bash
node -v   # deve retornar algo como v24.x.x
npm -v    # deve retornar algo como 11.x.x
```

### 2. Liberar execução de scripts no PowerShell (somente Windows)

Por padrão, o Windows bloqueia scripts no PowerShell. Rode o comando abaixo **uma única vez**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

> Se pedir confirmação, digite `S` e pressione Enter.

---

## 🔌 Parte A — Rodando a API (`photosphere-api`)

### O que é a API?

A API é o servidor back-end. Ela roda na **porta 3000**, recebe requisições do front-end e devolve dados em **JSON**. Não tem interface visual — é só lógica e dados.

```
Navegador (Vue) ←——→ API (Express)
   porta 5173             porta 3000
```

### Estrutura de pastas da API

```
photosphere-api/
├── bin/                      ← scripts de inicialização (uso futuro)
├── config/                   ← configurações globais (uso futuro)
├── middlewares/
│   └── apiResponse.js        ← padrão único de resposta JSON
├── modules/                  ← funcionalidades do sistema (uso futuro)
├── routes/
│   └── index.js              ← rotas públicas da API
├── node_modules/             ← dependências (gerado automaticamente)
├── .env                      ← variáveis de ambiente (não sobe pro Git)
├── .gitignore
├── package.json
├── package-lock.json
└── server.js                 ← ponto de entrada do servidor
```

### Passo a passo para rodar

**1. Acesse a pasta da API:**

```bash
cd photosphere-api
```

**2. Instale as dependências:**

> Necessário apenas na primeira vez, ou sempre que o `package.json` mudar.

```bash
npm install
```

**3. Configure as variáveis de ambiente:**

Crie um arquivo chamado `.env` na raiz da pasta `photosphere-api` com o seguinte conteúdo:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

> ⚠️ O arquivo `.env` **não é enviado ao GitHub** (está no `.gitignore`).
> Cada desenvolvedor deve criar o seu localmente.

**4. Inicie o servidor:**

```bash
node server.js
```

Você verá no terminal:

```
✅ PhotoSphere API rodando em http://localhost:3000
🌐 CORS autorizado para: http://localhost:5173
```

**5. Teste no navegador:**

Acesse: [http://localhost:3000/api](http://localhost:3000/api)

Resposta esperada:

```json
{
  "success": true,
  "message": "PhotoSphere API online",
  "data": {
    "status": "online",
    "version": "1.0.0"
  }
}
```

✅ Se você viu esse JSON, a API está funcionando corretamente!

---

## 💡 Conceitos importantes

### O que é uma API REST?

Uma API REST é um servidor que expõe **recursos** (fotos, usuários, álbuns) através de **endpoints** (endereços URL). O cliente (navegador/Vue) faz requisições HTTP e o servidor devolve dados em JSON.

### Verbos HTTP

| Verbo      | Para que serve        | Exemplo                  |
| ---------- | --------------------- | ------------------------ |
| `GET`    | Buscar/ler dados      | Listar todas as fotos    |
| `POST`   | Criar um novo recurso | Fazer upload de uma foto |
| `PUT`    | Atualizar um recurso  | Editar dados de uma foto |
| `DELETE` | Remover um recurso    | Deletar uma foto         |

### Status Codes

| Código | Significado                               |
| ------- | ----------------------------------------- |
| `200` | OK — requisição bem-sucedida           |
| `201` | Created — recurso criado com sucesso     |
| `400` | Bad Request — dados inválidos           |
| `401` | Unauthorized — não autenticado          |
| `403` | Forbidden — sem permissão               |
| `404` | Not Found — recurso não encontrado      |
| `500` | Internal Server Error — erro no servidor |

### O que é CORS?

CORS (Cross-Origin Resource Sharing) é uma permissão que o servidor dá para origens externas chamá-lo.

Como o front-end (porta `5173`) e a API (porta `3000`) rodam em portas diferentes, o navegador bloqueia a comunicação por segurança. O CORS no `server.js` libera explicitamente apenas o front-end autorizado:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL, // http://localhost:5173
}));
```

### Padrão de resposta JSON

Toda resposta da API segue o mesmo formato:

```json
// Sucesso
{ "success": true,  "message": "...", "data": { } }

// Erro
{ "success": false, "message": "...", "errors": [ ] }
```

---

## 🖥️ Parte B — Rodando o Front-end (`photosphere-frontend`)

### O que é o front-end?

O front-end é a interface visual que o usuário vê no navegador. Ele roda na **porta 5173** (Vite), consome os dados da API e os exibe de forma visual.

```
Usuário → Navegador (Vue - porta 5173) → API (Express - porta 3000)
```

### Estrutura de pastas do front-end

```
photosphere-frontend/
├── public/              ← arquivos estáticos (favicon, imagens públicas)
├── src/
│   ├── App.vue          ← componente raiz, envolve toda a aplicação
│   ├── main.js          ← ponto de entrada, inicializa o Vue
│   ├── router/          ← mapeia URLs para Views (Vue Router)
│   ├── stores/          ← estado global da aplicação (Pinia)
│   ├── views/           ← páginas inteiras (HomeView, LoginView, etc.)
│   ├── components/      ← peças reutilizáveis (Navbar, Card, Modal, etc.)
│   └── services/        ← funções que se comunicam com a API
├── .env                 ← variáveis de ambiente (não sobe pro Git)
├── .gitignore
├── index.html           ← HTML raiz — o Vue é injetado aqui
├── package.json
└── vite.config.js       ← configurações do Vite
```

### Passo a passo para criar e rodar

**1. Volte para a pasta raiz do projeto:**

```bash
cd ..
```

**2. Crie o projeto Vue com Vite:**

```bash
npm create vue@latest photosphere-frontend
```

Responda o assistente interativo assim:

| Pergunta                      | Resposta                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| Use TypeScript?               | **No**                                                 |
| Select features:              | **Router** e **Pinia** (espaço para selecionar) |
| Select experimental features: | **Enter** (nenhuma)                                    |
| Skip example code?            | **Yes**                                                |

**3. Entre na pasta e instale as dependências:**

```bash
cd photosphere-frontend
npm install
```

**4. Crie as pastas que faltam:**

```bash
mkdir src/views src/components src/services
```

**5. Crie o arquivo `.env`** na raiz de `photosphere-frontend`:

```env
VITE_API_URL=http://localhost:3000/api
```

> ⚠️ O Vite só expõe variáveis com prefixo `VITE_` ao navegador.
> No código Vue, acesse com: `import.meta.env.VITE_API_URL`

**6. Rode o servidor de desenvolvimento:**

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no navegador.

> 📌 O Vite tem **hot reload** — qualquer mudança salva no código aparece no navegador automaticamente, sem precisar recarregar a página.

### Estrutura de Views criadas

```
src/views/
├── HomeView.vue           → /              (Landing Page)
├── LoginView.vue          → /login
├── RegisterView.vue       → /register
├── ExploreView.vue        → /explore
├── FeedView.vue           → /feed
├── UploadView.vue         → /upload
├── AlbumsView.vue         → /albums
├── AlbumDetailView.vue    → /albums/:id
├── PhotoDetailView.vue    → /photo/:id
├── ProfileView.vue        → /profile/:username
├── SettingsView.vue       → /settings
└── admin/
    ├── AdminDashboardView.vue   → /admin
    ├── AdminCategoriesView.vue  → /admin/categories
    ├── AdminUsersView.vue       → /admin/users
    └── AdminModerationView.vue  → /admin/moderation
```

---

## 🔗 Marco de Integração — Front-end consumindo a API

A Landing Page (`/`) consome automaticamente o endpoint `GET /api` e exibe o status da API em tempo real:

```
Vue (porta 5173) ──── GET /api ────► Express (porta 3000)
                 ◄─── { status: "online" } ────
```

O badge na Landing Page passa por três estados:

- ⏳ **verificando...** — enquanto aguarda a resposta
- ✅ **online** — API respondeu com sucesso
- ❌ **offline** — API não está rodando ou não respondeu

> Para ver o badge **online**, a API precisa estar rodando (`node server.js`) antes de acessar o front-end.

---

## 📦 Dependências

### API (`photosphere-api`)

| Pacote      | Para que serve                                |
| ----------- | --------------------------------------------- |
| `express` | Framework web para criar rotas e o servidor   |
| `cors`    | Libera requisições entre origens diferentes |
| `dotenv`  | Lê variáveis do arquivo`.env`             |

### Front-end (`photosphere-frontend`)

| Pacote         | Para que serve                             |
| -------------- | ------------------------------------------ |
| `vue`        | Framework JavaScript reativo               |
| `vue-router` | Gerencia navegação entre páginas (SPA)  |
| `pinia`      | Gerencia estado global da aplicação      |
| `vite`       | Servidor de desenvolvimento com hot reload |

---

## ✅ Checklist da Atividade 1

### Parte A — Backend

- [X] Node.js v24 instalado
- [X] Projeto criado com `npm init -y`
- [X] Dependências instaladas: `express`, `cors`, `dotenv`
- [X] Estrutura de pastas: `bin/`, `config/`, `middlewares/`, `modules/`, `routes/`
- [X] `.env` configurado com `PORT` e `FRONTEND_URL`
- [X] Padrão de resposta JSON em `middlewares/apiResponse.js`
- [X] Rota pública `GET /api` retornando `status: "online"`
- [X] CORS configurado autorizando `http://localhost:5173`
- [X] API testada no navegador ✅

### Parte B — Frontend

- [X] Projeto criado com `npm create vue@latest` (Vite + Vue 3)
- [X] Vue Router e Pinia configurados
- [X] Estrutura de pastas: `views/`, `components/`, `services/`, `stores/`
- [X] `.env` configurado com `VITE_API_URL`
- [X] Vue Router com todas as 15 rotas do sistema
- [X] Layout base: `AppNavbar` + `RouterView` + `AppFooter`
- [X] `services/api.js` centralizando comunicação com a API
- [X] Landing Page exibindo badge `✅ online` ← **marco visual** ✅

---

## 👤 Autor

**Mark V** — Disciplina de Programação Web
Projeto: **PhotoSphere** (#15 da Lista de Projetos)

---

## 📬 Entrega 1

### Checklist de itens para entrega

- [ ] `Funcionalidades-e-Telas.md` dentro de `01 - Docs/`
- [ ] `checklists.md` dentro de `01 - Docs/`
- [ ] `curl-api.jpg` dentro de `01 - Docs/`
- [ ] `landing-status.jpg` dentro de `01 - Docs/`
- [ ] `erro-cors.jpg` dentro de `01 - Docs/`
- [ ] `MarcosVinicius-PhotoSphere-backend.zip` (sem `node_modules/`)
- [ ] `MarcosVinicius-PhotoSphere-frontend.zip` (sem `node_modules/`)

---

### Passo a passo para completar a entrega

#### 📁 1. Os arquivos markdown já foram criados

Os arquivos `Funcionalidades-e-Telas.md` e `checklists.md` já estão em:

```
photosphere-frontend/01 - Docs/
```

---

#### 🖼️ 2. Print: `curl-api.jpg`

**O que é o `curl`?**
`curl` é uma ferramenta de linha de comando que faz requisições HTTP — funciona como um "navegador de terminal". Serve para testar APIs sem abrir o browser.

**Como fazer:**

1. Abra um terminal **novo** (o servidor da API deve estar rodando em outro terminal)
2. Execute:

```powershell
curl http://localhost:3000/api
```

3. Deve retornar:

```json
{"success":true,"message":"PhotoSphere API online","data":{"status":"online","version":"1.0.0"}}
```

4. **Tire um print** da tela do terminal com o comando e a resposta
5. Salve como `curl-api.jpg` dentro de `photosphere-frontend/01 - Docs/`

---

#### 🖼️ 3. Print: `landing-status.jpg`

**Como fazer:**

1. Certifique-se que **ambos** os servidores estão rodando:
   - Terminal 1: `node server.js` (dentro de `photosphere-api/`)
   - Terminal 2: `npm run dev` (dentro de `photosphere-frontend/`)
2. Acesse `http://localhost:5173` no navegador
3. Aguarde o badge mudar de "⏳ verificando..." para "✅ online"
4. **Tire um print** da página mostrando o badge verde
5. Salve como `landing-status.jpg` dentro de `photosphere-frontend/01 - Docs/`

---

#### 🖼️ 4. Print: `erro-cors.jpg`

**O que é o erro de CORS e como reproduzi-lo?**

O CORS é o mecanismo que autoriza o browser a fazer requisições entre origens diferentes.
Para reproduzir o erro, basta **remover ou alterar** o CORS da API temporariamente.

**Como fazer:**

1. Abra `photosphere-api/server.js`
2. **Comente** a linha do `app.use(cors(...))`:

```js
// app.use(cors({ ... }))   ← comente assim
```

3. Reinicie a API (`Ctrl+C` e `node server.js` de novo)
4. Acesse `http://localhost:5173` no navegador
5. Abra as **Ferramentas do Desenvolvedor** (`F12`) → aba **Console**
6. Você verá o erro em vermelho:

```
Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:5173'
has been blocked by CORS policy...
```

7. **Tire o print** mostrando o erro no Console (ou na aba Network)
8. Agora **descomente** a linha do CORS, reinicie a API e confirme que voltou a funcionar
9. Salve o print como `erro-cors.jpg` dentro de `photosphere-frontend/01 - Docs/`

---

#### 📦 5. Gerar os arquivos `.zip`

> ⚠️ Os `.zip` devem ser gerados **sem a pasta `node_modules/`** — ela é enorme e desnecessária, pois qualquer um pode recriar com `npm install`.

**Backend:**

1. Abra o explorador de arquivos
2. Navegue até a pasta `Photosphere/`
3. Clique com botão direito em `photosphere-api/`
4. Escolha **"Enviar para" → "Pasta compactada"** (ou use WinRAR/7-Zip)
5. Antes de compactar, **exclua** a pasta `node_modules/` de dentro do zip
6. Renomeie o arquivo para: `MarcosVinicius-PhotoSphere-backend.zip`

**Frontend:**

1. Clique com botão direito em `photosphere-frontend/`
2. Escolha **"Enviar para" → "Pasta compactada"**
3. Antes de compactar, **exclua** as pastas `node_modules/` de dentro do zip
4. Renomeie o arquivo para: `MarcosVinicius-PhotoSphere-frontend.zip`

> 💡 **Dica mais fácil:** Use o PowerShell para criar os zips sem o `node_modules/` automaticamente:
>
> ```powershell
> # ZIP do backend (rode na pasta Photosphere/)
> Compress-Archive -Path photosphere-api\* -DestinationPath MarcosVinicius-PhotoSphere-backend.zip -ExcludePath photosphere-api\node_modules
>
> # ZIP do frontend (rode na pasta Photosphere/)
> Compress-Archive -Path photosphere-frontend\* -DestinationPath MarcosVinicius-PhotoSphere-frontend.zip -ExcludePath photosphere-frontend\node_modules
> ```
