/**
 * modules/like/likeController.js — Controlador das curtidas (Aula 10).
 *
 * Atenção à ordem dos parâmetros: o service espera (userId, photoId).
 * Os dois são números — trocar a ordem não gera erro, só grava dados trocados.
 */

const likeService = require('./likeService');
const { parseId } = require('../../utils/parseId'); // Aula 13

// POST /api/photos/:photoId/toggle-like
exports.toggleLike = async (req, res) => {
  const result = await likeService.toggleLike(req.user.id, parseId(req.params.photoId, 'foto'));

  // 201 quando criou uma curtida; 200 quando removeu
  return result.liked
    ? res.success('Foto curtida!', result, 201)
    : res.success('Curtida removida.', result, 200);
};

// GET /api/photos/:photoId/like-status
exports.getLikeStatus = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const status = await likeService.getLikeStatus(userId, parseId(req.params.photoId, 'foto'));
  return res.success('Status da curtida obtido com sucesso', status);
};

// GET /api/liked-photos
exports.getLikedPhotos = async (req, res) => {
  const photos = await likeService.getLikedPhotos(req.user.id);
  return res.success('Fotos curtidas obtidas com sucesso', photos);
};
