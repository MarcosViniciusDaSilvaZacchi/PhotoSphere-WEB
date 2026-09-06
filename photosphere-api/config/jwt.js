/**
 * config/jwt.js — Configurações, geração e verificação de tokens JWT.
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_photosphere';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Gera um token JWT assinado para o usuário.
 * O payload inclui dados essenciais e não sensíveis (id, username, isAdmin).
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica se um token é válido e decodifica seu payload.
 * Lança erro se for inválido ou expirado.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  generateToken,
  verifyToken,
};
