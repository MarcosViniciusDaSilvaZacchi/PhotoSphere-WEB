/**
 * searchController.js — Camada de controle do módulo de busca.
 *
 * Responsabilidade: ler os parâmetros da requisição, chamar o service
 * e formatar a resposta usando res.success() / res.error().
 * Não sabe como o dado é obtido — isso é responsabilidade do service.
 */

const searchService = require('./searchService');

/**
 * GET /api/search?q=termo
 * Busca global por fotos e usuários.
 */
function search(req, res) {
  const query = req.query.q || ''; // se não vier o parâmetro, usa string vazia
  const result = searchService.globalSearch(query);

  res.success('Busca realizada com sucesso', {
    query,
    fotos: result.fotos,
    users: result.users,
  });
}

module.exports = { search };
