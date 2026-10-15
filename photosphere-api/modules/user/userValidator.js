/**
 * modules/user/userValidator.js — Validação declarativa com express-validator.
 */

const { body, validationResult } = require('express-validator');
const { VALIDATION } = require('../../config/constants');

/*
 * Aula 10 — correção do trim(): em todos os campos obrigatórios o .trim() foi
 * movido para o INÍCIO da cadeia. As regras rodam na ordem em que aparecem;
 * com o trim() no fim, "   " passava no notEmpty()/isLength() e só depois
 * virava "" — gravando um nome em branco.
 */

const validate = (req, res, next) => {
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

exports.registerValidator = [
  body('username')
    .trim()
    .isLength({ min: VALIDATION.USERNAME_MIN, max: VALIDATION.USERNAME_MAX })
    .withMessage(`O nome de usuário deve ter entre ${VALIDATION.USERNAME_MIN} e ${VALIDATION.USERNAME_MAX} caracteres.`),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Por favor, insira um e-mail válido.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: VALIDATION.PASSWORD_MIN })
    .withMessage(`A senha deve ter pelo menos ${VALIDATION.PASSWORD_MIN} caracteres.`),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('As senhas não coincidem.');
      }
      return true;
    }),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('O nome completo é obrigatório.'),
  validate,
];

exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('O e-mail ou nome de usuário é obrigatório.')
    .isLength({ min: 2 })
    .withMessage('O e-mail ou nome de usuário deve ter pelo menos 2 caracteres.'),
  body('password')
    .notEmpty()
    .withMessage('A senha é obrigatória.')
    .isLength({ min: VALIDATION.PASSWORD_MIN })
    .withMessage(`A senha deve ter pelo menos ${VALIDATION.PASSWORD_MIN} caracteres.`),
  validate,
];

exports.profileUpdateValidator = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('O nome completo não pode ser vazio.'),
  body('bio')
    .optional()
    .isLength({ max: VALIDATION.BIO_MAX })
    .withMessage(`A biografia deve ter no máximo ${VALIDATION.BIO_MAX} caracteres.`),
  validate,
];


