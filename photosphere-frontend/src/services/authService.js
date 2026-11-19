/**
 * authService.js — Serviço de autenticação do PhotoSphere.
 *
 * Aula 12: login, cadastro e logout são FORMULÁRIOS/ações de sessão — marcados
 * com { silent: true } para o interceptor não mostrar toast: o erro aparece no
 * próprio formulário. No Axios, a config é o SEGUNDO argumento do get/delete e o
 * TERCEIRO do post/put (o segundo é o corpo).
 */

import api from './api'

/**
 * Autentica o usuário com email e senha.
 * @param {string} email
 * @param {string} password
 */
export function login(email, password) {
  return api.post('/login', { email, password }, { silent: true })
}

/**
 * Cadastra um novo usuário.
 * @param {object} userData - { username, email, password, confirmPassword, fullName }
 */
export function register(userData) {
  return api.post('/register', userData, { silent: true })
}

/**
 * Encerra a sessão do usuário.
 */
export function logout() {
  return api.post('/logout', null, { silent: true })
}
