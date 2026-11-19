/**
 * config/constants.js — Regras e limites de validação centralizados.
 *
 * O front-end espelha exatamente estes mesmos valores na validação client-side.
 */

module.exports = {
  VALIDATION: {
    USERNAME_MIN: 3,
    USERNAME_MAX: 20,
    PASSWORD_MIN: 6,
    BIO_MAX: 255,
    TITLE_MAX: 100,
    DESCRIPTION_MAX: 500,
    COMMENT_MAX: 500, // Aula 10: limite do texto de um comentário
  },

  // Aula 12: paginação dos feeds — o "tamanho de página" deixa de ficar solto nos services
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50, // teto: ?limit=100000 não pode puxar a tabela inteira
  },
};
