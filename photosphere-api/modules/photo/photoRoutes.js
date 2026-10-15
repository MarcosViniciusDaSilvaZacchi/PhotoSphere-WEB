/**
 * modules/photo/photoRoutes.js — Rotas da Entidade Principal (Photo).
 *
 * Ordem estrita de middlewares para upload (POST e PUT):
 * 1. isAuthenticated (autenticação do usuário e injeção de req.user)
 * 2. uploadPhoto.single('image') (processamento do multipart e gravação em disco)
 * 3. validator (validação dos campos — precisa vir DEPOIS do Multer, senão req.body está vazio)
 * 4. controller (execução da regra de negócio envolvida em asyncHandler)
 */

const express = require('express');
const router = express.Router();
const photoController = require('./photoController');
const { createPhotoValidator, updatePhotoValidator } = require('./photoValidator');
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

// GET /api/my-photos — Fotos do usuário logado, mais novas primeiro (Aula 09)
router.get('/my-photos', isAuthenticated, asyncHandler(photoController.getMyPhotos));

// GET /api/photos — Listagem de fotos (pública)
router.get('/photos', asyncHandler(photoController.listPhotos));

// GET /api/photos/:id/edit — Dados para o formulário de edição, só para o dono (Aula 09)
router.get('/photos/:id/edit', isAuthenticated, asyncHandler(photoController.getPhotoForEdit));

// GET /api/photos/:id — Detalhes de uma foto por ID (público via optionalAuth)
router.get('/photos/:id', optionalAuth, asyncHandler(photoController.getPhoto));

// PUT /api/photos/:id — Edição de título/descrição + troca opcional da imagem (Aula 09)
router.put(
  '/photos/:id',
  isAuthenticated,
  uploadPhoto.single('image'),
  updatePhotoValidator,
  asyncHandler(photoController.updatePhoto)
);

// DELETE /api/photos/:id — Exclusão do registro e do arquivo em disco (Aula 09)
router.delete('/photos/:id', isAuthenticated, asyncHandler(photoController.deletePhoto));

module.exports = router;
