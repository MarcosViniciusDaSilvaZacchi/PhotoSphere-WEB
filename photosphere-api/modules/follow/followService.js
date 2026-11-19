/**
 * modules/follow/followService.js — Regras de negócio de "seguir" (Aula 11).
 *
 * Seguir é uma relação USUÁRIO ↔ USUÁRIO. Cada seguida mexe em TRÊS lugares:
 *  1. a linha em "follows";
 *  2. followersCount de QUEM É SEGUIDO (ganhou um seguidor);
 *  3. followingCount de QUEM SEGUE (passou a seguir mais um).
 * As três escritas rodam numa única transação, e TODO comando recebe
 * { transaction: t } — senão roda fora dela e não é desfeito no rollback.
 *
 * Os ids chegam aqui JÁ CONVERTIDOS para número (parseUserId no controller).
 */

const sequelize = require('../../config/database');
const Follow = require('./followModel');
const User = require('../user/userModel');
const { httpError } = require('../../utils/httpError'); // Aula 13: utilitário compartilhado

// Atributos públicos de uma pessoa nas listas — nunca senha, e-mail ou flags internas
const PUBLIC_USER_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture', 'bio'];


async function ensureUserExists(userId, options = {}) {
  const user = await User.findByPk(userId, { attributes: ['id'], ...options });
  if (!user) {
    throw httpError('Usuário não encontrado.', 404);
  }
  return user;
}

/**
 * POST /api/users/:userId/toggle-follow
 * Segue se ainda não segue; deixa de seguir se já segue.
 *
 * Ordem das checagens: 400 (a si mesmo) → 404 (alvo não existe) → transação.
 *
 * @param {number} followerId  - quem está seguindo (req.user.id)
 * @param {number} followingId - quem será seguido (req.params.userId convertido)
 * @returns {{ isFollowing: boolean, followersCount: number }}
 */
async function toggleFollow(followerId, followingId) {
  if (followerId === followingId) {
    throw httpError('Você não pode seguir a si mesmo.', 400);
  }

  return sequelize.transaction(async (t) => {
    const target = await User.findByPk(followingId, { transaction: t });
    if (!target) {
      throw httpError('Usuário não encontrado.', 404);
    }

    const [follow, created] = await Follow.findOrCreate({
      where: { followerId, followingId },
      transaction: t,
    });

    if (created) {
      // followersCount sobe no SEGUIDO; followingCount sobe em QUEM SEGUE
      await User.increment('followersCount', { by: 1, where: { id: followingId }, transaction: t });
      await User.increment('followingCount', { by: 1, where: { id: followerId }, transaction: t });
    } else {
      await follow.destroy({ transaction: t });
      await User.decrement('followersCount', { by: 1, where: { id: followingId }, transaction: t });
      await User.decrement('followingCount', { by: 1, where: { id: followerId }, transaction: t });
    }

    // increment/decrement não atualizam a instância em memória — relê dentro da transação
    await target.reload({ transaction: t });

    return { isFollowing: created, followersCount: target.followersCount };
  });
}

/**
 * GET /api/users/:userId/follow-status — "eu sigo esta pessoa?"
 */
async function getFollowStatus(followerId, followingId) {
  await ensureUserExists(followingId);
  if (followerId === followingId) return false;

  const follow = await Follow.findOne({
    where: { followerId, followingId },
    attributes: ['id'],
  });
  return !!follow;
}

/**
 * GET /api/users/:userId/followers — QUEM SEGUE userId.
 * Lendo em voz alta: "as linhas em que o SEGUIDO (followingId) é userId;
 * de cada uma, quero o FOLLOWER (quem segue)".
 */
async function getFollowers(userId) {
  await ensureUserExists(userId);

  const rows = await Follow.findAll({
    where: { followingId: userId },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    include: [{ model: User, as: 'Follower', attributes: PUBLIC_USER_ATTRIBUTES }],
  });

  return rows.map((row) => row.Follower);
}

/**
 * GET /api/users/:userId/following — QUEM userId SEGUE.
 * Lendo em voz alta: "as linhas em que QUEM SEGUE (followerId) é userId;
 * de cada uma, quero o FOLLOWING (quem é seguido)".
 */
async function getFollowing(userId) {
  await ensureUserExists(userId);

  const rows = await Follow.findAll({
    where: { followerId: userId },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    include: [{ model: User, as: 'Following', attributes: PUBLIC_USER_ATTRIBUTES }],
  });

  return rows.map((row) => row.Following);
}

/**
 * Usada pelo perfil público para devolver isFollowing.
 */
async function isFollowing(followerId, followingId) {
  if (!followerId || Number(followerId) === Number(followingId)) return false;
  const follow = await Follow.findOne({
    where: { followerId, followingId },
    attributes: ['id'],
  });
  return !!follow;
}

module.exports = {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
  isFollowing,
};
