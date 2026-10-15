/**
 * modules/photo/photoController.js — Controlador da Entidade Principal (Photo).
 */

const photoService = require('./photoService');

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
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const photos = await photoService.getFeed(page, limit);

  return res.success('Fotos obtidas com sucesso', photos);
};

exports.getFeed = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const photos = await photoService.getFeed(page, limit);

  return res.success('Feed obtido com sucesso', photos);
};

exports.getPhoto = async (req, res) => {
  const currentUserId = req.user ? req.user.id : null;
  const photo = await photoService.getPhotoDetails(req.params.id, currentUserId);

  return res.success('Foto obtida com sucesso', photo);
};
