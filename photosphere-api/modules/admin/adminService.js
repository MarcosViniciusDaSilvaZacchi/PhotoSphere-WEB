/**
 * modules/admin/adminService.js — Regras do painel de administração (Aula 15).
 *
 * Toda rota daqui já passou por isAuthenticated + isAdmin (adminRoutes.js):
 * o service não precisa (nem deve) repetir a checagem de papel.
 */

const { Op, fn, col } = require('sequelize');
const User = require('../user/userModel');
const Photo = require('../photo/photoModel');
const Comment = require('../comment/commentModel');
const Like = require('../like/likeModel');
const Report = require('../report/reportModel');
const { REPORT } = require('../../config/constants');
const { httpError } = require('../../utils/httpError');
const { escapeLike } = require('../../utils/escapeLike');

const PUBLIC_USER_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];
const ADMIN_USER_ATTRIBUTES = [
  'id', 'username', 'email', 'fullName', 'profilePicture',
  'isBlocked', 'isAdmin', 'followersCount', 'followingCount', 'photosCount', 'createdAt',
];

/**
 * GET /api/admin/dashboard — sete contagens independentes, em paralelo.
 */
async function getDashboardStats() {
  const [users, blockedUsers, photos, comments, likes, pendingReports, reviewedReports] = await Promise.all([
    User.count(),
    User.count({ where: { isBlocked: true } }),
    Photo.count(),
    Comment.count(),
    Like.count(),
    Report.count({ where: { status: REPORT.STATUS.PENDING } }),
    Report.count({ where: { status: REPORT.STATUS.REVIEWED } }),
  ]);
  return { users, blockedUsers, photos, comments, likes, pendingReports, reviewedReports };
}

/**
 * GET /api/admin/reports?status=pending|reviewed|all — "all" é "sem filtro".
 * Cada denúncia vem com quem denunciou (Reporter) e a foto com o autor — só atributos públicos.
 */
async function getReports(status, page, limit) {
  const where = status === 'all' ? {} : { status };
  return Report.findAll({
    where,
    attributes: ['id', 'reason', 'status', 'reviewedAt', 'createdAt', 'photoId'],
    include: [
      { model: User, as: 'Reporter', attributes: PUBLIC_USER_ATTRIBUTES },
      {
        model: Photo,
        as: 'photo',
        attributes: ['id', 'title', 'imageUrl', 'userId'],
        include: [{ model: User, as: 'author', attributes: PUBLIC_USER_ATTRIBUTES }],
      },
    ],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });
}

/**
 * PATCH /api/admin/reports/:id/review — idempotente: revisar de novo não muda o reviewedAt.
 * O reload() relê a linha DEPOIS do update: a resposta sai com o reviewedAt exatamente
 * como o banco gravou (e não com o objeto Date montado em memória).
 */
async function reviewReport(id) {
  const report = await Report.findByPk(id);
  if (!report) throw httpError('Denúncia não encontrada.', 404);

  if (report.status !== REPORT.STATUS.REVIEWED) {
    await report.update({ status: REPORT.STATUS.REVIEWED, reviewedAt: new Date() });
  }

  await report.reload();
  return { id: report.id, status: report.status, reviewedAt: report.reviewedAt };
}

/**
 * GET /api/admin/users?search= — attributes explícito: e-mail e flags sim, senha nunca.
 * Texto vazio = sem filtro.
 */
async function getUsers(search, page, limit) {
  const where = {};
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    where[Op.or] = [
      { username: { [Op.like]: pattern } },
      { email: { [Op.like]: pattern } },
      { fullName: { [Op.like]: pattern } },
    ];
  }
  return User.findAll({
    where,
    attributes: ADMIN_USER_ATTRIBUTES,
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });
}

/**
 * PATCH /api/admin/users/:id/block — 404 → 400 (a si mesmo) → 403 (outro administrador).
 * Só grava se o valor mudar. O bloqueio não apaga nada: as fotos e o perfil continuam
 * visíveis; a pessoa só não consegue mais entrar nem usar o token que já tinha.
 */
async function setUserBlocked(targetId, isBlocked, adminId) {
  const user = await User.findByPk(targetId);
  if (!user) throw httpError('Usuário não encontrado.', 404);
  if (Number(user.id) === Number(adminId)) {
    throw httpError('Você não pode bloquear a si mesmo.', 400);
  }
  if (user.isAdmin) {
    throw httpError('Não é possível bloquear outro administrador.', 403);
  }

  if (user.isBlocked !== isBlocked) {
    await user.update({ isBlocked });
  }
  return { id: user.id, username: user.username, isBlocked: user.isBlocked };
}

/**
 * GET /api/admin/photos?search= — as fotos da página com o autor e, em cada uma,
 * quantas denúncias PENDENTES ela tem.
 *
 * Em vez de um include agrupado (que brigaria com limit/offset), uma SEGUNDA consulta
 * conta as denúncias pendentes só dos ids desta página (Op.in + GROUP BY, raw: true)
 * e um Map junta o resultado.
 */
async function getPhotos(search, page, limit) {
  const where = search ? { title: { [Op.like]: `%${escapeLike(search)}%` } } : {};
  const photos = await Photo.findAll({
    where,
    attributes: ['id', 'title', 'imageUrl', 'userId', 'likesCount', 'commentsCount', 'createdAt'],
    include: [{ model: User, as: 'author', attributes: PUBLIC_USER_ATTRIBUTES }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  if (photos.length === 0) return [];

  const counts = await Report.findAll({
    where: { status: REPORT.STATUS.PENDING, photoId: { [Op.in]: photos.map((photo) => photo.id) } },
    attributes: ['photoId', [fn('COUNT', col('id')), 'total']],
    group: ['photoId'],
    raw: true,
  });
  const byPhoto = new Map(counts.map((row) => [row.photoId, Number(row.total)]));

  return photos.map((photo) => ({ ...photo.toJSON(), pendingReportsCount: byPhoto.get(photo.id) || 0 }));
}

module.exports = {
  getDashboardStats,
  getReports,
  reviewReport,
  getUsers,
  setUserBlocked,
  getPhotos,
};
