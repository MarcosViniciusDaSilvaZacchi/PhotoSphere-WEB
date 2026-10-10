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
  },
};
