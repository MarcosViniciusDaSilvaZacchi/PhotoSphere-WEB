/**
 * searchService.js — Camada de acesso a dados do módulo de busca.
 *
 * Aula 02: devolvia listas vazias fixas (ainda não havia banco).
 * Aula 13: busca de verdade — como prometido, este foi o ÚNICO arquivo da busca
 * que precisou mudar de verdade; rota e front continuaram com o mesmo contrato
 * ({ query, fotos, users } — o nome "fotos" vem da ficha da Aula 02).
 *
 * Entidade principal do PhotoSphere: fotos (busca no título).
 */

const { Op } = require('sequelize');
const Photo = require('../photo/photoModel');
const User = require('../user/userModel');
const { SEARCH } = require('../../config/constants');
const { escapeLike } = require('../../utils/escapeLike'); // Aula 15: extraído para utils/ (agora também usado pelo painel)

const PUBLIC_USER_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];

async function searchPhotos(query) {
  return Photo.findAll({
    where: { title: { [Op.like]: `%${escapeLike(query)}%` } },
    include: [{ model: User, as: 'author', attributes: PUBLIC_USER_ATTRIBUTES }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit: SEARCH.LIMIT,
  });
}

async function searchUsers(query) {
  const pattern = `%${escapeLike(query)}%`;
  return User.findAll({
    where: {
      [Op.or]: [{ username: { [Op.like]: pattern } }, { fullName: { [Op.like]: pattern } }],
    },
    attributes: PUBLIC_USER_ATTRIBUTES,
    order: [['username', 'ASC']],
    limit: SEARCH.LIMIT,
  });
}

/**
 * As duas consultas não dependem uma da outra → rodam em PARALELO (Promise.all).
 * Chamadas pelo nome (searchPhotos/searchUsers), sem "this": quem importa
 * globalSearch solto perderia o this e quebraria.
 */
async function globalSearch(query) {
  const [fotos, users] = await Promise.all([searchPhotos(query), searchUsers(query)]);
  return { fotos, users };
}

module.exports = { globalSearch, searchPhotos, searchUsers, escapeLike };
