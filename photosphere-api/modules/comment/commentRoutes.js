/**
 * modules/comment/commentRoutes.js — Rotas dos comentários (Aula 10).
 */

const express = require('express');
const router = express.Router();
const commentController = require('./commentController');
const { createCommentValidator } = require('./commentValidator');
const { isAuthenticated } = require('../../middlewares/auth');
const asyncHandler = require('../../middlewares/asyncHandler');

// POST /api/photos/:photoId/comments — comentar (logado + validado)
router.post(
  '/photos/:photoId/comments',
  isAuthenticated,
  createCommentValidator,
  asyncHandler(commentController.createComment)
);

// GET /api/photos/:photoId/comments — listar (público)
router.get('/photos/:photoId/comments', asyncHandler(commentController.listComments));

module.exports = router;
