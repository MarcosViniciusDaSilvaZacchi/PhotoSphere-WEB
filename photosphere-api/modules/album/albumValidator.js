/**
 * modules/album/albumValidator.js — Validação da criação de álbum (Aula 13).
 *
 * - title: .trim() ANTES de .notEmpty() (senão "   " passaria e viraria "");
 * - description: opcional — checkFalsy faz "" e null contarem como "não enviado";
 * - isPublic: opcional, mas, se vier, tem de ser BOOLEANO de verdade (strict):
 *   "sim", "true" (texto) ou 1 são recusados com 400.
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

exports.createAlbumValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('O título do álbum é obrigatório.')
    .isLength({ min: VALIDATION.ALBUM_TITLE_MIN, max: VALIDATION.ALBUM_TITLE_MAX })
    .withMessage(`O título do álbum deve ter entre ${VALIDATION.ALBUM_TITLE_MIN} e ${VALIDATION.ALBUM_TITLE_MAX} caracteres.`),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: VALIDATION.ALBUM_DESCRIPTION_MAX })
    .withMessage(`A descrição não pode exceder ${VALIDATION.ALBUM_DESCRIPTION_MAX} caracteres.`),
  body('isPublic')
    .optional()
    .isBoolean({ strict: true })
    .withMessage('O campo "isPublic" deve ser verdadeiro ou falso.'),
  validate,
];
