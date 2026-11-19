/**
 * utils/pagination.js — Leitura segura de ?page= e ?limit= (Aula 12).
 *
 * Antes, cada controller fazia parseInt(req.query.limit) || 12 por conta própria:
 *  - ?limit=-3       → -3 é "truthy", passava direto e virava LIMIT -3 (erro 500 no MySQL);
 *  - ?page=-2        → OFFSET negativo (erro 500);
 *  - ?limit=100000   → a tabela inteira numa resposta só.
 *
 * Regra daqui para frente: só vale um INTEIRO >= 1; qualquer outra coisa volta ao padrão.
 * Number.parseInt('abc') é NaN, e toda comparação com NaN dá false — então
 * `NaN >= 1` é false e o valor inválido cai no padrão sem precisar de um if só para ele.
 * É >= 1 (e não > 1): ?limit=1 é um valor válido e precisa ser respeitado.
 */

const { PAGINATION } = require('../config/constants');

function toPositiveInt(rawValue, fallback) {
  const value = Number.parseInt(rawValue, 10);
  return value >= 1 ? value : fallback;
}

/**
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number }}
 */
function parsePagination(query = {}) {
  const page = toPositiveInt(query.page, PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(toPositiveInt(query.limit, PAGINATION.DEFAULT_LIMIT), PAGINATION.MAX_LIMIT);
  return { page, limit };
}

module.exports = { parsePagination };
