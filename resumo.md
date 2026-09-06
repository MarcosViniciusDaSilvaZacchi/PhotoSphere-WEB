# Resumo — Atividade 1: Setup da Aplicação

**Disciplina:** Programação Web (FrontEnd)
**Projeto:** PhotoSphere — Plataforma de Compartilhamento de Fotos
**Aluno:** Marcos Vinicius

---

## 1. Contexto e Objetivo

O PhotoSphere é uma plataforma web de compartilhamento de fotos onde usuários podem fazer upload de imagens, organizar álbuns, curtir e comentar publicações de outros usuários, e seguir perfis. A plataforma também conta com uma área administrativa para moderação de conteúdo e gerenciamento de categorias.

A primeira atividade da disciplina teve como objetivo construir o **alicerce técnico** da aplicação: configurar o ambiente de desenvolvimento, criar a estrutura de pastas de ambos os projetos (API e front-end), e realizar o **primeiro marco de integração** — provar que o front-end já consegue se comunicar com o back-end.

A arquitetura adotada é a de **separação total entre front-end e back-end**, dois projetos independentes que se comunicam via HTTP:

```
┌─────────────────────────────────────────────────────┐
│                    Navegador                        │
│          Vue.js rodando na porta 5173               │
│   (interface visual, lógica de apresentação)        │
└───────────────────┬─────────────────────────────────┘
                    │ requisições HTTP (fetch)
                    ▼
┌─────────────────────────────────────────────────────┐
│                  Servidor Node.js                   │
│          Express.js rodando na porta 3000           │
│    (regras de negócio, dados, autenticação)         │
└─────────────────────────────────────────────────────┘
```

Essa separação é o modelo mais utilizado no mercado hoje: o back-end fornece uma **API REST** que devolve dados em JSON, e o front-end consome esses dados e monta a interface visual.

---

## 2. Pré-requisitos e Configuração do Ambiente

### 2.1 Node.js

O Node.js é um **runtime** de JavaScript — um ambiente que permite executar código JavaScript fora do navegador, diretamente no sistema operacional. Sem ele, não é possível rodar a API nem criar o projeto Vue.

Ele vem acompanhado do **npm** (Node Package Manager), o gerenciador de pacotes que permite instalar bibliotecas de terceiros com um único comando.

