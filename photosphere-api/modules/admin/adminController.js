/**
 * modules/admin/adminController.js — Controlador do painel (Aula 15).
 */

const adminService = require('./adminService');
const photoService = require('../photo/photoService');
const { parsePagination } = require('../../utils/pagination');
const { parseId } = require('../../utils/parseId');
const { SEARCH } = require('../../config/constants');

/** ?search= só texto, sem espaços nas pontas, cortado no tamanho máximo. */
function readSearch(req) {
  const raw = typeof req.query.search === 'string' ? req.query.search : '';
  return raw.trim().slice(0, SEARCH.MAX_LENGTH);
}

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return res.success('Estatísticas obtidas com sucesso', stats);
};

// GET /api/admin/reports?status=&page=&limit=
exports.getReports = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const status = req.query.status || 'pending';
  const reports = await adminService.getReports(status, page, limit);
  return res.success('Denúncias obtidas com sucesso', reports);
};

// PATCH /api/admin/reports/:id/review
exports.reviewReport = async (req, res) => {
  const id = parseId(req.params.id, 'denúncia');
  const result = await adminService.reviewReport(id);
  return res.success('Denúncia marcada como revisada.', result);
};

// GET /api/admin/users?search=&page=&limit=
exports.getUsers = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const users = await adminService.getUsers(readSearch(req), page, limit);
  return res.success('Usuários obtidos com sucesso', users);
};

// PATCH /api/admin/users/:id/block  { isBlocked }
exports.setUserBlocked = async (req, res) => {
  const id = parseId(req.params.id, 'usuário');
  const result = await adminService.setUserBlocked(id, req.body.isBlocked, req.user.id);
  return res.success(result.isBlocked ? 'Usuário bloqueado.' : 'Usuário desbloqueado.', result);
};

// GET /api/admin/photos?search=&page=&limit=
exports.getPhotos = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const photos = await adminService.getPhotos(readSearch(req), page, limit);
  return res.success('Fotos obtidas com sucesso', photos);
};

// DELETE /api/admin/photos/:id — reaproveita o deletePhoto (nenhum destroy novo aqui)
exports.deletePhoto = async (req, res) => {
  const id = parseId(req.params.id, 'foto');
  const result = await photoService.deletePhoto(id, req.user.id, true);
  return res.success('Foto excluída pela administração.', result);
};
