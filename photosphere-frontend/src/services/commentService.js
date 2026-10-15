/**
 * services/commentService.js — Comentários (Aula 10).
 */

import api from './api'

/**
 * Lista os comentários da foto (público, mais novos primeiro).
 * @param {number|string} photoId
 */
export function getComments(photoId) {
  return api.get(`/photos/${photoId}/comments`)
}

/**
 * Publica um comentário. A resposta já traz o autor, para entrar no topo da lista.
 * @param {number|string} photoId
 * @param {string} content
 */
export function createComment(photoId, content) {
  return api.post(`/photos/${photoId}/comments`, { content })
}
