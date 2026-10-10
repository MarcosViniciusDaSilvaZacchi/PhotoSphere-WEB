/**
 * modules/photo/photoValidator.js — Validações da Entidade Principal com express-validator.
 */

const { body, validationResult } = require('express-validator');
const { VALIDATION } = require('../../config/constants');

const validate = (req, res, next) => {
  // 1. Validação de presença do arquivo (enviado via Multer como single('image'))
  if (!req.file) {
    const error = new Error('Nenhum arquivo de foto foi enviado. O campo "image" é obrigatório.');
    error.status = 400;
    throw error;
  }

  // 2. Validação dos campos de texto via express-validator
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const firstError = errors.array()[0].msg;
  const error = new Error(firstError);
  error.status = 400;
  error.errors = errors.array();
  throw error;
};

exports.createPhotoValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('O título da foto é obrigatório.')
    .isLength({ max: VALIDATION.TITLE_MAX })
    .withMessage(`O título não pode exceder ${VALIDATION.TITLE_MAX} caracteres.`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.DESCRIPTION_MAX })
    .withMessage(`A descrição não pode exceder ${VALIDATION.DESCRIPTION_MAX} caracteres.`),
  validate,
];
