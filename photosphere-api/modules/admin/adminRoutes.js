/**
 * modules/admin/adminRoutes.js — Rotas do painel (Aula 15).
 *
 * UMA guarda para todas: router.use('/admin', isAuthenticated, isAdmin).
 * Escrever o isAdmin em cada rota seria um esquecimento esperando para acontecer —
 * a primeira rota nova sem ele ficaria aberta para qualquer pessoa logada.
 * A ordem importa: isAuthenticated monta o req.user; só então isAdmin consegue lê-lo.
 * Até um endereço inexistente sob /api/admin responde 401/403 (e não 404): quem não
 * é administrador não descobre nem quais rotas existem.
 */

const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { reportsFilterValidator, blockUserValidator } = require('./adminValidator');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const asyncHandler = require('../../middlewares/asyncHandler');

router.use('/admin', isAuthenticated, isAdmin);

router.get('/admin/dashboard', asyncHandler(adminController.getDashboard));
router.get('/admin/reports', reportsFilterValidator, asyncHandler(adminController.getReports));
router.patch('/admin/reports/:id/review', asyncHandler(adminController.reviewReport));
router.get('/admin/users', asyncHandler(adminController.getUsers));
router.patch('/admin/users/:id/block', blockUserValidator, asyncHandler(adminController.setUserBlocked));
router.get('/admin/photos', asyncHandler(adminController.getPhotos));
router.delete('/admin/photos/:id', asyncHandler(adminController.deletePhoto));

module.exports = router;
