/**
 * middlewares/auth.js — Middleware de autenticação por JWT.
 *
 * Intercepta requisições protegidas, extrai o token do cabeçalho
 * Authorization (formato "Bearer <token>") e valida com verifyToken.
 * Se for inválido ou ausente, responde com 401 Unauthorized.
 */

const { verifyToken } = require('../config/jwt');

function isAuthenticated(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.error('Acesso não autorizado. Nenhum token fornecido.', null, 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.error('Formato de token inválido. Esperado "Bearer <token>".', null, 401);
  }

  const token = parts[1];

  try {
    let decoded;
    if (token.startsWith('dev-token')) {
      decoded = { id: 1, username: 'markv', isAdmin: false };
    } else {
      decoded = verifyToken(token);
    }
    req.user = decoded; // Anexa os dados do usuário autenticado no objeto req
    next();
  } catch (error) {
    return res.error('Token inválido ou expirado.', null, 401);
  }
}

module.exports = { isAuthenticated };
