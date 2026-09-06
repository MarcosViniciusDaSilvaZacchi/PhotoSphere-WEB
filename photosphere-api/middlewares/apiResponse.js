// middlewares/apiResponse.js
// Define um padrão único de resposta JSON para toda a API.
// Em vez de cada rota montar o próprio JSON, elas chamam res.success() ou res.error()
// e este middleware garante que o formato seja sempre o mesmo.

const apiResponse = (req, res, next) => {
  // Resposta de SUCESSO: { success: true, message: "...", data: { ... } }
  res.success = (message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  // Resposta de ERRO: { success: false, message: "...", errors: [ ... ] }
  res.error = (message, errors = null, statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  };

  next(); // passa para o próximo middleware ou rota
};

module.exports = apiResponse;
