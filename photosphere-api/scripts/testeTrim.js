/**
 * scripts/testeTrim.js — Teste da correção do trim() (Aula 10).
 *
 * O curl -F apara os espaços sozinho, então ele não consegue provar o bug.
 * Este script envia os campos com os espaços intactos, usando o fetch do Node.
 *
 * Uso (com a API rodando):
 *   node scripts/testeTrim.js <TOKEN_DO_DONO> <ID_DA_FOTO>
 *
 * Esperado depois da correção: as duas respostas com status 400.
 */

const API = process.env.API_URL || 'http://localhost:3000/api';
const [token, photoId] = process.argv.slice(2);

async function main() {
  if (!token || !photoId) {
    console.log('Uso: node scripts/testeTrim.js <TOKEN_DO_DONO> <ID_DA_FOTO>');
    process.exit(1);
  }

  // 1. Título só com espaços na edição da foto (multipart, como o frontend envia)
  const form = new FormData();
  form.append('title', '     ');
  const r1 = await fetch(`${API}/photos/${photoId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  console.log(`PUT /photos/${photoId} com título "     " →`, r1.status, (await r1.json()).message);

  // 2. Nome completo só com espaços no cadastro (JSON)
  const r2 = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `trim${Date.now() % 100000}`,
      email: `trim${Date.now()}@teste.com`,
      password: '123456',
      confirmPassword: '123456',
      fullName: '     ',
    }),
  });
  console.log('POST /register com fullName "     " →', r2.status, (await r2.json()).message);
}

main().catch((err) => {
  console.error('Falha ao executar o teste:', err.message);
  process.exit(1);
});
