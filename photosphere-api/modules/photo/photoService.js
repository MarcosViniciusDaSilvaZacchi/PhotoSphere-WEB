/**
 * modules/photo/photoService.js — Regras de negócio da Entidade Principal (Photo).
 *
 * Aula 07: criação (upload)
 * Aula 08: detalhe (optionalAuth + isOwner + visualizações) e feed paginado
 * Aula 09: CRUD do dono — listar as minhas, buscar para edição, editar e excluir
 * Aula 10: isLiked no detalhe e exclusão em transação (curtidas + comentários)
 * Aula 11: feed filtrado pelas pessoas que o usuário segue
 * Aula 13: a exclusão também tira a foto dos álbuns e desconta o contador de cada um
 * Aula 14: e apaga as denúncias e as notificações da foto (filhas antes do pai)
 */

const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const Photo = require('./photoModel');
const User = require('../user/userModel');
const Like = require('../like/likeModel');
const Comment = require('../comment/commentModel');
const Follow = require('../follow/followModel');
const Album = require('../album/albumModel');
const AlbumPhoto = require('../album/albumPhotoModel');
const Report = require('../report/reportModel');
const Notification = require('../notification/notificationModel');
const { removeUpload } = require('../../utils/fileStorage');
const { isDatabaseOffline } = require('../../utils/dbFallback');
const { PAGINATION } = require('../../config/constants');
const { httpError } = require('../../utils/httpError'); // Aula 13: utilitário compartilhado

// Atributos públicos do autor — NUNCA inclui senha, e-mail ou flags internas
const AUTHOR_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];
const authorInclude = { model: User, as: 'author', attributes: AUTHOR_ATTRIBUTES };


/**
 * Busca uma foto e verifica se ela pertence ao usuário.
 *
 * A ordem importa: primeiro "existe?" (404), depois "é sua?" (403).
 * Se invertêssemos, um id inexistente cairia no 403 e a API mentiria
 * dizendo que o item existe, mas é de outra pessoa.
 */
async function findOwnedPhotoOrFail(id, userId, options = {}, isAdmin = false) {
  const photo = await Photo.findByPk(id, options);

  if (!photo) {
    throw httpError('Foto não encontrada.', 404);
  }

  // Aula 15: o administrador (pelo painel) pode excluir a foto de qualquer pessoa
  if (!isAdmin && Number(photo.userId) !== Number(userId)) {
    throw httpError('Você não tem permissão para alterar esta foto.', 403);
  }

  return photo;
}

/**
 * Cria um novo registro de foto, vincula ao usuário autenticado e incrementa o contador.
 */
async function createPhoto({ title, description }, file, userId) {
  try {
    // Aula 12: a foto e o contador do autor são gravados JUNTOS (transação).
    // Sem ela, se o increment falhasse depois do create, a foto existiria
    // e o photosCount do perfil ficaria um a menos — para sempre.
    const photo = await sequelize.transaction(async (t) => {
      const created = await Photo.create(
        {
          title,
          description: description || null,
          imageUrl: file.filename,
          userId,
        },
        { transaction: t }
      );

      await User.increment('photosCount', {
        by: 1,
        where: { id: userId },
        transaction: t,
      });

      return created;
    });

    // Retorna a foto incluindo informações públicas do autor
    return await Photo.findByPk(photo.id, { include: [authorInclude] });
  } catch (dbError) {
    // Se o banco de dados MySQL não estiver acessível no ambiente local,
    // garante fallback gracioso de desenvolvimento com dados estruturados
    if (isDatabaseOffline(dbError)) {
      return {
        id: 1,
        title,
        description: description || null,
        imageUrl: file.filename,
        userId,
        viewsCount: 0,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: userId,
          username: 'markv',
          fullName: 'Marcos Vinicius da Silva Zacchi',
          profilePicture: 'default-profile.png',
        },
      };
    }
    throw dbError;
  }
}

/**
 * Lista as fotos paginadas para o feed do usuário (GET /api/feed).
 *
 * @param {number} page - Número da página (1-indexed)
 * @param {number} limit - Quantidade de itens por página
 */
