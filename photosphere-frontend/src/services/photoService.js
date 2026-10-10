/**
 * services/photoService.js — Camada de serviços da Entidade Principal (Photo).
 *
 * Responsável pela comunicação com a API para listagem e upload de fotos,
 * repassando o callback onUploadProgress para monitoramento em tempo real da transmissão.
 */

import api from './api';

/**
 * Realiza o upload de uma nova foto enviando multipart/form-data.
 *
 * @param {FormData} formData - Contém title, description e image
 * @param {Function} onUploadProgress - Callback disparado pelo Axios com o progresso do upload
 * @returns {Promise} Resposta da API
 */
export function uploadPhoto(formData, onUploadProgress) {
  return api.post('/photos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
}

/**
 * Obtém as fotos mais recentes da plataforma.
 *
 * @param {number} limit - Quantidade máxima de fotos a retornar
 * @returns {Promise}
 */
export function getRecentPhotos(limit = 20) {
  return api.get('/photos', {
    params: { limit },
  });
}

/**
 * Obtém os detalhes de uma foto por ID.
 *
 * @param {number|string} id - ID da foto
 * @returns {Promise}
 */
export function getPhotoById(id) {
  return api.get(`/photos/${id}`);
}
