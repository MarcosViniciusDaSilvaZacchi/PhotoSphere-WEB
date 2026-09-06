/**
 * searchRoutes.js — Camada de roteamento do módulo de busca.
 *
 * Responsabilidade: declarar qual verbo HTTP + qual caminho
 * aciona qual função do controller. Sem lógica alguma aqui.
 *
 * Nota: passamos searchController.search SEM parênteses —
 * parênteses executariam a função imediatamente ao carregar o arquivo.
 * Sem parênteses, passamos a referência para o Express chamar a cada requisição.
 */

const express = require('express');
const router = express.Router();
const searchController = require('./searchController');

// Busca global. Rota pública — qualquer pessoa pode buscar, logada ou não.
router.get('/search', searchController.search);

module.exports = router;
