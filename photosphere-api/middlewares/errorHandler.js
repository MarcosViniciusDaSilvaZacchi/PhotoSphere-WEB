/**
 * middlewares/errorHandler.js — Destino final centralizado de erros da API.
 *
 * Aula 09: além de padronizar a resposta de erro, este middleware agora faz a
 * LIMPEZA DE ARQUIVOS ÓRFÃOS. O Multer grava o arquivo no disco ANTES do
 * validador e do controller rodarem; se a requisição falhar depois disso
 * (título vazio → 400, foto de outra pessoa → 403, foto inexistente → 404,
 * erro de banco → 500), o arquivo ficaria no disco sem nenhum registro
 * apontando para ele. Aqui ele é apagado.
 *
 * ⚠️ Precisa continuar sendo o ÚLTIMO app.use() do server.js.
 */

const { removeFile } = require('../utils/fileStorage');

/**
 * Junta todos os arquivos que o Multer gravou nesta requisição,
 * cobrindo .single() (req.file), .array() e .fields() (req.files).
 */
function collectUploadedFiles(req) {
  const files = [];
  if (req.file) files.push(req.file);
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((list) => files.push(...list));
  }
  return files;
}

// Mensagens amigáveis para os erros internos do Multer
const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'O arquivo enviado excede o tamanho máximo permitido.',
  LIMIT_UNEXPECTED_FILE: 'Campo de arquivo inesperado na requisição.',
};

module.exports = async (err, req, res, next) => {
  // 1. Limpeza de órfãos: nenhum arquivo de uma requisição que falhou fica no disco
  const orphans = collectUploadedFiles(req);
  if (orphans.length > 0) {
    await Promise.all(orphans.map((file) => removeFile(file.path)));
    console.warn(`🧹 ${orphans.length} arquivo(s) órfão(s) removido(s) após erro ${err.status || 500}.`);
  }

  // 2. Normalização do status
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message;

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = MULTER_MESSAGES[err.code] || err.message;
  }

  if (statusCode >= 500) {
    console.error(err);
    if (!message) message = 'Ocorreu um erro inesperado.';
  }

  const errors = err.errors || [];

  // Utiliza a função res.error adicionada pelo apiResponse middleware
  if (res.error) {
    return res.error(message, errors, statusCode);
  }

  return res.status(statusCode).json({
    success: false,
    message: message || 'Ocorreu um erro inesperado.',
    errors,
  });
};
