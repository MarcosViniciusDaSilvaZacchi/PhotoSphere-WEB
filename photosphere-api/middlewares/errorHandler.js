/**
 * middlewares/errorHandler.js — Destino final centralizado de erros da API.
 */

module.exports = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.status || 500;
  const errors = err.errors || [];
  
  // Utiliza a função res.error adicionada pelo apiResponse middleware
  if (res.error) {
    return res.error(err.message || 'Ocorreu um erro inesperado.', errors, statusCode);
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Ocorreu um erro inesperado.',
    errors,
  });
};
