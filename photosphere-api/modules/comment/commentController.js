/**
 * modules/comment/commentController.js — Controlador dos comentários (Aula 10).
 *
 * Ordem dos parâmetros do service: (userId, photoId, content).
 */

const commentService = require('./commentService');
const { parseId } = require('../../utils/parseId'); // Aula 13

// POST /api/photos/:photoId/comments
exports.createComment = async (req, res) => {
  const comment = await commentService.createComment(
    req.user.id,
    parseId(req.params.photoId, 'foto'),
    req.body.content
  );
  return res.success('Comentário publicado!', comment, 201);
};

// GET /api/photos/:photoId/comments
exports.listComments = async (req, res) => {
  const comments = await commentService.listComments(parseId(req.params.photoId, 'foto'));
  return res.success('Comentários obtidos com sucesso', comments);
};
