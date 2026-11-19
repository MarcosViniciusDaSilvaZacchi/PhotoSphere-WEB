/**
 * modules/album/albumService.js — Regras de negócio dos álbuns (Aula 13).
 *
 * Toda escrita dupla (linha na junção + photosCount do álbum) roda numa transação,
 * com { transaction: t } em todos os comandos. O contador só muda quando a linha
 * realmente nasceu (created) ou foi realmente apagada (destroy devolveu 1) — se o
 * increment/decrement ficasse fora do if, cada clique repetido faria o número mentir.
 *
 * Ordem das checagens nas rotas de escrita: 400 (id malformado, no controller)
 * → 404 (não existe) → 403 (existe, mas é de outra pessoa).
 */

const sequelize = require('../../config/database');
const Album = require('./albumModel');
const AlbumPhoto = require('./albumPhotoModel');
const Photo = require('../photo/photoModel');
const User = require('../user/userModel');
const { httpError } = require('../../utils/httpError');

const PUBLIC_USER_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];
const ALBUM_ATTRIBUTES = ['id', 'title', 'description', 'isPublic', 'photosCount', 'userId', 'createdAt', 'updatedAt'];

/**
 * 404 se o álbum não existe; 403 se é de outra pessoa. Usada por adicionar, remover e excluir.
 */
async function findOwnedAlbumOrFail(albumId, userId, options = {}) {
  const album = await Album.findByPk(albumId, options);
  if (!album) throw httpError('Álbum não encontrado.', 404);
  if (Number(album.userId) !== Number(userId)) {
    throw httpError('Você não tem permissão para alterar este álbum.', 403);
  }
  return album;
}

/**
 * POST /api/albums
 * isPublic só é true se vier EXATAMENTE true — Boolean("false") seria true.
 */
async function createAlbum(userId, { title, description, isPublic }) {
  const album = await Album.create({
    title,
    description: description || null,
    isPublic: isPublic === true,
    userId,
  });
  return Album.findByPk(album.id, { attributes: ALBUM_ATTRIBUTES });
}

/**
 * GET /api/my-albums — os álbuns da pessoa, do mais novo para o mais antigo.
 * id DESC desempata: createdAt tem precisão de segundos, e dois álbuns criados
 * no mesmo segundo ficariam em ordem imprevisível.
 */
async function getUserAlbums(userId) {
  return Album.findAll({
    where: { userId },
    attributes: ALBUM_ATTRIBUTES,
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
  });
}

/**
 * GET /api/albums/:id (optionalAuth)
 * Público: qualquer um vê. Privado: só a dona (os outros recebem 403).
 * isOwner checa currentUserId !== null PRIMEIRO: um visitante (null) comparado
 * com Number() viraria 0 e, em outro formato de id, poderia "casar" por acidente.
 */
async function getAlbumById(albumId, currentUserId = null) {
  const album = await Album.findByPk(albumId, {
    attributes: ALBUM_ATTRIBUTES,
    include: [{ model: User, as: 'owner', attributes: PUBLIC_USER_ATTRIBUTES }],
  });
  if (!album) throw httpError('Álbum não encontrado.', 404);

  const isOwner = currentUserId !== null && Number(album.userId) === Number(currentUserId);
  if (!album.isPublic && !isOwner) {
    throw httpError('Este álbum é privado.', 403);
  }

  const entries = await AlbumPhoto.findAll({
    where: { albumId: album.id },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    include: [
      {
        model: Photo,
        as: 'photo',
        required: true,
        include: [{ model: User, as: 'author', attributes: PUBLIC_USER_ATTRIBUTES }],
      },
    ],
  });

  return { album, photos: entries.map((entry) => entry.photo), isOwner };
}

/**
 * POST /api/albums/:id/photos — adicionar é IDEMPOTENTE:
 * 1ª vez → cria a linha e sobe o contador (added: true);
 * repetição → nada muda (added: false) e o contador fica igual.
 */
async function addPhotoToAlbum(userId, albumId, photoId) {
  return sequelize.transaction(async (t) => {
    const album = await findOwnedAlbumOrFail(albumId, userId, { transaction: t });

    const photo = await Photo.findByPk(photoId, { attributes: ['id'], transaction: t });
    if (!photo) throw httpError('Foto não encontrada.', 404);

    const [, created] = await AlbumPhoto.findOrCreate({
      where: { albumId, photoId },
      transaction: t,
    });

    if (created) {
      await album.increment('photosCount', { by: 1, transaction: t });
    }

    await album.reload({ transaction: t });
    return { added: created, photosCount: album.photosCount };
  });
}

/**
 * DELETE /api/albums/:id/photos/:photoId — remover NÃO é idempotente:
 * se a foto não está no álbum, não há o que remover → 404.
 */
async function removePhotoFromAlbum(userId, albumId, photoId) {
  return sequelize.transaction(async (t) => {
    const album = await findOwnedAlbumOrFail(albumId, userId, { transaction: t });

    const removed = await AlbumPhoto.destroy({ where: { albumId, photoId }, transaction: t });
    if (removed === 0) throw httpError('Esta foto não está neste álbum.', 404);

    await album.decrement('photosCount', { by: 1, transaction: t });
    await album.reload({ transaction: t });
    return { removed: true, photosCount: album.photosCount };
  });
}

/**
 * DELETE /api/albums/:id — filhas antes do pai: as linhas da junção, depois o álbum.
 * As fotos continuam existindo (só saem deste álbum).
 */
async function deleteAlbum(userId, albumId) {
  await sequelize.transaction(async (t) => {
    const album = await findOwnedAlbumOrFail(albumId, userId, { transaction: t });
    await AlbumPhoto.destroy({ where: { albumId: album.id }, transaction: t });
    await album.destroy({ transaction: t });
  });
  return { id: albumId };
}

/**
 * GET /api/photos/:photoId/albums-status — os MEUS álbuns, cada um dizendo se
 * já contém a foto (hasPhoto). É o que o modal "Salvar" usa para vir já marcado.
 */
async function getAlbumsStatusForPhoto(userId, photoId) {
  const photo = await Photo.findByPk(photoId, { attributes: ['id'] });
  if (!photo) throw httpError('Foto não encontrada.', 404);

  const albums = await getUserAlbums(userId);
  if (albums.length === 0) return [];

  const entries = await AlbumPhoto.findAll({
    where: { photoId, albumId: albums.map((album) => album.id) },
    attributes: ['albumId'],
  });
  const withPhoto = new Set(entries.map((entry) => entry.albumId));

  return albums.map((album) => ({
    id: album.id,
    title: album.title,
    isPublic: album.isPublic,
    photosCount: album.photosCount,
    hasPhoto: withPhoto.has(album.id),
  }));
}

module.exports = {
  createAlbum,
  getUserAlbums,
  getAlbumById,
  addPhotoToAlbum,
  removePhotoFromAlbum,
  deleteAlbum,
  getAlbumsStatusForPhoto,
};
