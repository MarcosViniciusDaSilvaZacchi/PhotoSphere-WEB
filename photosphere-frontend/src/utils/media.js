/**
 * utils/media.js — Utilitários para tratamento de URLs de mídia (fotos).
 */

const STORAGE_URL = import.meta.env.VITE_API_STORAGE_URL || 'http://localhost:3000/uploads'

/**
 * Retorna a URL pública completa para a foto de perfil.
 * @param {string} filename - Nome do arquivo no servidor
 * @returns {string} URL completa da imagem
 */
export function getProfilePictureUrl(filename) {
  if (!filename) {
    return `${STORAGE_URL}/profiles/default-profile.png`
  }

  // Se já for uma URL completa externa ou blob de preview local
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('blob:')) {
    return filename
  }

  return `${STORAGE_URL}/profiles/${filename}`
}
