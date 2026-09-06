/**
 * services/userService.js — Serviços de gerenciamento e perfil do usuário.
 */

import api from './api'

/**
 * Obtém os dados do perfil do usuário autenticado.
 */
export function getMyProfile() {
  return api.get('/profile/me')
}

/**
 * Atualiza os dados do perfil (nome, bio e/ou foto) usando FormData.
 *
 * ⚠️ Esta é a única chamada de toda a aplicação a enviar multipart/form-data.
 * O navegador anexa automaticamente o header 'Content-Type: multipart/form-data; boundary=...'
 * contendo o boundary correto para separar os campos de texto do arquivo binário.
 *
 * @param {FormData} formData - Objeto FormData contendo fullName, bio e/ou profilePicture
 */
export function updateProfile(formData) {
  return api.put('/profile/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * Obtém o perfil público de qualquer usuário pelo username.
 */
export function getPublicProfile(username) {
  return api.get(`/profile/${username}`)
}
