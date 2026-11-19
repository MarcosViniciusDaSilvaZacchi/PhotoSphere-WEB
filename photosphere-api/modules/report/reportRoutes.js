/**
 * modules/report/reportRoutes.js — Rota da denúncia (Aula 14).
 * Ordem: isAuthenticated (401) → reportValidator (400 motivo) → controller
 * (400 id → 404 → 400 própria foto → 409).
 */

const express = require('express');
const router = express.Router();
const reportController = require('./reportController');
const { reportValidator } = require('./reportValidator');
const { isAuthenticated } = require('../../middlewares/auth');
const asyncHandler = require('../../middlewares/asyncHandler');

// POST /api/photos/:photoId/report — denunciar uma foto
router.post('/photos/:photoId/report', isAuthenticated, reportValidator, asyncHandler(reportController.reportPhoto));

module.exports = router;
