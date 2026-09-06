/**
 * authService.js — Serviço de autenticação do PhotoSphere.
 *
 * Placeholder para aulas futuras.
 * As telas de Login e Registro chegam em aulas posteriores —
 * a estrutura já existe aqui para quando precisarmos.
 */

import api from './api'

/**
 * Autentica o usuário com email e senha.
 * @param {string} email
 * @param {string} password
 */
export function login(email, password) {
  return api.post('/login', { email, password })
}

/**
 * Cadastra um novo usuário.
 * @param {object} userData - { username, email, password, confirmPassword, fullName }
 */
export function register(userData) {
  return api.post('/register', userData)
}

/**
 * Encerra a sessão do usuário.
 */
export function logout() {
  return api.post('/logout')
}
