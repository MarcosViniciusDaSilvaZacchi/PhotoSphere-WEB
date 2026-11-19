/**
 * utils/escapeLike.js — Escapa os curingas do LIKE (Aula 15; nasceu no searchService na Aula 13).
 *
 * No LIKE, % (qualquer sequência) e _ (qualquer caractere) são curingas. Sem o escape,
 * buscar "%%" virava LIKE '%%%%' e casava com tudo. O \ antes de cada curinga (e do
 * próprio \) faz o MySQL tratá-los como texto comum.
 *
 * Extraído já na Aula 15 (e não deixado para a 18) porque ganhou o SEGUNDO uso, as
 * buscas do painel de administração (usuários e fotos). Duas cópias de uma regra de
 * segurança seriam duas chances de uma ficar para trás.
 */

function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&');
}

module.exports = { escapeLike };
