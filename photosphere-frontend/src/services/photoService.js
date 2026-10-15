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
 * Obtém o feed de fotos com paginação por page e limit.
 *
 * @param {number} page - Número da página
 * @param {number} limit - Quantidade de itens por página
 * @returns {Promise}
 */
export function getFeed(page = 1, limit = 10) {
  return api.get('/feed', {
    params: { page, limit },
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

/* ─── Aula 09: CRUD do dono ─────────────────────────────────────────────────── */

/**
 * Lista as fotos do usuário logado (mais novas primeiro).
 * @returns {Promise}
 */
export function getMyPhotos() {
  return api.get('/my-photos');
}

/**
 * Busca os dados de uma foto para pré-preencher o formulário de edição.
 * A API responde 403 se a foto não for sua e 404 se não existir.
 * @param {number|string} id
 */
export function getPhotoForEdit(id) {
  return api.get(`/photos/${id}/edit`);
}

/**
 * Atualiza título/descrição e, opcionalmente, a imagem (multipart/form-data).
 * O navegador completa o Content-Type com o boundary correto.
 * @param {number|string} id
 * @param {FormData} formData - title, description e (opcional) image
 */
export function updatePhoto(id, formData) {
  return api.put(`/photos/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Exclui a foto (registro + arquivo em disco).
 * @param {number|string} id
 */
export function deletePhoto(id) {
  return api.delete(`/photos/${id}`);
}