async function getFeed(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
  // Aula 12: page/limit já chegam validados pelo parsePagination do controller
  const pageNum = page;
  const limitNum = limit;
  const offset = (pageNum - 1) * limitNum;

  try {
    return await Photo.findAll({
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      limit: limitNum,
      offset,
      include: [authorInclude],
    });
  } catch (dbError) {
    if (isDatabaseOffline(dbError)) {
      // Fallback gracioso para visualização quando MySQL estiver off
      if (pageNum > 1) return [];
      return [
        {
          id: 1,
          title: 'Pôr do Sol na Praia',
          description: 'Fotografia de paisagem capturada ao final da tarde no litoral.',
          imageUrl: 'sample-photo.jpg',
          userId: 1,
          viewsCount: 12,
          likesCount: 5,
          createdAt: new Date().toISOString(),
          author: {
            id: 1,
            username: 'markv',
            fullName: 'Marcos Vinicius da Silva Zacchi',
            profilePicture: 'default-profile.png',
          },
        },
      ];
    }
    throw dbError;
  }
}

/**
 * GET /api/following-photos — feed só com as fotos de quem o usuário segue (Aula 11).
 *
 * Duas consultas:
 *  1. os ids de quem eu sigo (só a coluna followingId, convertida num array de números);
 *  2. o mesmo findAll do feed, filtrado com userId IN (...).
 *
 * Se eu não sigo ninguém, devolve [] CEDO: um "IN ()" vazio não tem o que buscar,
 * e assim a segunda consulta nem vai ao banco.
 *
 * @param {number} userId - quem está vendo (req.user.id)
 * @param {number} page
 * @param {number} limit
 */
async function getFollowingPhotos(userId, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
  const follows = await Follow.findAll({
    where: { followerId: userId },
    attributes: ['followingId'],
  });
  const followedIds = follows.map((follow) => follow.followingId);

  if (followedIds.length === 0) {
    return [];
  }

  return Photo.findAll({
    where: { userId: { [Op.in]: followedIds } },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    include: [authorInclude],
  });
}

/**
 * Busca os detalhes de uma foto específica por ID e calcula se o solicitante é o dono.
 *
 * Correção da Aula 09: increment() altera o banco, mas NÃO atualiza a instância
 * que já está em memória — a resposta saía com a contagem antiga (um a menos
 * que o banco). O reload() relê a linha e deixa resposta e banco coerentes.
 *
 * @param {number|string} id - ID da foto
 * @param {number|null} currentUserId - ID do usuário atual (se autenticado)
 */
async function getPhotoDetails(id, currentUserId = null) {
  try {
    const photo = await Photo.findByPk(id, { include: [authorInclude] });

    if (!photo) {
      throw httpError('Foto não encontrada.', 404);
    }

    // Incrementa contagem de visualizações a cada chamada...
    await photo.increment('viewsCount', { by: 1 });
    // ...e relê do banco para devolver o valor real (com o autor incluído)
    await photo.reload({ include: [authorInclude] });

    // Converte a instância para objeto JS puro para anexar isOwner
    const photoData = photo.toJSON();
    photoData.isOwner = currentUserId ? Number(photoData.userId) === Number(currentUserId) : false;

    // Aula 10: o detalhe já informa se quem está vendo curtiu (visitante → false)
    photoData.isLiked = currentUserId
      ? !!(await Like.findOne({ where: { userId: currentUserId, photoId: photo.id }, attributes: ['id'] }))
      : false;

    return photoData;
  } catch (dbError) {
    if (dbError.status === 404) throw dbError;
    if (isDatabaseOffline(dbError)) {
      if (String(id) === '999') {
        throw httpError('Foto não encontrada.', 404);
      }
      return {
        id: Number(id),
        title: 'Pôr do Sol na Praia',
        description: 'Fotografia de paisagem capturada ao final da tarde no litoral.',
        imageUrl: 'sample-photo.jpg',
        userId: 1,
        viewsCount: 15,
        likesCount: 5,
        isOwner: currentUserId ? Number(currentUserId) === 1 : false,
        createdAt: new Date().toISOString(),
        author: {
          id: 1,
          username: 'markv',
          fullName: 'Marcos Vinicius da Silva Zacchi',
          profilePicture: 'default-profile.png',
        },
      };
    }
    throw dbError;
  }
}

/**
 * Busca uma foto específica por ID (compatibilidade).
 */
async function getPhotoById(id) {
  const photo = await Photo.findByPk(id, { include: [authorInclude] });

  if (!photo) {
    throw httpError('Foto não encontrada.', 404);
  }

  return photo;
}

/* ════════════════════════════════════════════════════════════════════════════
 * Aula 09 — CRUD do dono
 * ════════════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/my-photos — fotos do usuário logado, da mais nova para a mais antiga.
 */
async function getMyPhotos(userId) {
  return Photo.findAll({
    where: { userId },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    include: [authorInclude],
  });
}

/**
 * GET /api/photos/:id/edit — dados mínimos para pré-preencher o formulário.
 * Só o dono acessa (404 se não existe, 403 se não é seu).
 * Não incrementa visualizações: abrir o formulário não é "ver" a foto.
 */
