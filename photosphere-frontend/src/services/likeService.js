/**
 * services/likeService.js — Curtidas (Aula 10).
 */

import api from './api'

/**
 * Curte ou descurte a foto. Resposta: { liked, likesCount }.
 * @param {number|string} photoId
 */
export function toggleLike(photoId) {
  return api.post(`/photos/${photoId}/toggle-like`)
}

/**
 * Consulta se o usuário atual curtiu a foto (visitante → liked: false).
 * @param {number|string} photoId
 */
export function getLikeStatus(photoId) {
  return api.get(`/photos/${photoId}/like-status`)
}

/**
 * Lista as fotos curtidas pelo usuário logado.
 */
export function getLikedPhotos() {
  return api.get('/liked-photos')
}
