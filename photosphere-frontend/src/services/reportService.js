/**
 * services/reportService.js — Denúncias (Aula 14). Espelho do modules/report/.
 *
 * O modal de denúncia é um formulário: { silent: true } no TERCEIRO argumento do
 * post (o segundo é o corpo) → o erro ("Você já denunciou...", Offline) aparece
 * dentro do modal, sem toast.
 */

import api from './api'

/** @param {number} photoId @param {string} reason - uma das chaves de REPORT_REASONS */
export function reportPhoto(photoId, reason) {
  return api.post(`/photos/${photoId}/report`, { reason }, { silent: true })
}
