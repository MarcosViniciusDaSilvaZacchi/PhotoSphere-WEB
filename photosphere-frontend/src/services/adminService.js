/**
 * services/adminService.js — Painel de administração (Aula 15). Espelho do modules/admin/.
 *
 * Nenhuma chamada é silent: as ações do painel que falham viram o toast do interceptor,
 * e as leituras mostram o erro na própria tela.
 * A revisão usa patch SEM segundo argumento (nunca null — o mesmo problema do logout
 * da Aula 14: null vira o texto "null" no corpo e o express.json recusa com 400).
 */

import api from './api'

export function getAdminDashboard() {
  return api.get('/admin/dashboard')
}

export function getAdminReports(status, page, limit) {
  return api.get('/admin/reports', { params: { status, page, limit } })
}

export function reviewAdminReport(id) {
  return api.patch(`/admin/reports/${id}/review`)
}

export function getAdminUsers(search, page, limit) {
  return api.get('/admin/users', { params: { search: search || undefined, page, limit } })
}

export function setUserBlocked(id, isBlocked) {
  return api.patch(`/admin/users/${id}/block`, { isBlocked })
}

export function getAdminPhotos(search, page, limit) {
  return api.get('/admin/photos', { params: { search: search || undefined, page, limit } })
}

export function deleteAdminPhoto(id) {
  return api.delete(`/admin/photos/${id}`)
}
