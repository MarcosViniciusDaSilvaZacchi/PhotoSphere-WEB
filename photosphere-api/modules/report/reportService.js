/**
 * modules/report/reportService.js — Denúncias (Aula 14).
 *
 * Ordem: a foto existe? (404) → é minha? (400) → já denunciei? (409).
 * Uma escrita só (a linha da denúncia) → sem transação. E sem notificar o dono:
 * a denúncia é um assunto entre quem denunciou e a moderação.
 *
 * 409 (Conflict) e não o 200 do "adicionar ao álbum": denunciar de novo não é
 * repetir um pedido inofensivo — a segunda denúncia NÃO foi registrada, e a
 * pessoa precisa saber disso. O findOrCreate + o índice único (user_id, photo_id)
 * garantem uma denúncia por pessoa por foto, até com dois cliques simultâneos.
 */

const Report = require('./reportModel');
const Photo = require('../photo/photoModel');
const { httpError } = require('../../utils/httpError');

async function reportPhoto(userId, photoId, reason) {
  const photo = await Photo.findByPk(photoId, { attributes: ['id', 'userId'] });
  if (!photo) throw httpError('Foto não encontrada.', 404);

  if (Number(photo.userId) === Number(userId)) {
    throw httpError('Você não pode denunciar a sua própria foto.', 400);
  }

  const [report, created] = await Report.findOrCreate({
    where: { userId, photoId },
    defaults: { reason },
  });

  if (!created) throw httpError('Você já denunciou esta foto.', 409);

  return { id: report.id, photoId: report.photoId, reason: report.reason };
}

module.exports = { reportPhoto };
