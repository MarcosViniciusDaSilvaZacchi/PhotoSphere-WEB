/**
 * modules/album/albumRoutes.js — Rotas dos álbuns (Aula 13).
 *
 * Só a leitura de um álbum é pública (optionalAuth: o visitante vê os públicos,
 * a dona vê também os privados). Todo o resto exige login.
 */

const express = require('express');
const router = express.Router();
const albumController = require('./albumController');
const { createAlbumValidator } = require('./albumValidator');
const { isAuthenticated } = require('../../middlewares/auth');
const { optionalAuth } = require('../../middlewares/optionalAuth');
const asyncHandler = require('../../middlewares/asyncHandler');

// GET /api/my-albums — os meus álbuns
router.get('/my-albums', isAuthenticated, asyncHandler(albumController.getMyAlbums));

// POST /api/albums — criar (validado)
router.post('/albums', isAuthenticated, createAlbumValidator, asyncHandler(albumController.createAlbum));

// GET /api/albums/:id — ler um álbum (público se isPublic; privado só para a dona)
router.get('/albums/:id', optionalAuth, asyncHandler(albumController.getAlbumDetails));

// DELETE /api/albums/:id — excluir o álbum (as fotos continuam existindo)
router.delete('/albums/:id', isAuthenticated, asyncHandler(albumController.deleteAlbum));

// POST /api/albums/:id/photos — adicionar uma foto (id no corpo)
router.post('/albums/:id/photos', isAuthenticated, asyncHandler(albumController.addPhoto));

// DELETE /api/albums/:id/photos/:photoId — remover uma foto (id na URL)
router.delete('/albums/:id/photos/:photoId', isAuthenticated, asyncHandler(albumController.removePhoto));

// GET /api/photos/:photoId/albums-status — os meus álbuns com hasPhoto (modal "Salvar")
router.get('/photos/:photoId/albums-status', isAuthenticated, asyncHandler(albumController.getAlbumsStatus));

module.exports = router;
