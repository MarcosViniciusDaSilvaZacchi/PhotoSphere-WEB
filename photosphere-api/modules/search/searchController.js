/**
 * searchController.js — Camada de controle do módulo de busca.
 *
 * Aula 13: agora consulta o banco, então é async e PRECISA do await —
 * sem ele, "...results" espalharia uma promessa: a resposta seria 200, com o
 * query certo, e as listas simplesmente sumiriam (o erro mais traiçoeiro da aula).
 *
 * Entrada tratada:
 *  - typeof === 'string': ?q=ab&q=cd vira um ARRAY e ?q[x]=1 vira um OBJETO
 *    (o Express interpreta a query string assim); nos dois casos, busca vazia;
 *  - trim() e corte em SEARCH.MAX_LENGTH;
 *  - só consulta o banco com pelo menos SEARCH.MIN_LENGTH letras.
 */

const searchService = require('./searchService');
const { SEARCH } = require('../../config/constants');

/**
 * GET /api/search?q=termo
 * Busca global por fotos e usuários.
 */
async function search(req, res) {
  const raw = typeof req.query.q === 'string' ? req.query.q : '';
  const query = raw.trim().slice(0, SEARCH.MAX_LENGTH);

  let results = { fotos: [], users: [] };
  if (query.length >= SEARCH.MIN_LENGTH) {
    results = await searchService.globalSearch(query);
  }

  return res.success('Busca realizada com sucesso', { query, ...results });
}

module.exports = { search };
