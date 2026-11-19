/**
 * services/albumService.js — Álbuns (Aula 13). Espelho do modules/album/ da API.
 *
 * - createAlbum é um formulário (modal): { silent: true } no TERCEIRO argumento
 *   do post (o segundo é o corpo) → o erro aparece dentro do modal, sem toast.
 * - adicionar manda o id da foto no CORPO; remover manda na URL.
 */

import api from './api'

/** Os meus álbuns (mais novo primeiro). */
export function getMyAlbums() {
  return api.get('/my-albums')
}

/** Cria um álbum. @param {{ title: string, description?: string, isPublic?: boolean }} data */
export function createAlbum(data) {
  return api.post('/albums', data, { silent: true })
}

/** Lê um álbum (público, ou privado da própria pessoa). Resposta inclui photos e isOwner. */
export function getAlbum(id) {
  return api.get(`/albums/${id}`)
}

/** Exclui um álbum (as fotos continuam existindo). */
export function deleteAlbum(id) {
  return api.delete(`/albums/${id}`)
}

/** Adiciona uma foto. Resposta: { added, photosCount } — 201 se entrou, 200 se já estava. */
export function addPhotoToAlbum(albumId, photoId) {
  return api.post(`/albums/${albumId}/photos`, { photoId })
}

/** Remove uma foto. Resposta: { removed, photosCount }. */
export function removePhotoFromAlbum(albumId, photoId) {
  return api.delete(`/albums/${albumId}/photos/${photoId}`)
}

/** Os meus álbuns, cada um com hasPhoto (o modal "Salvar" já abre marcado). */
export function getAlbumsStatus(photoId) {
  return api.get(`/photos/${photoId}/albums-status`)
}
