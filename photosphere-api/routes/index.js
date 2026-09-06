// routes/index.js
// Rota pública da API. Serve para verificar se a API está online.
// O frontend vai consumir esta rota na Landing Page como primeiro marco de integração.

const express = require('express');
const router = express.Router();

// GET /api → retorna status "online"
router.get('/', (req, res) => {
  res.success('PhotoSphere API online', { status: 'online', version: '1.0.0' });
});

module.exports = router;
