/**
 * modules/like/likeRoutes.js — Rotas das curtidas (Aula 10).
 */

const express = require('express');
const router = express.Router();
const likeController = require('./likeController');
const { isAuthenticated } = require('../../middlewares/auth');
const { optionalAuth } = require('../../middlewares/optionalAuth');
const asyncHandler = require('../../middlewares/asyncHandler');

// POST /api/photos/:photoId/toggle-like — curtir/descurtir (precisa estar logado)
router.post('/photos/:photoId/toggle-like', isAuthenticated, asyncHandler(likeController.toggleLike));

// GET /api/photos/:photoId/like-status — público; com token informa se você curtiu
router.get('/photos/:photoId/like-status', optionalAuth, asyncHandler(likeController.getLikeStatus));

// GET /api/liked-photos — fotos que o usuário logado curtiu
router.get('/liked-photos', isAuthenticated, asyncHandler(likeController.getLikedPhotos));

module.exports = router;
