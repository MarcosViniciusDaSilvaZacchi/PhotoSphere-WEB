// server.js
// Ponto de entrada da API. Configura o Express, middlewares e rotas,
// e inicializa o servidor na porta definida no .env

require('dotenv').config(); // carrega as variáveis do .env

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiResponse = require('./middlewares/apiResponse');
const routes = require('./routes');
const searchRoutes = require('./modules/search/searchRoutes'); // E2: módulo de busca
const userRoutes = require('./modules/user/userRoutes');       // E3: módulo de usuários
const photoRoutes = require('./modules/photo/photoRoutes');     // E7: módulo da entidade principal (Photo)
const likeRoutes = require('./modules/like/likeRoutes');         // E10: curtidas
const commentRoutes = require('./modules/comment/commentRoutes'); // E10: comentários
const followRoutes = require('./modules/follow/followRoutes');    // E11: seguir
const albumRoutes = require('./modules/album/albumRoutes');       // E13: álbuns (coleções)
const notificationRoutes = require('./modules/notification/notificationRoutes'); // E14: notificações
const reportRoutes = require('./modules/report/reportRoutes');    // E14: denúncias
const adminRoutes = require('./modules/admin/adminRoutes');       // E15: painel de administração
const errorHandler = require('./middlewares/errorHandler');   // E3: tratamento global de erros
const sequelize = require('./config/database');               // E3: conexão MySQL
require('./config/associations');                             // E7: relacionamentos carregados antes do sync

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globais ────────────────────────────────────────────────────

// CORS: autoriza apenas o frontend (definido no .env) a chamar esta API.
// Aula 14: o cors precisa vir ANTES dos parsers (express.json). Se o express.json
// rodar antes e recusar o corpo (ex.: o "null" que o logout mandava), a resposta
// 400 sai SEM o cabeçalho Access-Control-Allow-Origin — e o navegador mostra um
// "erro de CORS" no lugar do 400 verdadeiro. Neste projeto a ordem já estava certa
// desde a Aula 01; o comentário fica para ninguém inverter.
// PATCH entrou na lista para a rota de marcar notificação como lida.
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Servir uploads estáticos publicamente (E5: fotos de perfil, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Interpreta o corpo das requisições como JSON
app.use(express.json());

// Adiciona res.success() e res.error() em todas as rotas
app.use(apiResponse);

// ─── Rotas ──────────────────────────────────────────────────────────────────

// Rota pública: GET /api
app.use('/api', routes);

// Módulo de busca: GET /api/search
app.use('/api', searchRoutes);

// Módulo de usuários: POST /api/register, GET /api/profile/:username
app.use('/api', userRoutes);

// Módulo de fotos (E7): POST /api/photos, GET /api/photos
app.use('/api', photoRoutes);

// Módulo de curtidas (E10): POST /api/photos/:photoId/toggle-like, GET .../like-status, GET /api/liked-photos
app.use('/api', likeRoutes);

// Módulo de comentários (E10): POST e GET /api/photos/:photoId/comments
app.use('/api', commentRoutes);

// Módulo de seguir (E11): toggle-follow, follow-status, followers, following e GET /api/following-photos
app.use('/api', followRoutes);

// Módulo de álbuns (E13): my-albums, albums (CRUD + fotos) e /photos/:photoId/albums-status
app.use('/api', albumRoutes);

// Módulos de notificações e denúncias (E14)
app.use('/api', notificationRoutes);
app.use('/api', reportRoutes);

// Painel de administração (E15): uma guarda só (isAuthenticated + isAdmin) para tudo em /api/admin
app.use('/api', adminRoutes);

// Rota 404 — qualquer endereço não mapeado cai aqui
app.use((req, res) => {
  res.error('Rota não encontrada.', null, 404);
});

// Middleware de tratamento de erro — SEMPRE o último app.use()
app.use(errorHandler);

// ─── Inicialização e Sincronização do Banco de Dados ──────────────────────────

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Banco de dados sincronizado!');
  })
  .catch((err) => {
    console.error('❌ Erro ao sincronizar banco de dados:', err.message);
  });

app.listen(PORT, () => {
  console.log(`✅ PhotoSphere API rodando em http://localhost:${PORT}`);
  console.log(`🌐 CORS autorizado para: ${process.env.FRONTEND_URL}`);
});

