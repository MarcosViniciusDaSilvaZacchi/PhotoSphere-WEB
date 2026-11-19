/**
 * services/notificationService.js — Notificações (Aula 14). Espelho do modules/notification/.
 */

import api from './api'
import { PAGE_SIZE } from '@/config/constants'

/** Minhas notificações (mais nova primeiro), paginadas. */
export function getNotifications(page = 1, limit = PAGE_SIZE) {
  return api.get('/notifications', { params: { page, limit } })
}

/** Só o número de não lidas — o que o sino pergunta a cada 30 s. */
export function getUnreadCount() {
  return api.get('/notifications/unread-count')
}

/** Marca uma como lida. Resposta: { id, isRead: true, unreadCount }. */
export function markNotificationAsRead(id) {
  return api.patch(`/notifications/${id}/read`)
}