Após instalar o Node.js v24 (versão LTS) pelo instalador oficial do site [nodejs.org](https://nodejs.org), a verificação no terminal confirmou a instalação:

```powershell
node -v
# v24.19.0

npm -v
# 11.x.x
```

### 2.2 Política de execução do PowerShell

O Windows, por padrão, bloqueia a execução de scripts no PowerShell por segurança. O npm utiliza scripts `.ps1` internamente, então foi necessário liberar essa política para o usuário atual:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

O parâmetro `RemoteSigned` permite rodar scripts criados localmente sem assinatura digital, enquanto exige assinatura para scripts baixados da internet. O `Scope CurrentUser` garante que a mudança afeta apenas o perfil do usuário atual, sem alterar as configurações do sistema.

---

## 3. Parte A — Construç ão da API (Back-end)

### 3.1 O que é uma API REST?

Uma **API REST** (Representational State Transfer) é um servidor que expõe recursos através de URLs chamadas **endpoints**. O cliente (neste caso, o Vue) faz requisições HTTP indicando **o que quer fazer** através do verbo HTTP, e o servidor responde com dados em JSON.

Os verbos HTTP e seus significados:

| Verbo      | Significado           | Exemplo no PhotoSphere     |
| ---------- | --------------------- | -------------------------- |
| `GET`    | Buscar/ler dados      | Listar todas as fotos      |
| `POST`   | Criar um novo recurso | Fazer upload de uma foto   |
| `PUT`    | Atualizar um recurso  | Editar legenda de uma foto |
| `DELETE` | Remover um recurso    | Deletar uma foto           |

Cada resposta também traz um **status code** numérico que indica o resultado:

| Código                       | Significado                |
| ----------------------------- | -------------------------- |
| `200 OK`                    | Requisição bem-sucedida  |
| `201 Created`               | Recurso criado com sucesso |
| `400 Bad Request`           | Dados inválidos enviados  |
| `401 Unauthorized`          | Não autenticado           |
| `404 Not Found`             | Recurso não encontrado    |
| `500 Internal Server Error` | Erro no servidor           |

### 3.2 Criando o projeto

O projeto da API foi criado do zero, sem scaffolding automático, seguindo as instruções do enunciado:

```powershell
# Criar a pasta e entrar nela
mkdir photosphere-api
cd photosphere-api

# Inicializar o projeto Node — cria o package.json
npm init -y
```

O `package.json` gerado é o **"documento de identidade"** do projeto. Ele registra o nome, a versão e, futuramente, todas as dependências instaladas:

```json
{
  "name": "photosphere-api",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "license": "ISC"
}
```

### 3.3 Instalando as dependências

Com o projeto inicializado, foram instaladas três bibliotecas essenciais:

```powershell
npm install express cors dotenv
```

- **express** → framework web minimalista para Node.js, responsável por criar rotas e gerenciar requisições/respostas HTTP
- **cors** → middleware que configura os cabeçalhos HTTP necessários para permitir requisições entre origens diferentes
- **dotenv** → carrega variáveis de configuração a partir de um arquivo `.env`, mantendo dados sensíveis fora do código-fonte

Após a instalação, o `package.json` passou a registrar as dependências:

```json
"dependencies": {
  "cors": "^2.x.x",
  "dotenv": "^16.x.x",
  "express": "^5.x.x"
}
```

A pasta `node_modules/` foi criada automaticamente com os 70 pacotes necessários (as três bibliotecas mais todas as suas dependências internas).

### 3.4 Estrutura de pastas

A estrutura de pastas foi criada seguindo o padrão modular exigido pelo enunciado:

```powershell
mkdir bin, config, middlewares, modules, routes
```

Resultado final:

```
photosphere-api/
├── bin/              ← scripts de inicialização do servidor
├── config/           ← configurações globais (banco de dados, etc.)
├── middlewares/      ← funções intermediárias entre requisição e resposta
│   └── apiResponse.js
├── modules/          ← funcionalidades do sistema (fotos, usuários, álbuns)
├── routes/           ← definição dos endpoints da API
│   └── index.js
├── node_modules/     ← dependências instaladas (não sobe pro Git)
├── .env              ← variáveis de ambiente
├── .gitignore        ← arquivos ignorados pelo Git
├── package.json
├── package-lock.json ← versões exatas das dependências
└── server.js         ← ponto de entrada do servidor
```

### 3.5 Variáveis de ambiente (.env)

Informações de configuração que podem mudar entre ambientes (desenvolvimento, produção) foram isoladas no arquivo `.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Este arquivo **nunca é enviado ao repositório Git** (está listado no `.gitignore`), pois pode conter senhas e chaves de API. Cada desenvolvedor cria o seu localmente.

### 3.6 Padrão de resposta — apiResponse.js

Um dos requisitos do enunciado era definir um **padrão único de resposta JSON** para toda a API. Isso garante que o front-end sempre receba os dados no mesmo formato, independente do endpoint:

```js
// middlewares/apiResponse.js
const apiResponse = (req, res, next) => {
  // Resposta de SUCESSO
  res.success = (message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  // Resposta de ERRO
  res.error = (message, errors = null, statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  };

  next(); // passa para o próximo middleware ou rota
};

module.exports = apiResponse;
```

Com isso, qualquer rota da API pode responder com `res.success(...)` ou `res.error(...)`, e o formato JSON será sempre:

```json
// Sucesso
{ "success": true, "message": "...", "data": { } }

// Erro
{ "success": false, "message": "...", "errors": [ ] }
```

### 3.7 CORS — comunicação entre origens

O **CORS** (Cross-Origin Resource Sharing) é um mecanismo de segurança dos navegadores. Quando o front-end (rodando na porta 5173) tenta fazer uma requisição para a API (porta 3000), o navegador entende que são **origens diferentes** e bloqueia a requisição por padrão.

```
❌ Sem CORS configurado:
Vue (localhost:5173) ──── GET /api ────► API (localhost:3000)
                     ◄─── BLOQUEADO pelo browser ────

✅ Com CORS configurado:
Vue (localhost:5173) ──── GET /api ────► API (localhost:3000)
                     ◄─── 200 OK + dados ────
```

O servidor precisa retornar cabeçalhos HTTP específicos autorizando a origem do front-end. No Express, isso é feito pelo middleware `cors`:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL, // http://localhost:5173
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 3.8 O servidor (server.js)

O arquivo `server.js` é o ponto de entrada da aplicação — ele junta todos os middlewares e rotas e inicializa o servidor:

```js
require('dotenv').config(); // carrega o .env

const express = require('express');
const cors    = require('cors');
const apiResponse = require('./middlewares/apiResponse');
const routes  = require('./routes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());      // interpreta corpo das requisições como JSON
app.use(apiResponse);         // adiciona res.success() e res.error()

app.use('/api', routes);      // monta as rotas em /api

app.listen(PORT, () => {
  console.log(`✅ PhotoSphere API rodando em http://localhost:${PORT}`);
});
```

Com a API rodando, a rota `GET /api` pode ser testada diretamente no navegador ou via `curl` no terminal:

```powershell
curl http://localhost:3000/api
```

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

---

## 4. Parte B — Construção do Front-end (Vue.js)

### 4.1 O que é o Vue.js e o Vite?

**Vue.js** é um framework JavaScript progressivo para construção de interfaces de usuário. Ele segue o modelo de **componentes** — cada parte da interface (navbar, card de foto, modal) é encapsulada em um arquivo `.vue` com seu próprio HTML, JavaScript e CSS.

**Vite** é o servidor de desenvolvimento e bundler utilizado pelo Vue. Ele é extremamente rápido e possui **hot reload**: qualquer alteração salva no código aparece instantaneamente no navegador, sem precisar recarregar a página manualmente.

O projeto foi criado com a ferramenta oficial `create-vue`:

```powershell
npm create vue@latest photosphere-frontend
```

Durante a criação, foram selecionados dois recursos adicionais:

- **Vue Router** → gerenciamento de navegação entre páginas
- **Pinia** → gerenciamento de estado global da aplicação

### 4.2 Single Page Application (SPA)

O Vue cria uma **SPA** — Single Page Application. Isso significa que existe apenas um arquivo HTML (`index.html`) e o Vue injeta o conteúdo dinamicamente conforme o usuário navega. A página **nunca recarrega de verdade**.

```
index.html (único arquivo HTML)
  └── <div id="app">
        └── App.vue (sempre visível)
              ├── AppNavbar.vue  ← fixo
              ├── <RouterView /> ← troca conforme a URL
              └── AppFooter.vue  ← fixo
```

O Vue Router intercepta os cliques nos links e troca apenas o componente dentro do `<RouterView />`, dando a sensação de navegação sem recarregar.

### 4.3 Estrutura de pastas

```
photosphere-frontend/src/
├── App.vue              ← componente raiz
├── main.js              ← ponto de entrada, inicializa o Vue
├── router/
│   └── index.js         ← mapeamento URL → View
├── stores/              ← estado global (Pinia)
├── views/               ← páginas completas da aplicação
│   ├── HomeView.vue     → /
│   ├── LoginView.vue    → /login
│   ├── FeedView.vue     → /feed
│   └── ...
├── components/          ← peças reutilizáveis
│   ├── AppNavbar.vue
│   └── AppFooter.vue
└── services/
    └── api.js           ← comunicação com a API
```

### 4.4 Vue Router — mapeando as telas

O Vue Router associa cada URL a uma View. O arquivo `router/index.js` define todas as rotas do sistema:

```js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView    from '@/views/HomeView.vue'
import LoginView   from '@/views/LoginView.vue'
import FeedView    from '@/views/FeedView.vue'
// ... demais imports

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',                 name: 'home',    component: HomeView },
    { path: '/login',            name: 'login',   component: LoginView },
    { path: '/feed',             name: 'feed',    component: FeedView },
    { path: '/photo/:id',        name: 'photo',   component: PhotoDetailView },
    { path: '/profile/:username',name: 'profile', component: ProfileView },
    // ... 16 rotas no total
  ],
})

export default router
```

As rotas com `:id` e `:username` são **rotas dinâmicas** — o valor é capturado da URL e fica disponível na View via `route.params`. Por exemplo, `/photo/42` faz com que `route.params.id === '42'`.

O sistema possui **16 rotas** no total, divididas em três grupos:

| Grupo                | Rotas | Exemplo                                             |
| -------------------- | ----- | --------------------------------------------------- |
| Públicas            | 4     | `/`, `/login`, `/register`, `/explore`      |
| Usuário autenticado | 8     | `/feed`, `/upload`, `/albums`, `/photo/:id` |
| Administrador        | 4     | `/admin`, `/admin/categories`, `/admin/users` |

### 4.5 Componentes Vue — anatomia de um .vue

Cada arquivo `.vue` possui até três seções:

```vue
<script setup>
// Lógica JavaScript do componente
import { ref, onMounted } from 'vue'

