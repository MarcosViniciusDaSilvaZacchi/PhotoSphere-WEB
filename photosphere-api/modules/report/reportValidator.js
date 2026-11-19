/**
 * modules/report/reportValidator.js — Primeira defesa do motivo da denúncia (Aula 14).
 * A segunda é o ENUM da coluna reason: mesmo que alguém pule esta validação,
 * o banco recusa um motivo fora da lista ("Data truncated for column 'reason'").
 */

const { body, validationResult } = require('express-validator');
const { REPORT } = require('../../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const error = new Error(errors.array()[0].msg);
  error.status = 400;
  error.errors = errors.array();
  throw error;
};

exports.reportValidator = [
  body('reason').isIn(REPORT.REASONS).withMessage('Escolha um motivo válido para a denúncia.'),
  validate,
];
