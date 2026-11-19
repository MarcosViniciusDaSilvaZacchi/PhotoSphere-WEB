/**
 * modules/photo/photoController.js — Controlador da Entidade Principal (Photo).
 *
 * Só lê a requisição (params, query, body, file, user), chama o service
 * e responde com res.success(). Erros sobem para o errorHandler via asyncHandler.
 */

const photoService = require('./photoService');
const { parsePagination } = require('../../utils/pagination');
const { parseId } = require('../../utils/parseId'); // Aula 13

exports.createPhoto = async (req, res) => {
  const { title, description } = req.body;
  const newPhoto = await photoService.createPhoto(
    { title, description },
    req.file,
    req.user.id
  );

  return res.success('Foto publicada com sucesso!', newPhoto, 201);
};

exports.listPhotos = async (req, res) => {
  const { page, limit } = parsePagination(req.query); // Aula 12
  const photos = await photoService.getFeed(page, limit);

  return res.success('Fotos obtidas com sucesso', photos);
};

exports.getFeed = async (req, res) => {
  const { page, limit } = parsePagination(req.query); // Aula 12
  const photos = await photoService.getFeed(page, limit);

  return res.success('Feed obtido com sucesso', photos);
};

exports.getPhoto = async (req, res) => {
  const currentUserId = req.user ? req.user.id : null;
  const photo = await photoService.getPhotoDetails(parseId(req.params.id, 'foto'), currentUserId);

  return res.success('Foto obtida com sucesso', photo);
};

// ─── Aula 09: CRUD do dono ────────────────────────────────────────────────────

// GET /api/my-photos
exports.getMyPhotos = async (req, res) => {
  const photos = await photoService.getMyPhotos(req.user.id);
  return res.success('Suas fotos foram obtidas com sucesso', photos);
};

// GET /api/photos/:id/edit
exports.getPhotoForEdit = async (req, res) => {
  const photo = await photoService.getPhotoForEdit(parseId(req.params.id, 'foto'), req.user.id);
  return res.success('Dados da foto para edição obtidos com sucesso', photo);
};

// PUT /api/photos/:id
exports.updatePhoto = async (req, res) => {
  const { title, description } = req.body;
  const photo = await photoService.updatePhoto(
    parseId(req.params.id, 'foto'),
    req.user.id,
    { title, description },
    req.file // opcional: só existe se uma nova imagem foi enviada
  );
  return res.success('Foto atualizada com sucesso!', photo);
};

// DELETE /api/photos/:id
exports.deletePhoto = async (req, res) => {
  const result = await photoService.deletePhoto(parseId(req.params.id, 'foto'), req.user.id);
  return res.success('Foto excluída com sucesso!', result);
};
