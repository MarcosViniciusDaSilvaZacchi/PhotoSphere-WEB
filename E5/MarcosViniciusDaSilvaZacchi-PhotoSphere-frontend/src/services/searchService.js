/**
 * searchService.js — Serviço de busca do PhotoSphere.
 *
 * Espelho do modules/search/ da API.
 * A partir de hoje, nenhum componente Vue chama api diretamente para busca —
 * tudo passa por aqui.
 */

import api from './api'

/**
 * Busca global por fotos e usuários.
 * @param {string} query - termo de busca
 * @returns {Promise} - { query, fotos: [], users: [] }
 */
export function search(query) {
  return api.get('/search', { params: { q: query } })
}
