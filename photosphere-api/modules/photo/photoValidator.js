/**
 * modules/photo/photoValidator.js — Validações da Entidade Principal com express-validator.
 *
 * Atenção à ordem: .trim() SEMPRE antes de .notEmpty(). As regras rodam na
 * ordem em que são encadeadas — se notEmpty() viesse primeiro, "   " (só espaços)
 * passaria na checagem e só depois seria aparado para "", gravando um título vazio.
 */

const { body, validationResult } = require('express-validator');
const { VALIDATION } = require('../../config/constants');

/**
 * Executa o resultado do express-validator e, se houver erro, lança um 400.
 * Se a requisição trouxe arquivo, o errorHandler apaga o órfão.
 */
const throwIfInvalid = (req) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return;

  const error = new Error(errors.array()[0].msg);
  error.status = 400;
  error.errors = errors.array();
  throw error;
};

// Criação: o arquivo é obrigatório
const validateCreate = (req, res, next) => {
  // 1. Validação de presença do arquivo (enviado via Multer como single('image'))
  if (!req.file) {
    const error = new Error('Nenhum arquivo de foto foi enviado. O campo "image" é obrigatório.');
    error.status = 400;
    throw error;
  }

  // 2. Validação dos campos de texto via express-validator
  throwIfInvalid(req);
  next();
};

// Edição: o arquivo é opcional (só troca a imagem se vier um novo)
const validateUpdate = (req, res, next) => {
  throwIfInvalid(req);
  next();
};

const titleRule = () =>
  body('title')
    .trim()
    .notEmpty()
    .withMessage('O título da foto é obrigatório.')
    .isLength({ max: VALIDATION.TITLE_MAX })
    .withMessage(`O título não pode exceder ${VALIDATION.TITLE_MAX} caracteres.`);

const descriptionRule = () =>
  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.DESCRIPTION_MAX })
    .withMessage(`A descrição não pode exceder ${VALIDATION.DESCRIPTION_MAX} caracteres.`);

exports.createPhotoValidator = [titleRule(), descriptionRule(), validateCreate];

exports.updatePhotoValidator = [titleRule(), descriptionRule(), validateUpdate];
