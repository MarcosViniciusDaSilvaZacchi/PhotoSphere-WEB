/**
 * modules/follow/followRoutes.js — Rotas de "seguir" (Aula 11).
 */

const express = require('express');
const router = express.Router();
const followController = require('./followController');
const { isAuthenticated } = require('../../middlewares/auth');
const asyncHandler = require('../../middlewares/asyncHandler');

// POST /api/users/:userId/toggle-follow — seguir/deixar de seguir (precisa estar logado)
router.post('/users/:userId/toggle-follow', isAuthenticated, asyncHandler(followController.toggleFollow));

// GET /api/users/:userId/follow-status — "eu sigo esta pessoa?" (precisa estar logado)
router.get('/users/:userId/follow-status', isAuthenticated, asyncHandler(followController.getFollowStatus));

// GET /api/users/:userId/followers — quem segue a pessoa (público)
router.get('/users/:userId/followers', asyncHandler(followController.getFollowers));

// GET /api/users/:userId/following — quem a pessoa segue (público)
router.get('/users/:userId/following', asyncHandler(followController.getFollowing));

// GET /api/following-photos — feed filtrado pelas pessoas que eu sigo (precisa estar logado)
router.get('/following-photos', isAuthenticated, asyncHandler(followController.getFollowingPhotos));

module.exports = router;
