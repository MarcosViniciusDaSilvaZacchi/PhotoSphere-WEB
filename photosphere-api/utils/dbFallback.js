/**
 * utils/dbFallback.js — Detecção de banco de dados fora do ar.
 *
 * Os services da Aula 07/08 possuem um "modo demonstração" que devolve dados
 * de exemplo quando o MySQL não está acessível. Na Aula 09 a condição foi
 * restringida: antes, QUALQUER erro do Sequelize (validação, chave única,
 * chave estrangeira...) caía no modo demonstração e mascarava bugs reais.
 * Agora só erros de CONEXÃO ativam o fallback.
 */

const CONNECTION_ERRORS = [
  'SequelizeConnectionError',
  'SequelizeConnectionRefusedError',
  'SequelizeHostNotFoundError',
  'SequelizeHostNotReachableError',
  'SequelizeAccessDeniedError',
  'SequelizeConnectionTimedOutError',
];

function isDatabaseOffline(err) {
  if (!err) return false;
  return (
    CONNECTION_ERRORS.includes(err.name) ||
    err.code === 'ECONNREFUSED' ||
    err.parent?.code === 'ECONNREFUSED'
  );
}

module.exports = { isDatabaseOffline };