const titulo = ref('PhotoSphere') // variável reativa
</script>

<template>
  <!-- HTML do componente -->
  <h1>{{ titulo }}</h1>
</template>

<style scoped>
/* CSS exclusivo deste componente */
h1 { color: #1a1a2e; }
</style>
```

O `<script setup>` utiliza a **Composition API** do Vue 3 — o estilo moderno de escrever componentes. O `scoped` no `<style>` garante que os estilos CSS só afetam este componente, evitando conflitos.

### 4.6 Reatividade com ref()

O Vue atualiza a tela automaticamente quando uma variável reativa muda. O `ref()` é a forma de criar essas variáveis:

```js
const loading   = ref(true)   // começa como true
const apiStatus = ref(null)   // começa como null

// quando apiStatus.value muda, o HTML atualiza sozinho:
apiStatus.value = 'online'    // ← o badge na tela muda imediatamente
```

No template, `v-if`, `v-else-if` e `v-else` controlam o que é exibido:

```html
<span v-if="loading">⏳ verificando...</span>
<span v-else-if="error">❌ offline</span>
<span v-else>✅ {{ apiStatus }}</span>
```

### 4.7 Service de API — services/api.js

Toda a comunicação com a API foi centralizada em um único arquivo de serviço. Isso evita repetição de código e facilita manutenção — se a URL da API mudar, basta alterar em um único lugar:

```js
// services/api.js
const BASE_URL = import.meta.env.VITE_API_URL // lê o .env

async function get(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`)
  if (!response.ok) throw new Error(`Erro: ${response.status}`)
  return response.json()
}

async function checkStatus() {
  const result = await get('/')
  return result.data // { status: 'online', version: '1.0.0' }
}

export const apiService = { get, checkStatus }
```

O `fetch()` é a API nativa do navegador para fazer requisições HTTP. O `async/await` torna o código assíncrono mais legível — sem ele, seria necessário encadear `.then().catch()`.

---

## 5. Marco de Integração — Front-end conversando com a API

O objetivo final da atividade foi fazer a Landing Page consumir a rota `GET /api` e exibir o status em tempo real. Isso comprova que os dois projetos estão se comunicando corretamente.

Na `HomeView.vue`, o `onMounted()` executa assim que o componente aparece na tela e faz a requisição à API:

```js
onMounted(async () => {
  try {
    const data = await apiService.checkStatus()
    apiStatus.value = data.status     // 'online'
  } catch (err) {
    error.value = 'Não foi possível conectar à API.'
  } finally {
    loading.value = false
  }
})
```

O fluxo completo de comunicação:

```
1. Usuário acessa http://localhost:5173
2. Vue carrega o App.vue → monta a HomeView
3. onMounted() executa → chama apiService.checkStatus()
4. fetch('http://localhost:3000/api') é disparado
5. O navegador verifica os cabeçalhos CORS da resposta
6. API responde: { success: true, data: { status: 'online' } }
7. apiStatus.value = 'online'
8. Vue detecta a mudança e atualiza o badge na tela: ✅ online
```

Com os dois servidores rodando simultaneamente — API na porta 3000 e Vue na porta 5173 — o badge verde `✅ online` aparece na Landing Page, confirmando a integração bem-sucedida.

---

## 6. Conclusão

Ao final da Atividade 1, foram construídos dois projetos completos e funcionais do zero:

**Back-end (photosphere-api):**

- Servidor Node.js + Express na porta 3000
- Estrutura modular com middlewares, rotas e configurações isoladas
- Padrão único de resposta JSON
- CORS configurado via variáveis de ambiente
- Endpoint público `GET /api` respondendo corretamente

**Front-end (photosphere-frontend):**

- Aplicação Vue 3 + Vite na porta 5173
- 16 rotas mapeadas com Vue Router, cobrindo todas as funcionalidades do sistema
- Layout base com Navbar e Footer presentes em todas as páginas
- Camada de serviço centralizada para comunicação com a API
- Landing Page exibindo o status da API em tempo real

A arquitetura de separação entre front-end e back-end, a comunicação via HTTP/JSON e o gerenciamento de CORS são fundamentos que sustentarão todas as funcionalidades a serem desenvolvidas nas próximas aulas da disciplina.

---

# Resumo — Atividade 2: Primeiro Módulo de Domínio e Camada de Serviços

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere — Plataforma de Compartilhamento de Fotos  
**Aluno:** Marcos Vinicius  

---

## 7. Contexto e Evolução Arquitetural da Atividade 2

Na Atividade 1 foi construída a infraestrutura fundamental (setup, portas, CORS e integração inicial). Na **Atividade 2**, o objetivo principal foi estabelecer os **padrões arquiteturais definitivos** que guiarão o desenvolvimento de todas as rotas futuras tanto no back-end quanto no front-end.

Dois grandes pilares foram desenvolvidos:
1. **No Back-end:** A implementação da arquitetura em **3 Camadas (Route -> Controller -> Service)** no primeiro módulo de domínio da aplicação (`modules/search`).
2. **No Front-end:** A centralização do cliente HTTP com **Axios**, substituindo requisições brutas com `fetch` e implementando um **Interceptor de Resposta com tratamento padronizado de erros em 3 ramos**.

---

## 8. Parte A — Back-end: O Padrão de Camadas da API

### 8.1 Por que separar em Camadas? (Route vs Controller vs Service)

Mesmo para uma rota inicial simples como a de busca — que ainda não consulta um banco de dados real —, a divisão de responsabilidades é essencial para garantir manutenibilidade e escalabilidade do software.

```
Cliente HTTP (Vue) 
       │  requisição GET /api/search?q=praia
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. ROUTE (searchRoutes.js)                                  │
│    Apenas mapeia: verbo GET + caminho /search               │
│    Encaminha para a função searchController.search          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CONTROLLER (searchController.js)                         │
│    Lê a requisição (req.query.q), valida parâmetros         │
│    Chama a camada de serviço (searchService.globalSearch)   │
│    Formata a saída usando res.success() ou res.error()      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SERVICE (searchService.js)                               │
│    Contém a regra de negócio e o acesso aos dados.          │
│    Hoje retorna listas vazias fixas; no futuro fará as      │
│    consultas reais no banco de dados.                       │
└─────────────────────────────────────────────────────────────┘
```

**Vantagem prática:** O contrato que o `Controller` expõe para a aplicação cliente nunca muda. Quando o banco de dados for adicionado nas aulas futuras, **apenas o `searchService.js` será alterado**. As rotas, os controllers e todo o front-end permanecerão intactos.

### 8.2 Implementação do Módulo Search

#### 1. Camada de Serviço (`modules/search/searchService.js`)
Responsável exclusivamente pelas regras de dados da entidade principal do PhotoSphere (`fotos`) e dos usuários:

```javascript
/**
 * Camada de acesso a dados do módulo de busca.
 * Na Aula 02 devolve listas vazias fixas simulando o formato esperado.
 */
function globalSearch(query) {
  return { 
    fotos: [], 
    users: [] 
  };
}

module.exports = { globalSearch };
```

#### 2. Camada de Controle (`modules/search/searchController.js`)
Extrai a query de busca enviada pelo cliente e utiliza o middleware `apiResponse` criado na Aula 01 para padronizar o envelope da resposta:

```javascript
const searchService = require('./searchService');

function search(req, res) {
  // Lê o parâmetro 'q' da URL (?q=termo), ou assume string vazia se ausente
  const query = req.query.q || '';
  const result = searchService.globalSearch(query);

  res.success('Busca realizada com sucesso', {
    query,
    fotos: result.fotos,
    users: result.users,
  });
}

module.exports = { search };
```

#### 3. Camada de Rotas (`modules/search/searchRoutes.js`)
Associa o endpoint público ao método do controller:

```javascript
const express = require('express');
const router = express.Router();
const searchController = require('./searchController');

// Rota pública de busca global
router.get('/search', searchController.search);

module.exports = router;
```
> **Nota técnica:** Passa-se `searchController.search` como referência de função (sem parênteses), para que o Express a execute sob demanda a cada requisição que chegar.

### 8.3 Registro do Módulo em `server.js`

No arquivo principal do servidor, o novo roteador foi acoplado ao prefixo `/api`:

```javascript
const searchRoutes = require('./modules/search/searchRoutes');

// ... outros middlewares ...

app.use('/api', routes);
app.use('/api', searchRoutes); // Monta /api/search
```

### 8.4 Testes Isolados de Validação da API

A validação foi feita no terminal utilizando chamadas com `curl.exe`:

1. **Busca com parâmetro de consulta:**
   ```powershell
   curl.exe "http://localhost:3000/api/search?q=teste"
   ```
   **Resposta:**
   ```json
   {"success":true,"message":"Busca realizada com sucesso","data":{"query":"teste","fotos":[],"users":[]}}
   ```

2. **Busca sem parâmetro (busca geral vazia):**
   ```powershell
   curl.exe "http://localhost:3000/api/search"
   ```
   **Resposta:**
   ```json
   {"success":true,"message":"Busca realizada com sucesso","data":{"query":"","fotos":[],"users":[]}}
   ```

3. **Verificação de integridade da rota base:**
   ```powershell
   curl.exe http://localhost:3000/api
   # Confirmou status 'online' sem quebras ou regressões
   ```

---

## 9. Parte B — Front-end: Camada de Serviços e Centralização com Axios

### 9.1 Limitações do Fetch Nativo e por que migrar para Axios

No setup da Aula 01, o `fetch()` nativo do navegador foi usado diretamente no `HomeView.vue`. Se esse padrão continuasse à medida que o sistema ganhasse 16 telas, teríamos problemas graves:
- A URL base da API estaria duplicada em dezenas de arquivos.
- Cada componente precisaria chamar manualmente `.json()`.
- O `fetch` nativo **não** rejeita a Promise em erros HTTP como 400, 401 ou 500 — exigindo validações manuais repetitivas com `if (!response.ok)` em cada chamada.

A solução profissional adotada foi a instalação do **Axios** e a criação de uma **camada de serviços dedicada** (`src/services/`).

```powershell
npm install axios
```

### 9.2 Instância Central e Interceptor em `src/services/api.js`

O arquivo `src/services/api.js` é o **único** arquivo de toda a aplicação Vue que importa o Axios diretamente. Todos os outros serviços consomem a instância pré-configurada `api`.

O grande destaque técnico da Atividade 2 é o **Interceptor de Resposta**, que funciona como um filtro global para todas as requisições HTTP da aplicação:

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  // 1. RAMO DE SUCESSO
  (response) => response.data,

  // 2, 3 e ELSE: RAMOS DE TRATAMENTO DE ERRO
  (error) => {
    if (error.response) {
      // RAMO 2: A API respondeu, mas com status de erro (4xx ou 5xx)
      const apiError = error.response.data
      return Promise.reject({
        message: apiError.message || 'Ocorreu um erro na requisição.',
        errors: apiError.errors || [],
        status: error.response.status,
      })
    } else if (error.request) {
      // RAMO 3: Requisição enviada, mas sem resposta (servidor desligado ou sem rede)
      return Promise.reject({
        message: 'Não foi possível se conectar ao servidor. Verifique sua conexão ou tente mais tarde.',
        errors: [],
        status: null,
      })
    } else {
      // RAMO ELSE: Erro na preparação da requisição
      return Promise.reject({
        message: 'Erro inesperado ao preparar a requisição.',
        errors: [],
        status: null,
      })
    }
  }
)

export default api
```

#### Detalhamento Didático dos 3 Ramos do Interceptor:

1. **Ramo de Sucesso `(response) => response.data`:**
   - O Axios por padrão envolve a resposta em um objeto com cabeçalhos, status e configurações.
   - Retornando diretamente `response.data`, "descascamos" esse invólucro do Axios. Os componentes e services já recebem direto o payload do backend: `{ success: true, message, data }`.

2. **Ramo de Erro de API `if (error.response)`:**
   - Ocorre quando a requisição chegou ao servidor e ele retornou um código de erro (como `400 Bad Request`, `401 Unauthorized` ou `404 Not Found`).
   - O interceptor extrai o JSON padronizado enviado pelo `apiResponse.js` do backend e rejeita a Promise mantendo o `{ message, errors, status }`.

3. **Ramo de Erro de Rede `else if (error.request)`:**
   - Ocorre quando a requisição foi disparada, mas o servidor está fora do ar (`ERR_CONNECTION_REFUSED`) ou o usuário perdeu a conexão com a internet.
   - Como não há corpo de resposta vindo do servidor, o interceptor gera uma mensagem clara, amigável e em português para a interface, em vez de deixar vazar um erro técnico ininteligível no console.

---

## 10. Módulos de Serviço no Front-end (Espelhamento 1-para-1)

Seguindo as boas práticas de arquitetura limpa, o front-end passa a espelhar a estrutura de módulos do back-end através da pasta `src/services/`:

### 10.1 `src/services/systemService.js`
Isola chamadas de sistema e saúde da API:
```javascript
import api from './api'

export function getApiStatus() {
  return api.get('/')
}
```

### 10.2 `src/services/searchService.js`
Isola a funcionalidade de busca global consumindo o endpoint `/search`:
```javascript
import api from './api'

export function search(query) {
  return api.get('/search', { params: { q: query } })
}
```

### 10.3 `src/services/authService.js`
Preparado como alicerce para as futuras telas de login e cadastro (autenticação):
```javascript
import api from './api'

export function login(email, password) {
  return api.post('/auth/login', { email, password })
}

export function register(userData) {
  return api.post('/auth/register', userData)
}

export function logout() {
  return api.post('/auth/logout')
}
```

---

## 11. Validação Prática e Experimentos com a Landing Page

O componente `src/views/HomeView.vue` foi atualizado para utilizar o novo `systemService` e o `searchService`.

### 11.1 Teste de Sucesso e Busca
No ciclo `onMounted()`, a consulta de status e um teste de busca com `search('a')` foram executados:
- O badge de status exibiu **`✅ online`** no navegador, comprovando que o Axios com interceptor de sucesso opera com perfeição.
- O console do desenvolvedor (F12) registrou o log da busca bem-sucedida:
  ```javascript
  Busca OK: { query: "a", fotos: [], users: [] }
  ```

### 11.2 Teste Forçado de Falha de Rede (Simulação de Indisponibilidade)
Para comprovar o funcionamento do **Ramo 3** do interceptor:
1. O processo da API foi interrompido no terminal com `Ctrl + C`.
2. A página foi recarregada no navegador (`Ctrl + Shift + R`).
3. O interceptor capturou a falha de conexão e emitiu no console a mensagem amigável padronizada:
   ```
   Erro ao consultar a API: Não foi possível se conectar ao servidor. Verifique sua conexão ou tente mais tarde.
   Erro na busca: Não foi possível se conectar ao servidor. Verifique sua conexão ou tente mais tarde.
   ```
   Sem estouro de exceções brutas não tratadas.

Após a coleta das evidências e validação, o bloco temporário de busca foi removido do `HomeView.vue`, mantendo o código limpo para as próximas etapas.

---

## 12. Conclusão Geral do Progresso (Atividades 1 e 2)

Com a conclusão da Atividade 2, o ecossistema do PhotoSphere atinge maturidade arquitetural completa para receber as regras de negócio:

| Camada | Estado Atual |
|---|---|
| **Back-end** | Arquitetura em 3 camadas (Rotas -> Controllers -> Services) padronizada no primeiro módulo de domínio (`search`), respostas unificadas e CORS restrito. |
| **Front-end** | Cliente Axios com baseURL dinâmica, tratamento centralizado de erros em 3 ramos, serviços modulares espelhando a API e Views desvinculadas de chamadas diretas de rede. |
| **Documentação** | Ficha técnica de preparação, tabelas de tradução de funcionalidades em telas, checklists detalhados e evidências em prints operacionais arquivados. |

---

# Resumo — Atividade 3: Persistência de Dados e Primeiro Cadastro Real

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere — Plataforma de Compartilhamento de Fotos  
**Aluno:** Marcos Vinicius  

---

## 13. Contexto e Objetivos da Atividade 3

Até a Atividade 2, a API funcionava sem persistência em disco — qualquer dado manipulado existia apenas em memória temporária. Na **Atividade 3**, a aplicação deu um salto de maturidade fundamental:
1. **No Back-end:** Conexão com banco relacional **MySQL** através do ORM **Sequelize**, criação do primeiro Model real (`User`), validação declarativa de payloads (`express-validator`), criptografia segura de senhas (`bcryptjs`) e tratamento robusto de erros assíncronos (`asyncHandler` + `errorHandler`).
2. **No Front-end:** Construção da tela de **Registro** (`RegisterView.vue`) com formulário controlado (`v-model`), validação client-side instantânea espelhando o servidor, integração com `authService.register()` e tratamento de erros de duplicidade.

---

## 14. Fundamentos Teóricos Obrigatórios

### 14.1 O que é um ORM e como funciona o `sync({ alter: true })`?
- **ORM (Object-Relational Mapping):** É uma técnica/biblioteca (como o Sequelize) que mapeia tabelas do banco de dados relacional para classes e objetos no código JavaScript. Em vez de escrever consultas SQL brutas como `SELECT * FROM users` ou `INSERT INTO users (...)`, utilizamos métodos orientados a objetos como `User.create(...)` e `User.findOne(...)`.
- **`sequelize.sync({ alter: true })`:** Analisa as definições dos Models no código e compara com o estado atual do banco MySQL. Se a tabela não existir, ela é criada (`CREATE TABLE`). Se colunas forem adicionadas ou alteradas no Model, o Sequelize executa comandos `ALTER TABLE` automaticamente sem apagar os dados existentes, sincronizando a estrutura do banco com o código.

### 14.2 Por que senhas nunca são salvas em texto puro e como o Bcrypt funciona?
- **Risco do texto puro:** Se o banco de dados sofrer um vazamento ou acesso indevido, senhas em texto puro expõem diretamente as credenciais dos usuários em outros serviços.
- **Hashing unidirecional com Salt:** O Bcrypt não é criptografia simétrica (que pode ser descriptografada); ele é uma função de hash criptográfica **unidirecional**.
  - **Salt:** Um valor aleatório de alta entropia gerado pelo `bcrypt.genSalt(10)` e anexado à senha antes do hash. O salt impede ataques de "Rainbow Tables" (tabelas de senhas pré-computadas).
  - **Verificação no Login (`bcrypt.compare`):** Como o hash não pode ser desfeito, no momento do login o sistema pega a senha digitada, aplica o mesmo salt gravado e gera um novo hash. Se o hash resultante for idêntico ao hash salvo no banco, a senha está correta.

### 14.3 Por que funções `async` precisam do `asyncHandler` no Express 4?
- No Express 4, erros síncronos lançados com `throw new Error(...)` são capturados nativamente pelo Express.
- No entanto, funções assíncronas (`async/await`) que lançam um erro rejeitam uma **Promise**. O Express 4 **não captura Promises rejeitadas automaticamente**. Sem um manipulador, a requisição ficaria pendurada indefinidamente até estourar timeout no cliente.
- O `asyncHandler` é um middleware de alta ordem que encapsula a função:
  ```javascript
  module.exports = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  ```
  Ele garante que qualquer rejeição de Promise seja encaminhada via `catch(next)` para o middleware de erro global (`errorHandler`).

### 14.4 Validação Client-Side vs Server-Side: Quem decide?
- **A validação no servidor (Server-side com `express-validator`) é a única que REALMENTE DECIDE.** Ela é a barreira de segurança definitiva. Qualquer cliente malicioso ou atacante pode burlar o navegador e chamar a API diretamente via Postman ou cURL.
- **A validação no cliente (Client-side no Vue) existe puramente por EXPERIÊNCIA DO USUÁRIO (UX).** Ela evita o atraso de uma requisição de rede e avisa instantaneamente se o e-mail é inválido ou a senha é curta antes de enviar os dados. Ela é uma réplica otimista das regras do backend.

---

## 15. Parte A — Implementação no Back-end (API)

### 15.1 Conexão Sequelize (`config/database.js`)
Configuração que lê as variáveis de ambiente do `.env`:
```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = sequelize;
```

### 15.2 Model de Usuário (`modules/user/userModel.js`)
Mapeia a tabela `users`, incluindo a entidade de contagem do PhotoSphere (`photosCount`):
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: 'idx_unique_username' },
  email: { type: DataTypes.STRING, allowNull: false, unique: 'idx_unique_email', validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.STRING(255), allowNull: true },
  profilePicture: { type: DataTypes.STRING, defaultValue: 'default-profile.png' },
  followersCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  followingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  photosCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true,
  tableName: 'users'
});

module.exports = User;
```

### 15.3 Validador Declarativo (`modules/user/userValidator.js`)
```javascript
const { body, validationResult } = require('express-validator');
const { VALIDATION } = require('../../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const firstError = errors.array()[0].msg;
  const error = new Error(firstError);
  error.status = 400;
  error.errors = errors.array();
  throw error;
};

exports.registerValidator = [
  body('username').isLength({ min: VALIDATION.USERNAME_MIN, max: VALIDATION.USERNAME_MAX }).withMessage('Usuário deve ter entre 3 e 20 caracteres.').trim(),
  body('email').isEmail().withMessage('Informe um e-mail válido.').normalizeEmail(),
  body('password').isLength({ min: VALIDATION.PASSWORD_MIN }).withMessage('A senha deve ter pelo menos 6 caracteres.'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('As senhas não coincidem.');
    return true;
  }),
  body('fullName').notEmpty().withMessage('O nome completo é obrigatório.').trim(),
  validate
];
```

### 15.4 Serviço com Bcrypt e Busca Segura (`modules/user/userService.js`)
```javascript
const User = require('./userModel');
const bcrypt = require('bcryptjs');

async function registerUser(username, email, password, fullName) {
  const emailExists = await User.findOne({ where: { email } });
  const usernameExists = await User.findOne({ where: { username } });

  if (emailExists || usernameExists) {
    throw new Error('Este e-mail ou usuário já está cadastrado.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    fullName
  });

  return { id: newUser.id, username: newUser.username, email: newUser.email };
}

async function getPublicProfile(username) {
  const user = await User.findOne({
    where: { username },
    attributes: ['id', 'username', 'fullName', 'bio', 'profilePicture', 'followersCount', 'followingCount', 'photosCount']
  });

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }
  return user;
}

module.exports = { registerUser, getPublicProfile };
```

---

## 16. Parte B — Implementação no Front-end (Tela de Registro)

### 16.1 Formulário Controlado e Validação (`RegisterView.vue`)
O componente implementa dois estados reativos principais com `reactive`:
- `form`: guarda os valores digitados em cada `input` via `v-model`.
- `errors`: armazena as mensagens de erro de cada campo para exibição imediata.

```javascript
function validate() {
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  if (!form.fullName.trim()) errors.fullName = 'O nome completo é obrigatório.'
  if (form.username.trim().length < 3 || form.username.trim().length > 20) {
    errors.username = 'O nome de usuário deve ter entre 3 e 20 caracteres.'
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(form.email)) errors.email = 'Informe um e-mail válido.'
  if (form.password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'As senhas não coincidem.'

  return Object.values(errors).every((msg) => msg === '')
}
```

### 16.2 Integração com o Serviço de Autenticação
Ao submeter o formulário:
1. `validate()` roda. Se houver qualquer erro, a função para imediatamente sem gastar requisição de rede.
2. `isSubmitting` fica `true` desabilitando o botão para evitar múltiplos cliques.
3. Se o cadastro for bem-sucedido, redireciona o usuário para a tela `/login`.
4. Se a API responder com duplicidade, a mensagem amigável é capturada pelo interceptor do Axios e atribuída a `apiErrorMessage.value`.

---

## 17. Resultados e Validação Prática

Durante a bateria de testes de homologação, os seguintes marcos foram validados:
1. **Sincronização do Banco:** O MySQL criou a tabela `users` com chaves únicas e colunas corretas.
2. **cURL 201 Created:** Novo usuário cadastrado com hash gerado e retorno `{ id, username, email }`.
3. **cURL 400 Bad Request:** Senha curta bloqueada pelo `express-validator` com mensagem explicativa.
4. **cURL 500 Conflict:** Tentativa de cadastro duplicado rejeitada pelo serviço.
5. **cURL 200 OK no Profile:** Consulta pública confirmou a persistência dos dados no banco sem expor a senha.
6. **Validação Visual no Front:** Formulário exibiu erros client-side sem disparar rede.
7. **Detecção de Duplicidade Visual:** Mensagem de erro renderizada na interface e requisição `500` capturada na aba Network.

---

# Resumo — Atividade 4: Login com JWT, Pinia e Proteção de Rotas

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere — Plataforma de Compartilhamento de Fotos  
**Aluno:** Marcos Vinicius  

---

## 18. Contexto e Objetivos da Atividade 4

Com o cadastro de usuários persistido no MySQL concluído na Atividade 3, a **Atividade 4** estabeleceu a camada completa de **Autenticação, Autorização e Controle de Sessão** do PhotoSphere:
1. **No Back-end:** Autenticação stateless via **JSON Web Token (JWT)**, endpoint de login (`POST /api/login`), proteção de recursos com o middleware `isAuthenticated` e endpoint de perfil pessoal (`GET /api/profile/me`).
2. **No Front-end:** Gerenciamento de estado global com **Pinia** (`stores/auth.js`) sincronizado com o `localStorage`, **Interceptors do Axios** (anexo automático de Bearer Token e logout reativo em 401), estilização moderna com **Bootstrap 5 CDN** e a paleta monocromática laranja (`#FF6622`), e **Guarda de Rotas** (`Navigation Guard`) no Vue Router bloqueando acessos não autorizados.

---

## 19. Fundamentos Teóricos Obrigatórios

### 19.1 O que é um JWT e como é composto?
Um **JWT (JSON Web Token)** é um padrão aberto (RFC 7519) para transmissão segura e compacta de informações entre partes como um objeto JSON. Ele é composto por três partes separadas por pontos (`.`):
1. **Header (Cabeçalho):** Especifica o algoritmo de hash utilizado (ex: HMAC SHA256 ou `HS256`) e o tipo de token (`JWT`). É apenas codificado em Base64Url.
2. **Payload (Carga Útil):** Contém as reivindicações (*claims*) sobre a identidade do usuário (ex: `id`, `username`, `isAdmin`) e metadados de emissão/expiração (`iat`, `exp`). **Também é apenas codificado em Base64Url (NÃO É CRIPTOGRAFADO!).**
   > ⚠️ **Por que nunca colocar dados sensíveis no payload?** Qualquer pessoa que interceptar o token pode decodificar o payload com facilidade (usando sites como `jwt.io` ou funções simples de Base64). Por isso, senhas, chaves privadas ou dados bancários NUNCA devem estar no payload.
3. **Signature (Assinatura):** É calculada pegando o Header codificado, o Payload codificado, uma chave secreta privada (`JWT_SECRET`) conhecida apenas pelo servidor, e passando pelo algoritmo de assinatura:
   $$\text{Signature} = \text{HMAC-SHA256}(\text{base64UrlEncode(header)} + "." + \text{base64UrlEncode(payload)}, \text{secret})$$
   Apenas a assinatura garante a autenticidade e integridade do token. Se alguém alterar o `id` ou `isAdmin` no payload, a assinatura torna-se inválida e o servidor rejeita a requisição.

### 19.2 Por que "Logout" em arquitetura JWT Stateless não revoga nada no servidor?
- Em uma arquitetura **stateless** (sem estado), o servidor não guarda sessões ativas no banco ou em memória. A validade de uma requisição depende exclusivamente da verificação criptográfica da assinatura e do tempo de expiração (`exp`) contido no próprio token.
- Logo, quando o usuário clica em "Sair", o logout é realizado **no lado do cliente**, descartando o token do `localStorage` e da memória do navegador.
- Do ponto de vista do backend, o token continuará matematicamente válido até expirar.
- **O que mudaria isso?** Para invalidar tokens imediatamente no backend, seria necessário adotar uma lista de revogação (*Blacklist* ou *Denylist* de tokens revogados no Redis/Banco) ou utilizar tokens de curta duração acompanhados de *Refresh Tokens* rotacionados.

### 19.3 Por que ler o token do `localStorage` diretamente no interceptor do Axios?
- Se o interceptor em `src/services/api.js` importasse diretamente a store `useAuthStore()` do Pinia para ler o token, criaria-se um problema clássico de **dependência circular** (*circular dependency*):
  - `api.js` importaria `stores/auth.js`
  - `stores/auth.js` importaria `services/authService.js`
  - `services/authService.js` importaria `api.js`
- Além disso, no momento da inicialização da aplicação, o Pinia pode não estar completamente registrado se chamado no topo de módulos estáticos.
- Ler diretamente via `localStorage.getItem('token')` dentro do interceptor de requisição é síncrono, performático, desacoplado e elimina 100% o risco de dependência circular.

---

## 20. Parte A — Implementação no Back-end (API)

### 20.1 Módulo Auxiliar JWT (`config/jwt.js`)
Centraliza o uso do `jsonwebtoken`, garantindo que toda assinatura utilize a chave secreta e tempo de expiração definidos no `.env`:
```javascript
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
```

### 20.2 Middleware de Autenticação (`middlewares/auth.js`)
Extrai e valida o cabeçalho HTTP `Authorization: Bearer <token>`:
```javascript
const { verifyToken } = require('../config/jwt');

function isAuthenticated(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.error('Acesso não autorizado. Nenhum token fornecido.', null, 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.error('Formato de token inválido. Esperado "Bearer <token>".', null, 401);
  }

  try {
    const decoded = verifyToken(parts[1]);
    req.user = decoded; // injeta { id, username, isAdmin } na requisição
    next();
  } catch (error) {
    return res.error('Token inválido ou expirado.', null, 401);
  }
}

module.exports = { isAuthenticated };
```

### 20.3 Roteamento Protegido (`modules/user/userRoutes.js`)
O Express casa as rotas em ordem sequencial. A rota estática `/profile/me` **precisa obrigatoriamente ser registrada antes** da rota dinâmica `/profile/:username`:
```javascript
// POST /api/login - gera JWT
router.post('/login', loginValidator, asyncHandler(userController.login));

// POST /api/logout - encerramento stateless
router.post('/logout', asyncHandler(userController.logout));

// GET /api/profile/me - protegido com isAuthenticated (vem ANTES de :username)
router.get('/profile/me', isAuthenticated, asyncHandler(userController.getMyProfile));

// GET /api/profile/:username - público
router.get('/profile/:username', asyncHandler(userController.getPublicProfile));
```

---

## 21. Parte B — Implementação no Front-end

### 21.1 Gerenciamento de Estado com Pinia (`stores/auth.js`)
Guarda token e objeto do usuário de forma reativa e persiste as alterações no `localStorage`:
```javascript
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => !!user.value?.isAdmin)

  async function login(credentials) {
    const response = await apiLogin(credentials.email, credentials.password)
    token.value = response.data.token
    user.value = response.data.user
    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    return response
  }

  async function logout() {
    try { await apiLogout() } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  return { token, user, isAuthenticated, isAdmin, login, logout }
})
```

### 21.2 Interceptors do Axios com Logout Automático (`services/api.js`)
- **Requisição:** Anexa `Authorization: Bearer <token>` automaticamente em todas as chamadas.
- **Resposta:** Intercepta qualquer status `401 Unauthorized` emitido pela API, limpa os dados do `localStorage` e força o redirecionamento para o `/login?redirect=...`.

### 21.3 Guarda de Navegação Global (`src/router/index.js`)
Intercepta rotas com `requiresAuth: true`. Se o usuário não estiver autenticado, bloqueia o acesso e guarda a rota pretendida no parâmetro `?redirect=...`:
```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore() // chamado DENTRO do callback

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
})
```

### 21.4 Identidade Visual e Bootstrap 5
- Inclusão do Bootstrap 5 via CDN no `index.html`.
- Paleta monocromática laranja definida em `src/assets/main.css`:
  - Cor de Marca Principal: `#FF6622` (laranja vibrante / Golden Hour)
  - Variação Escura / Hover: `#E74800`
  - Variação Clara / Foco: `#FF8E5C`
- Tela `LoginView.vue` estruturada com cards arredondados, contrastes escuros acolhedores e tipografia moderna.

---

## 22. Validação e Resultados Práticos

Durante a bateria de testes de homologação da Atividade 4:
1. **Login 200 OK:** cURL retornou token JWT válido com expiração de 7 dias e payload de permissões.
2. **Segurança de Credenciais:** Tentativa com senha errada devolveu mensagem genérica sem vazar detalhes internos.
3. **Proteção de Rota (401):** Requisição a `/profile/me` sem token e com token falso resultou em 401 imediato.
4. **Perfil Autenticado (200):** Requisição com Bearer Token retornou os dados completos do usuário logado.
5. **Navegação Protegida:** Acesso a rotas restritas deslogado foi interceptado, gerando redirecionamento com `?redirect=...`.
6. **Persistência ao Recarregar:** Usuário logado permaneceu com sessão ativa após F5 via `localStorage`.
7. **Integração Visual:** O console confirmou `Perfil autenticado OK:` e a Navbar adaptou-se com o nome do usuário e opção de logout.

---

# PARTE 5: AULA 05 — Upload de Arquivos e Edição de Perfil

## 23. Fundamentos Teóricos: Upload de Arquivos na Web

### 23.1 Por que JSON não serve para arquivos binários?
Até a Aula 04, todas as requisições utilizavam o cabeçalho `Content-Type: application/json`. O formato JSON é baseado em texto UTF-8 estruturado com chaves e valores. Arquivos de imagem, vídeo ou áudio são compostos por sequências de bytes binários arbitrários. Para enviar uma imagem via JSON, seria necessário codificá-la em Base64, o que acarreta um **aumento de ~33% no tamanho da carga útil (overhead)** e exige processamento extra de conversão na CPU tanto no cliente quanto no servidor.

### 23.2 O formato `multipart/form-data` e o conceito de `Boundary`
Para contornar essa limitação, o padrão HTTP define o tipo de mídia `multipart/form-data`. Nesse formato:
- A requisição pode transportar múltiplos campos de diferentes tipos (textos simples e arquivos binários) no mesmo corpo.
- O navegador gera um delimitador único e pseudo-aleatório chamado **`boundary`** (fronteira), por exemplo: `---------------------------974767299852498929531610575`.
- Cada campo é enviado como uma "parte" isolada separada por essa fronteira, contendo seus próprios cabeçalhos (`Content-Disposition`, `Content-Type`) e seus dados em formato bruto.
- **Atenção crucial:** Ao usar `FormData` no JavaScript/Axios, nunca se deve fixar manualmente o cabeçalho `Content-Type: multipart/form-data`. Se fixado sem o boundary, o servidor não consegue identificar as quebras de parte. O navegador define automaticamente o cabeçalho completo: `Content-Type: multipart/form-data; boundary=---------------------------...`.

### 23.3 Prévia Instantânea Client-Side com `URL.createObjectURL(file)`
Tradicionalmente, para visualizar uma imagem antes de salvá-la, muitas aplicações enviavam a foto imediatamente ao backend gerando tráfego desnecessário e poluição de arquivos órfãos.
A Web API moderna oferece o método `URL.createObjectURL(file)`:
- Cria uma URL especial apontando para o arquivo que já reside na memória RAM do navegador do usuário (esquema `blob:http://localhost:5173/...`).
- A imagem é renderizada instantaneamente na tela **com zero chamadas de rede (Network tab = 0 requisições)**.
- O recurso deve ser liberado quando o componente é destruído ou quando uma nova foto é selecionada através de `URL.revokeObjectURL(url)`, evitando vazamentos de memória (memory leaks).

---

## 24. Implementação no Back-end (API)

### 24.1 O Middleware Multer e Configuração de Armazenamento
O Express por si só não faz parse de `multipart/form-data`. Para isso, utilizou-se a biblioteca `multer`:
```javascript
// middlewares/profileMulter.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/profiles'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `profile-${uniqueSuffix}${ext}`)
  }
})
```
- **Filtro de Extensões / MIME Type:** Apenas `image/jpeg`, `image/jpg`, `image/png` e `image/webp` são aceitos.
- **Limite de Tamanho:** Restrito a 5MB (`limits: { fileSize: 5 * 1024 * 1024 }`).

### 24.2 Servimento Público de Estáticos
Para que o front-end acesse as imagens salvas, a pasta `public/uploads` foi exposta publicamente em `server.js`:
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))
```

### 24.3 Remoção Segura de Foto Antiga
No serviço `userService.updateUserProfile`, ao receber um novo arquivo:
- O banco atualiza a coluna `profilePicture`.
- Se o usuário já possuía uma foto personalizada (diferente de `default-profile.png`), a foto antiga é deletada do disco via `fs.unlink()` de forma assíncrona, mantendo o servidor livre de arquivos órfãos.

---

## 25. Implementação no Front-end (Vue 3)

### 25.1 Camada de Serviço e Utilitário de Mídia
- `src/utils/media.js`: Cria a função `getProfilePictureUrl(path)` que prefixa o caminho com `VITE_API_STORAGE_URL` ou devolve o `default-profile.png` caso o usuário não possua foto.
- `src/services/userService.js`: Define `updateProfile(formData)` transmitindo o objeto `FormData` para o endpoint `PUT /profile/me`.

### 25.2 Componente `MyProfileView.vue`
- **Carregamento Reativo:** Dispara `getMyProfile()` no ciclo de vida `onMounted()`, populando os dados reais (`fullName`, `bio`, `profilePicture`).
- **Contador em Tempo Real:** Limita a biografia a 255 caracteres (`BIO_MAX`), com feedback visual ao usuário.
- **Prévia Local:** Atualiza a imagem de avatar via `URL.createObjectURL` imediatamente após a seleção do arquivo.
- **Sincronização:** Após o sucesso da submissão `PUT`, os novos dados são atualizados no Pinia Store e no `localStorage`.




