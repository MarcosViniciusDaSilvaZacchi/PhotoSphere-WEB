/**
 * modules/follow/followController.js — Controlador de "seguir" (Aula 11).
 *
 * parseUserId faz a conversão NA BORDA: req.params.userId é SEMPRE texto ("5"),
 * e req.user.id (do token) é número (5). Comparar "5" === 5 dá false — sem a
 * conversão, a regra "não pode seguir a si mesmo" nunca disparava e a pessoa
 * conseguia se seguir sem nenhum erro. Convertido aqui, o service só recebe números.
 */

const followService = require('./followService');
const photoService = require('../photo/photoService');

/**
 * Converte o id da URL para um inteiro positivo, ou lança 400.
 * Number('abc') → NaN; Number('2.5') → 2.5; Number('-3') → -3 — todos recusados.
 */
function parseUserId(rawValue) {
  const id = Number(rawValue);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('Identificador de usuário inválido.');
    error.status = 400;
    throw error;
  }
  return id;
}

// POST /api/users/:userId/toggle-follow
exports.toggleFollow = async (req, res) => {
  const followingId = parseUserId(req.params.userId);
  const result = await followService.toggleFollow(req.user.id, followingId);

  // 201 quando passou a seguir (criou a linha); 200 quando deixou de seguir
  return result.isFollowing
    ? res.success('Agora você segue este usuário.', result, 201)
    : res.success('Você deixou de seguir este usuário.', result, 200);
};

// GET /api/users/:userId/follow-status
exports.getFollowStatus = async (req, res) => {
  const followingId = parseUserId(req.params.userId);
  const isFollowing = await followService.getFollowStatus(req.user.id, followingId);
  return res.success('Status obtido com sucesso', { isFollowing });
};

// GET /api/users/:userId/followers (público)
exports.getFollowers = async (req, res) => {
  const userId = parseUserId(req.params.userId);
  const followers = await followService.getFollowers(userId);
  return res.success('Seguidores obtidos com sucesso', followers);
};

// GET /api/users/:userId/following (público)
exports.getFollowing = async (req, res) => {
  const userId = parseUserId(req.params.userId);
  const following = await followService.getFollowing(userId);
  return res.success('Lista de quem o usuário segue obtida com sucesso', following);
};

// GET /api/following-photos — feed só com as fotos de quem eu sigo
exports.getFollowingPhotos = async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 12;
  const photos = await photoService.getFollowingPhotos(req.user.id, page, limit);
  return res.success('Fotos de quem você segue obtidas com sucesso', photos);
};
