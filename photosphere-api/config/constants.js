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
    // Aula 13: álbum (a "coleção" do PhotoSphere)
    ALBUM_TITLE_MIN: 3,
    ALBUM_TITLE_MAX: 100,
    ALBUM_DESCRIPTION_MAX: 500,
  },

  // Aula 13: busca de verdade (GET /api/search)
  SEARCH: {
    MIN_LENGTH: 2,   // menos que isso não consulta o banco
    MAX_LENGTH: 100, // o termo é cortado aqui
    LIMIT: 10,       // máximo de fotos e de pessoas por resposta
  },

  // Aula 14: tipos de notificação (as três ações que geram aviso para o dono)
  NOTIFICATION: {
    TYPES: {
      LIKE: 'like',
      COMMENT: 'comment',
      FOLLOW: 'follow',
    },
  },

  // Aula 14: os cinco motivos de denúncia — FIXOS para todos os projetos
  // (a Aula 15 lê as denúncias com esta mesma lista)
  REPORT: {
    REASONS: ['inappropriate_content', 'harassment', 'spam', 'copyright', 'other'],
    // Aula 15: situação da denúncia (o painel marca como revisada)
    STATUS: {
      PENDING: 'pending',
      REVIEWED: 'reviewed',
    },
  },

  // Aula 15: painel de administração
  ADMIN: {
    REPORT_FILTERS: ['pending', 'reviewed', 'all'],
  },

  // Aula 12: paginação dos feeds — o "tamanho de página" deixa de ficar solto nos services
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50, // teto: ?limit=100000 não pode puxar a tabela inteira
  },
};
