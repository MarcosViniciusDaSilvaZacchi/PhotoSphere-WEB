/**
 * modules/notification/notificationRoutes.js — Rotas das notificações (Aula 14).
 * As três exigem login. "unread-count" fica antes da rota com :id por clareza.
 */

const express = require('express');
const router = express.Router();
const notificationController = require('./notificationController');
const { isAuthenticated } = require('../../middlewares/auth');
const asyncHandler = require('../../middlewares/asyncHandler');

// GET /api/notifications — lista paginada (?page=&limit=)
router.get('/notifications', isAuthenticated, asyncHandler(notificationController.getNotifications));

// GET /api/notifications/unread-count — o número do sino
router.get('/notifications/unread-count', isAuthenticated, asyncHandler(notificationController.getUnreadCount));

// PATCH /api/notifications/:id/read — marcar como lida (idempotente)
router.patch('/notifications/:id/read', isAuthenticated, asyncHandler(notificationController.markAsRead));

module.exports = router;
