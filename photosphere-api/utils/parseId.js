/**
 * utils/parseId.js — Converte um id vindo da requisição em inteiro positivo (Aula 13).
 *
 * Tudo o que vem da URL (req.params) ou do corpo como texto é STRING: "5", "abc", "2.5".
 * A conversão acontece NA BORDA (controller), e o service só recebe números.
 * Sem ela, "5" === 5 dá false (a regra "não pode seguir a si mesmo" falhava) e um
 * id "abc" virava 404 em vez de 400 (misturando "malformado" com "não existe").
 *
 * Nasceu no followController (parseUserId, Aula 11) e virou utilitário no terceiro
 * uso — agora todo id de req.params e do corpo passa por aqui.
 *
 * @param {unknown} rawValue - valor bruto (req.params.id, req.body.photoId...)
 * @param {string} label - nome no singular para a mensagem ("usuário", "foto", "álbum")
 * @returns {number}
 */

const { httpError } = require('./httpError');

function parseId(rawValue, label) {
  const id = Number(rawValue);
  // typeof evita que [] ou true virem 0/1 e passem; Number('') é 0 e cai no id < 1
  if ((typeof rawValue !== 'string' && typeof rawValue !== 'number') || !Number.isInteger(id) || id < 1) {
    throw httpError(`Identificador de ${label} inválido.`, 400);
  }
  return id;
}

module.exports = { parseId };
