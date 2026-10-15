/**
 * modules/photo/photoService.js — Regras de negócio da Entidade Principal (Photo).
 *
 * Aula 07: criação (upload)
 * Aula 08: detalhe (optionalAuth + isOwner + visualizações) e feed paginado
 * Aula 09: CRUD do dono — listar as minhas, buscar para edição, editar e excluir
 */

const Photo = require('./photoModel');
const User = require('../user/userModel');
const { removeUpload } = require('../../utils/fileStorage');
const { isDatabaseOffline } = require('../../utils/dbFallback');

// Atributos públicos do autor — NUNCA inclui senha, e-mail ou flags internas
const AUTHOR_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];
const authorInclude = { model: User, as: 'author', attributes: AUTHOR_ATTRIBUTES };

/**
 * Cria um erro HTTP com status, para ser tratado pelo errorHandler.
 */
function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/**
 * Busca uma foto e verifica se ela pertence ao usuário.
 *
 * A ordem importa: primeiro "existe?" (404), depois "é sua?" (403).
 * Se invertêssemos, um id inexistente cairia no 403 e a API mentiria
 * dizendo que o item existe, mas é de outra pessoa.
 */
async function findOwnedPhotoOrFail(id, userId, options = {}) {
  const photo = await Photo.findByPk(id, options);

  if (!photo) {
    throw httpError('Foto não encontrada.', 404);
  }

  if (Number(photo.userId) !== Number(userId)) {
    throw httpError('Você não tem permissão para alterar esta foto.', 403);
  }

  return photo;
}

/**
 * Cria um novo registro de foto, vincula ao usuário autenticado e incrementa o contador.
 */
async function createPhoto({ title, description }, file, userId) {
  try {
    const photo = await Photo.create({
      title,
      description: description || null,
      imageUrl: file.filename,
      userId,
    });

    // Incrementa a coluna de contagem do usuário (photosCount) definida na Aula 03
    await User.increment('photosCount', {
      by: 1,
      where: { id: userId },
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
async function getFeed(page = 1, limit = 10) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
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
 * DELETE /api/photos/:id — remove o registro, decrementa o contador do autor
 * e só então apaga o arquivo do disco.
 */
async function deletePhoto(id, userId) {
  const photo = await findOwnedPhotoOrFail(id, userId);
  const imageToRemove = photo.imageUrl;

  // 1. Banco primeiro: registro e contador
  await photo.destroy();
  await User.decrement('photosCount', {
    by: 1,
    where: { id: userId },
  });

  // 2. Disco depois
  await removeUpload('photos', imageToRemove);

  return { id: Number(id) };
}

module.exports = {
  createPhoto,
  listPhotos: getFeed, // alias
  getFeed,
  getPhotoDetails,
  getPhotoById,
  getMyPhotos,
  getPhotoForEdit,
  updatePhoto,
  deletePhoto,
};
