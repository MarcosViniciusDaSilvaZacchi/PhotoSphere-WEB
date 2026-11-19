/**
 * modules/notification/notificationController.js — Controlador das notificações (Aula 14).
 * O userId vem SEMPRE do token (req.user.id), nunca da URL ou do corpo.
 */

const notificationService = require('./notificationService');
const { parsePagination } = require('../../utils/pagination');
const { parseId } = require('../../utils/parseId');

// GET /api/notifications?page=&limit=
exports.getNotifications = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const notifications = await notificationService.getUserNotifications(req.user.id, page, limit);
  return res.success('Notificações obtidas com sucesso', notifications);
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  const unreadCount = await notificationService.getUnreadCount(req.user.id);
  return res.success('Contagem obtida com sucesso', { unreadCount });
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  const id = parseId(req.params.id, 'notificação');
  const result = await notificationService.markAsRead(id, req.user.id);
  return res.success('Notificação marcada como lida.', result);
};
