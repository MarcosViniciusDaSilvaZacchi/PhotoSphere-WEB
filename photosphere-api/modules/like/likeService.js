/**
 * modules/like/likeService.js — Regras de negócio das curtidas (Aula 10).
 *
 * Toda escrita dupla (linha em "likes" + contador em "photos") roda dentro de
 * sequelize.transaction(): ou as duas coisas acontecem, ou nenhuma.
 * TODO comando dentro do callback recebe { transaction: t } — um comando sem
 * ele roda FORA da transação (em outra conexão), não é desfeito no rollback
 * e pode até travar esperando um lock que a própria transação está segurando.
 */

const sequelize = require('../../config/database');
const Like = require('./likeModel');
const Photo = require('../photo/photoModel');
const User = require('../user/userModel');

const AUTHOR_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/**
 * POST /api/photos/:photoId/toggle-like
 * Curte se ainda não curtiu; descurte se já curtiu.
 *
 * @param {number} userId  - quem está curtindo (req.user.id)
 * @param {number} photoId - foto alvo (req.params.photoId)
 * @returns {{ liked: boolean, likesCount: number }}
 */
async function toggleLike(userId, photoId) {
  return sequelize.transaction(async (t) => {
    const photo = await Photo.findByPk(photoId, { transaction: t });
    if (!photo) {
      throw httpError('Foto não encontrada.', 404);
    }

    const existing = await Like.findOne({
      where: { userId, photoId },
      transaction: t,
    });

    let liked;
    if (existing) {
      await existing.destroy({ transaction: t });
      await photo.decrement('likesCount', { by: 1, transaction: t });
      liked = false;
    } else {
      await Like.create({ userId, photoId }, { transaction: t });
      await photo.increment('likesCount', { by: 1, transaction: t });
      liked = true;
    }

    // increment/decrement não atualizam a instância em memória — relê dentro da transação
    await photo.reload({ transaction: t });

    return { liked, likesCount: photo.likesCount };
  });
}

/**
 * GET /api/photos/:photoId/like-status (optionalAuth)
 * Visitante → liked: false. Logado → se existe a linha (userId, photoId).
 */
async function getLikeStatus(userId, photoId) {
  const photo = await Photo.findByPk(photoId, { attributes: ['id', 'likesCount'] });
  if (!photo) {
    throw httpError('Foto não encontrada.', 404);
  }

  return {
    liked: await isLikedBy(userId, photoId),
    likesCount: photo.likesCount,
  };
}

/**
 * Usada também pelo detalhe da foto para devolver isLiked.
 */
async function isLikedBy(userId, photoId) {
  if (!userId) return false;
  const like = await Like.findOne({ where: { userId, photoId }, attributes: ['id'] });
  return !!like;
}

/**
 * GET /api/liked-photos — fotos curtidas pelo usuário, da curtida mais recente
 * para a mais antiga, cada uma com o seu autor.
 */
async function getLikedPhotos(userId) {
  const likes = await Like.findAll({
    where: { userId },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    include: [
      {
        model: Photo,
        as: 'photo',
        required: true,
        include: [{ model: User, as: 'author', attributes: AUTHOR_ATTRIBUTES }],
      },
    ],
  });

  return likes.map((like) => ({
    ...like.photo.toJSON(),
    isLiked: true,
    likedAt: like.createdAt,
  }));
}

module.exports = {
  toggleLike,
  getLikeStatus,
  isLikedBy,
  getLikedPhotos,
};
