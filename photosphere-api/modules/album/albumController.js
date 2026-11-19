/**
 * modules/album/albumController.js — Controlador dos álbuns (Aula 13).
 *
 * Todo id que vem de req.params ou do corpo passa pelo parseId (400 se malformado)
 * antes de chegar ao service, que só recebe números.
 */

const albumService = require('./albumService');
const { parseId } = require('../../utils/parseId');

// GET /api/my-albums
exports.getMyAlbums = async (req, res) => {
  const albums = await albumService.getUserAlbums(req.user.id);
  return res.success('Seus álbuns foram obtidos com sucesso', albums);
};

// POST /api/albums
exports.createAlbum = async (req, res) => {
  const { title, description, isPublic } = req.body;
  const album = await albumService.createAlbum(req.user.id, { title, description, isPublic });
  return res.success('Álbum criado com sucesso!', album, 201);
};

// GET /api/albums/:id (optionalAuth)
exports.getAlbumDetails = async (req, res) => {
  const albumId = parseId(req.params.id, 'álbum');
  const currentUserId = req.user ? req.user.id : null;
  const { album, photos, isOwner } = await albumService.getAlbumById(albumId, currentUserId);
  return res.success('Álbum obtido com sucesso', { ...album.toJSON(), photos, isOwner });
};

// DELETE /api/albums/:id
exports.deleteAlbum = async (req, res) => {
  const albumId = parseId(req.params.id, 'álbum');
  const result = await albumService.deleteAlbum(req.user.id, albumId);
  return res.success('Álbum excluído com sucesso!', result);
};

// POST /api/albums/:id/photos  { photoId }
exports.addPhoto = async (req, res) => {
  const albumId = parseId(req.params.id, 'álbum');
  const photoId = parseId(req.body.photoId, 'foto');
  const result = await albumService.addPhotoToAlbum(req.user.id, albumId, photoId);

  // 201 quando a foto entrou agora; 200 quando ela já estava (idempotente)
  return result.added
    ? res.success('Foto adicionada ao álbum!', result, 201)
    : res.success('Esta foto já estava no álbum.', result, 200);
};

// DELETE /api/albums/:id/photos/:photoId
exports.removePhoto = async (req, res) => {
  const albumId = parseId(req.params.id, 'álbum');
  const photoId = parseId(req.params.photoId, 'foto');
  const result = await albumService.removePhotoFromAlbum(req.user.id, albumId, photoId);
  return res.success('Foto removida do álbum.', result);
};

// GET /api/photos/:photoId/albums-status
exports.getAlbumsStatus = async (req, res) => {
  const photoId = parseId(req.params.photoId, 'foto');
  const albums = await albumService.getAlbumsStatusForPhoto(req.user.id, photoId);
  return res.success('Status dos álbuns obtido com sucesso', albums);
};
