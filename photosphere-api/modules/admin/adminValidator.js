/**
 * modules/admin/adminValidator.js — Validações do painel (Aula 15).
 *
 * - reportsFilterValidator: ?status= opcional, mas só pending | reviewed | all;
 * - blockUserValidator: isBlocked obrigatório (.exists() + .bail(): sem o campo,
 *   para aqui com a mensagem certa) e BOOLEANO de verdade (strict) — o texto "true"
 *   é recusado.
 */

const { body, query, validationResult } = require('express-validator');
const { ADMIN } = require('../../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const error = new Error(errors.array()[0].msg);
  error.status = 400;
  error.errors = errors.array();
  throw error;
};

exports.reportsFilterValidator = [
  query('status')
    .optional()
    .isIn(ADMIN.REPORT_FILTERS)
    .withMessage('Filtro inválido. Use pending, reviewed ou all.'),
  validate,
];

exports.blockUserValidator = [
  body('isBlocked')
    .exists()
    .withMessage('Informe o campo "isBlocked".')
    .bail()
    .isBoolean({ strict: true })
    .withMessage('O campo "isBlocked" deve ser verdadeiro ou falso.'),
  validate,
];
