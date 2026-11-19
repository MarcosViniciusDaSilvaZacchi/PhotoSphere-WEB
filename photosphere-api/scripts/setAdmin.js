/**
 * scripts/setAdmin.js — Promove (ou rebaixa) um administrador (Aula 15).
 *
 * Não existe rota para "virar admin" de propósito: se existisse, qualquer pessoa
 * com uma conta poderia tentar chamá-la. Quem promove é quem tem acesso ao
 * SERVIDOR (e ao .env com a senha do banco) — este script roda na máquina da API.
 *
 * Uso (na pasta photosphere-api, com o MySQL ligado):
 *   node scripts/setAdmin.js <username>        → promove
 *   node scripts/setAdmin.js <username> off    → rebaixa
 *
 * Como o isAuthenticated lê o isAdmin do BANCO a cada requisição, a mudança vale
 * na hora, até para quem já está logado com um token antigo.
 */

require('dotenv').config();
const sequelize = require('../config/database');
const User = require('../modules/user/userModel');

async function main() {
  const username = process.argv[2];
  const makeAdmin = process.argv[3] !== 'off';

  if (!username) {
    console.log('Uso: node scripts/setAdmin.js <username> [off]');
    process.exitCode = 1;
    return;
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    console.log(`❌ Usuário "${username}" não encontrado.`);
    process.exitCode = 1;
    return;
  }

  await user.update({ isAdmin: makeAdmin });
  console.log(makeAdmin ? `✅ ${username} agora é administrador.` : `✅ ${username} deixou de ser administrador.`);
}

main()
  .catch((err) => {
    console.error('Falha:', err.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
