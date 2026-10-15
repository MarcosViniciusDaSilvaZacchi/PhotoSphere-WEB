/**
 * utils/fileStorage.js — Utilitários de arquivos em disco (Aula 09).
 *
 * Centraliza a remoção segura de arquivos enviados pelo Multer, usada em três lugares:
 *  1. photoService.updatePhoto  → apaga a imagem ANTIGA depois que o banco já aponta para a nova;
 *  2. photoService.deletePhoto  → apaga a imagem depois que o registro saiu do banco;
 *  3. middlewares/errorHandler  → apaga arquivos ÓRFÃOS de requisições que falharam.
 *
 * Regra de ouro: o banco é atualizado ANTES do disco. Se o disco falhar depois,
 * sobra no máximo um arquivo sem dono (lixo inofensivo), nunca um registro apontando
 * para um arquivo que não existe mais (imagem quebrada para o usuário).
 */

const fs = require('fs');
const path = require('path');

const UPLOADS_ROOT = path.join(__dirname, '../public/uploads');

// Arquivos de exemplo/padrão que nunca podem ser apagados
const PROTECTED_FILES = ['default-profile.png', 'sample-photo.jpg'];

/**
 * Remove um arquivo pelo caminho absoluto. Nunca lança erro:
 * se o arquivo já não existe (ENOENT), apenas segue em frente.
 */
async function removeFile(absolutePath) {
  if (!absolutePath) return;
  try {
    await fs.promises.unlink(absolutePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`⚠️  Não foi possível remover ${absolutePath}:`, err.message);
    }
  }
}

/**
 * Remove um arquivo de uma subpasta de public/uploads (ex.: 'photos', 'profiles').
 * path.basename impede que um nome malicioso ("../../server.js") saia da pasta.
 */
async function removeUpload(folder, filename) {
  if (!filename || PROTECTED_FILES.includes(filename)) return;
  await removeFile(path.join(UPLOADS_ROOT, folder, path.basename(filename)));
}

module.exports = {
  UPLOADS_ROOT,
  removeFile,
  removeUpload,
};
