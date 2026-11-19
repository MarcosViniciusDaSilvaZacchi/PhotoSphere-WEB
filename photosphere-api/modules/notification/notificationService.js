/**
 * modules/notification/notificationService.js — Avisos para o dono (Aula 14).
 *
 * createNotification / removeNotification são chamadas DE DENTRO das transações de
 * curtir, comentar e seguir, recebendo o `t` como segundo argumento. Se a
 * transação for desfeita, o aviso some junto; se ela for confirmada, o aviso
 * existe junto com a curtida. Esquecer o `t` faz o INSERT rodar em outra conexão,
 * que fica esperando o lock que a própria transação segura: a requisição trava e,
 * uns 50 s depois, responde 500 "Lock wait timeout exceeded".
 */

const Notification = require('./notificationModel');
const User = require('../user/userModel');
const Photo = require('../photo/photoModel');
const { httpError } = require('../../utils/httpError');

const ACTOR_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];

/**
 * Cria o aviso — a não ser que a pessoa tenha agido sobre si mesma
 * (curtir/comentar a própria foto não avisa ninguém).
 */
async function createNotification({ userId, actorId, type, photoId = null }, transaction) {
  if (Number(userId) === Number(actorId)) return null;
  return Notification.create({ userId, actorId, type, photoId }, { transaction });
}

/**
 * Apaga o aviso quando a ação é desfeita (descurtir, deixar de seguir).
 * Os quatro dados no where: apaga exatamente o aviso daquela ação.
 */
async function removeNotification({ userId, actorId, type, photoId = null }, transaction) {
  return Notification.destroy({ where: { userId, actorId, type, photoId }, transaction });
}

/**
 * GET /api/notifications — as minhas, da mais nova para a mais antiga (id desempata).
 */
async function getUserNotifications(userId, page, limit) {
  return Notification.findAll({
    where: { userId },
    attributes: ['id', 'type', 'photoId', 'isRead', 'createdAt'],
    include: [
      { model: User, as: 'Actor', attributes: ACTOR_ATTRIBUTES },
      { model: Photo, as: 'photo', attributes: ['id', 'title', 'imageUrl'] },
    ],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });
}

/**
 * GET /api/notifications/unread-count — só um número (o sino pergunta isto a cada 30 s).
 */
async function getUnreadCount(userId) {
  return Notification.count({ where: { userId, isRead: false } });
}

/**
 * PATCH /api/notifications/:id/read — idempotente: marcar de novo não muda nada.
 * 404 (não existe) → 403 (é de outra pessoa). O unreadCount é contado DEPOIS do update.
 */
async function markAsRead(id, userId) {
  const notification = await Notification.findByPk(id);
  if (!notification) throw httpError('Notificação não encontrada.', 404);
  if (Number(notification.userId) !== Number(userId)) {
    throw httpError('Você não tem permissão para alterar esta notificação.', 403);
  }

  if (!notification.isRead) {
    await notification.update({ isRead: true });
  }

  const unreadCount = await getUnreadCount(userId);
  return { id: notification.id, isRead: true, unreadCount };
}

module.exports = {
  createNotification,
  removeNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
};
