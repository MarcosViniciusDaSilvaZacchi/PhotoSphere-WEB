/**
 * middlewares/asyncHandler.js — Capturador de erros assíncronos.
 *
 * Encapsula funções async para que qualquer Promise rejeitada seja
 * automaticamente repassada para o next(err) do Express 4.
 */

module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