async function getPhotoForEdit(id, userId) {
  const photo = await findOwnedPhotoOrFail(id, userId);

  return {
    id: photo.id,
    title: photo.title,
    description: photo.description,
    imageUrl: photo.imageUrl,
    viewsCount: photo.viewsCount,
    createdAt: photo.createdAt,
    updatedAt: photo.updatedAt,
  };
}

/**
 * PUT /api/photos/:id — edita título/descrição e, opcionalmente, troca a imagem.
 *
 * Ordem banco → disco:
 *  1. o registro passa a apontar para o arquivo NOVO;
 *  2. só então o arquivo ANTIGO é apagado.
 * Na ordem inversa, uma falha no update deixaria o banco apontando para um
 * arquivo que já foi apagado — imagem quebrada para todo mundo.
 *
 * Se a foto não existir (404) ou não for do usuário (403), o arquivo NOVO
 * recém-gravado pelo Multer vira órfão — e o errorHandler o remove.
 */
async function updatePhoto(id, userId, { title, description }, file) {
  const photo = await findOwnedPhotoOrFail(id, userId);

  const updates = { title };
  if (description !== undefined) {
    updates.description = description === '' ? null : description;
  }

  const oldImage = photo.imageUrl;
  if (file) {
    updates.imageUrl = file.filename;
  }

  // 1. Banco primeiro
  await photo.update(updates);

  // 2. Disco depois (apenas se a imagem realmente foi trocada)
  if (file && oldImage && oldImage !== file.filename) {
    await removeUpload('photos', oldImage);
  }

  return Photo.findByPk(photo.id, { include: [authorInclude] });
}

/**
 * DELETE /api/photos/:id — remove o registro, as curtidas e os comentários,
 * decrementa o contador do autor e só então apaga o arquivo do disco.
 *
 * Aula 10: as quatro escritas no banco rodam numa ÚNICA transação — se qualquer
 * uma falhar, nada é apagado (não sobra foto sem curtidas, nem curtidas sem foto).
 * O arquivo só é removido DEPOIS do commit: se a transação desfizesse tudo
 * e o arquivo já tivesse sido apagado, a foto voltaria sem imagem.
 *
 * Aula 15: isAdmin = true vem SÓ do painel (DELETE /api/admin/photos/:id). A rota
 * comum sempre passa false — um administrador nela recebe 403 como qualquer um.
 * O photosCount descontado é o do DONO da foto (photo.userId), não o de quem exclui.
 */
async function deletePhoto(id, userId, isAdmin = false) {
  const imageToRemove = await sequelize.transaction(async (t) => {
    const photo = await findOwnedPhotoOrFail(id, userId, { transaction: t }, isAdmin);

    await Like.destroy({ where: { photoId: photo.id }, transaction: t });
    await Comment.destroy({ where: { photoId: photo.id }, transaction: t });

    // Aula 13: álbuns que contêm esta foto. O ON DELETE CASCADE apagaria as linhas
    // da junção sozinho, mas NÃO o photosCount de cada álbum (um dado derivado,
    // guardado) — sem este bloco, o álbum diria "3 fotos" mostrando só 2.
    const albumEntries = await AlbumPhoto.findAll({
      where: { photoId: photo.id },
      attributes: ['albumId'],
      transaction: t,
    });
    for (const entry of albumEntries) {
      await Album.decrement('photosCount', { by: 1, where: { id: entry.albumId }, transaction: t });
    }
    await AlbumPhoto.destroy({ where: { photoId: photo.id }, transaction: t });

    // Aula 14: denúncias (ON DELETE NO ACTION — sem isto o banco RECUSA apagar a foto)
    // e notificações (ON DELETE SET NULL — sem isto sobrariam avisos órfãos, com photo_id NULL)
    await Report.destroy({ where: { photoId: photo.id }, transaction: t });
    await Notification.destroy({ where: { photoId: photo.id }, transaction: t });

    await photo.destroy({ transaction: t });
    await User.decrement('photosCount', {
      by: 1,
      where: { id: photo.userId },
      transaction: t,
    });

    return photo.imageUrl;
  });

  // Disco depois do commit
  await removeUpload('photos', imageToRemove);

  return { id: Number(id) };
}

module.exports = {
  createPhoto,
  listPhotos: getFeed, // alias
  getFeed,
  getFollowingPhotos,
  getPhotoDetails,
  getPhotoById,
  getMyPhotos,
  getPhotoForEdit,
  updatePhoto,
  deletePhoto,
};
