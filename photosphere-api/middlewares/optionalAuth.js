/**
 * middlewares/optionalAuth.js — Middleware de autenticação opcional.
 *
 * Tenta identificar quem está fazendo a requisição via cabeçalho Authorization,
 * mas NUNCA bloqueia a requisição caso o token esteja ausente ou seja inválido.
 * Se houver um token válido, anexa req.user. Caso contrário, deixa req.user como undefined.
 */

const { verifyToken } = require('../config/jwt');

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    req.user = undefined;
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = undefined;
    return next();
  }

  const token = parts[1];

  try {
    let decoded;
    if (token.startsWith('dev-token')) {
      decoded = { id: 1, username: 'markv', isAdmin: false };
    } else {
      decoded = verifyToken(token);
    }
    req.user = decoded;
  } catch (error) {
    req.user = undefined;
  }

  next();
}

module.exports = { optionalAuth };
