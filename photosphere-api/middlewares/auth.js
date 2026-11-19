/**
 * middlewares/auth.js — Autenticação (quem é você?) e autorização de papel (Aula 15).
 *
 * isAuthenticated agora é ASSÍNCRONO e consulta o usuário no banco a cada requisição:
 *  - o token prova QUEM a pessoa era no momento do login; o banco diz como ela está AGORA;
 *  - conta apagada → 401; conta bloqueada → 401 (com a mensagem do bloqueio);
 *  - req.user é montado com o isAdmin DO BANCO, não o do token: um administrador
 *    rebaixado perde o acesso na hora, sem esperar o token expirar (7 dias).
 * Custo: uma consulta por requisição autenticada (pela chave primária, é barata).
 *
 * Aula 15 também tirou o atalho de desenvolvimento "dev-token" (registrado como
 * pendência no checkpoint-02.md): ele aceitava qualquer "dev-token..." como o usuário 1.
 *
 * isAdmin precisa vir DEPOIS do isAuthenticated: ele lê o req.user que o outro montou.
 */

const { verifyToken } = require('../config/jwt');
const User = require('../modules/user/userModel');

const BLOCKED_MESSAGE = 'Sua conta foi bloqueada. Entre em contato com a administração.';

async function isAuthenticated(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.error('Acesso não autorizado. Nenhum token fornecido.', null, 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.error('Formato de token inválido. Esperado "Bearer <token>".', null, 401);
  }

  // (a) try/catch SÓ da verificação do token
  let decoded;
  try {
    decoded = verifyToken(parts[1]);
  } catch (error) {
    return res.error('Token inválido ou expirado.', null, 401);
  }

  // (f) segundo try/catch: erros inesperados da consulta vão para o errorHandler
  try {
    // (b) como a pessoa está AGORA
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'username', 'isAdmin', 'isBlocked'] });

    // (c) conta apagada depois do login
    if (!user) {
      return res.error('Usuário não encontrado. Faça login novamente.', null, 401);
    }

    // (d) conta bloqueada depois do login
    if (user.isBlocked) {
      return res.error(BLOCKED_MESSAGE, null, 401);
    }

    // (e) o papel vem do banco
    req.user = { id: user.id, username: user.username, isAdmin: user.isAdmin };
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Autorização por papel: só administradores passam (403 para os demais).
 * 401 = "não sei quem você é"; 403 = "sei quem você é, e você não pode".
 */
function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.error('Acesso restrito a administradores.', null, 403);
  }
  return next();
}

module.exports = { isAuthenticated, isAdmin, BLOCKED_MESSAGE };
