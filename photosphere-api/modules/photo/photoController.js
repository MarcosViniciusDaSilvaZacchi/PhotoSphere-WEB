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
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const photos = await photoService.listPhotos(limit);

  return res.success('Fotos obtidas com sucesso', photos);
};

exports.getPhoto = async (req, res) => {
  const photo = await photoService.getPhotoById(req.params.id);

  return res.success('Foto obtida com sucesso', photo);
};
