/**
 * modules/photo/photoRoutes.js — Rotas da Entidade Principal (Photo).
 *
 * Ordem estrita de middlewares para upload:
 * 1. isAuthenticated (autenticação do usuário e injeção de req.user)
 * 2. uploadPhoto.single('image') (processamento do multipart e gravação em disco)
 * 3. createPhotoValidator (validação dos campos e confirmação de req.file)
 * 4. photoController.createPhoto (execução da regra de negócio envolvida em asyncHandler)
 */

const express = require('express');
const router = express.Router();
const photoController = require('./photoController');
const { createPhotoValidator } = require('./photoValidator');
const { isAuthenticated } = require('../../middlewares/auth');
const { optionalAuth } = require('../../middlewares/optionalAuth');
const uploadPhoto = require('../../middlewares/photoMulter');
const asyncHandler = require('../../middlewares/asyncHandler');

// POST /api/photos — Publicação de nova foto (protegido por token)
router.post(
  '/photos',
  isAuthenticated,
  uploadPhoto.single('image'),
  createPhotoValidator,
  asyncHandler(photoController.createPhoto)
);

// GET /api/feed — Feed paginado de itens recentes (protegido por token)
router.get('/feed', isAuthenticated, asyncHandler(photoController.getFeed));

// GET /api/photos — Listagem de fotos (pública)
router.get('/photos', asyncHandler(photoController.listPhotos));

// GET /api/photos/:id — Detalhes de uma foto por ID (público via optionalAuth)
router.get('/photos/:id', optionalAuth, asyncHandler(photoController.getPhoto));

module.exports = router;
