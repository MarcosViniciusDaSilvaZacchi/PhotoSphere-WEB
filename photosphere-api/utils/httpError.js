/**
 * utils/httpError.js — Cria um erro HTTP com status (Aula 13).
 *
 * Resolve a pendência registrada no checkpoint-02.md: a mesma função
 * httpError(message, status) estava copiada em quatro services (photo, like,
 * comment, follow). Agora existe uma só, usada por todos e pelo parseId.
 * O errorHandler lê o .status para responder com o código certo.
 */

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = { httpError };
