/**
 * modules/user/userRoutes.js — Rotas do módulo de usuários.
 */

const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { registerValidator, loginValidator, profileUpdateValidator } = require('./userValidator');
const { isAuthenticated } = require('../../middlewares/auth');
const { optionalAuth } = require('../../middlewares/optionalAuth');
const uploadProfile = require('../../middlewares/profileMulter');
const asyncHandler = require('../../middlewares/asyncHandler');

// POST /api/register - cadastro de novos usuários
router.post('/register', registerValidator, asyncHandler(userController.register));

// POST /api/login - autenticação com geração de token JWT
router.post('/login', loginValidator, asyncHandler(userController.login));

// POST /api/logout - encerramento de sessão
router.post('/logout', asyncHandler(userController.logout));

// ⚠️ ATENÇÃO: /profile/me DEVE vir antes de /profile/:username,
// caso contrário o Express interpretará "me" como o parâmetro :username!
router.get('/profile/me', isAuthenticated, asyncHandler(userController.getMyProfile));

// PUT /api/profile/me - atualização de perfil com upload opcional de foto
router.put(
  '/profile/me',
  isAuthenticated,
  uploadProfile.single('profilePicture'),
  profileUpdateValidator,
  asyncHandler(userController.updateProfile)
);

// GET /api/profile/:username - perfil público com as fotos da pessoa e isOwner (Aula 09).
// optionalAuth: visitante vê o perfil normalmente; com token, a API sabe se é o dono.
// Fica DEPOIS de /profile/me para que "me" não seja tratado como um username.
router.get('/profile/:username', optionalAuth, asyncHandler(userController.getPublicProfile));

module.exports = router;
