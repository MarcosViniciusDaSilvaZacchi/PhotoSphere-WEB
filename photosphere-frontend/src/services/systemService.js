/**
 * systemService.js — Serviço de sistema do PhotoSphere.
 * Responsável por verificar o status e saúde da API.
 */

import api from './api'

/**
 * Verifica se a API está online.
 * Consome GET /api e retorna { status: 'online', version: '1.0.0' }
 */
export function getApiStatus() {
  return api.get('/')
}
