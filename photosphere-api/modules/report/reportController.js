/**
 * modules/report/reportController.js — Controlador das denúncias (Aula 14).
 */

const reportService = require('./reportService');
const { parseId } = require('../../utils/parseId');

// POST /api/photos/:photoId/report  { reason }
exports.reportPhoto = async (req, res) => {
  const photoId = parseId(req.params.photoId, 'foto');
  const report = await reportService.reportPhoto(req.user.id, photoId, req.body.reason);
  return res.success('Denúncia enviada. Obrigado por ajudar a moderação.', report, 201);
};
