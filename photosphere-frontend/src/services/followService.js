/**
 * services/followService.js — Seguir pessoas (Aula 11).
 *
 * Espelho do modules/follow/ da API. As rotas de lista usam o ID da pessoa;
 * as telas usam o username na URL — quem converte é a tela (perfil → id → lista).
 */

import api from './api'
import { PAGE_SIZE } from '@/config/constants'

/**
 * Segue ou deixa de seguir. Resposta: { isFollowing, followersCount }.
 * @param {number} userId - quem será seguido
 */
export function toggleFollow(userId) {
  return api.post(`/users/${userId}/toggle-follow`)
}

/**
 * Quem segue a pessoa (público, mais recente primeiro).
 * @param {number} userId
 */
export function getFollowers(userId) {
  return api.get(`/users/${userId}/followers`)
}

/**
 * Quem a pessoa segue (público, mais recente primeiro).
 * @param {number} userId
 */
export function getFollowing(userId) {
  return api.get(`/users/${userId}/following`)
}

/**
 * Feed só com as fotos de quem o usuário logado segue (paginado).
 * @param {number} page
 * @param {number} limit
 */
export function getFollowingPhotos(page = 1, limit = PAGE_SIZE) {
  return api.get('/following-photos', {
    params: { page, limit },
  })
}
