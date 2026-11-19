/**
 * modules/comment/commentService.js — Regras de negócio dos comentários (Aula 10).
 */

const sequelize = require('../../config/database');
const Comment = require('./commentModel');
const Photo = require('../photo/photoModel');
const User = require('../user/userModel');
const { httpError } = require('../../utils/httpError'); // Aula 13: utilitário compartilhado
const { createNotification } = require('../notification/notificationService'); // Aula 14
const { NOTIFICATION } = require('../../config/constants');

const authorInclude = {
  model: User,
  as: 'author',
  attributes: ['id', 'username', 'fullName', 'profilePicture'],
};


/**
 * POST /api/photos/:photoId/comments
 * Cria o comentário e incrementa commentsCount na MESMA transação.
 * Aula 14: o aviso para o dono da foto nasce na mesma transação (só criar —
 * a API não exclui comentários, então não há "desfazer").
 * Devolve o comentário já com o autor — o frontend precisa dele para
 * mostrar o comentário novo no topo sem recarregar a lista.
 *
 * @param {number} userId
 * @param {number} photoId
 * @param {string} content - já aparado pelo validador (trim)
 */
async function createComment(userId, photoId, content) {
  return sequelize.transaction(async (t) => {
    const photo = await Photo.findByPk(photoId, { transaction: t });
    if (!photo) {
      throw httpError('Foto não encontrada.', 404);
    }

    const comment = await Comment.create({ userId, photoId, content }, { transaction: t });
    await photo.increment('commentsCount', { by: 1, transaction: t });
    await createNotification(
      { userId: photo.userId, actorId: userId, type: NOTIFICATION.TYPES.COMMENT, photoId: photo.id },
      t
    );

    return Comment.findByPk(comment.id, {
      include: [authorInclude],
      transaction: t,
    });
  });
}

/**
 * GET /api/photos/:photoId/comments — público, mais novos primeiro.
 */
async function listComments(photoId) {
  const photo = await Photo.findByPk(photoId, { attributes: ['id'] });
  if (!photo) {
    throw httpError('Foto não encontrada.', 404);
  }

  return Comment.findAll({
    where: { photoId },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    include: [authorInclude],
  });
}

module.exports = {
  createComment,
  listComments,
};
