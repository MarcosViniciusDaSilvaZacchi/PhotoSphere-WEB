/**
 * modules/comment/commentValidator.js — Validação do comentário (Aula 10).
 *
 * .trim() vem PRIMEIRO: as regras do express-validator rodam na ordem do
 * encadeamento. Com notEmpty() antes do trim(), "     " passaria (não está
 * vazio) e só depois viraria "" — um comentário em branco gravado no banco.
 */

const { body, validationResult } = require('express-validator');
const { VALIDATION } = require('../../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const error = new Error(errors.array()[0].msg);
  error.status = 400;
  error.errors = errors.array();
  throw error;
};

exports.createCommentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('O comentário não pode estar vazio.')
    .isLength({ max: VALIDATION.COMMENT_MAX })
    .withMessage(`O comentário não pode exceder ${VALIDATION.COMMENT_MAX} caracteres.`),
  validate,
];
