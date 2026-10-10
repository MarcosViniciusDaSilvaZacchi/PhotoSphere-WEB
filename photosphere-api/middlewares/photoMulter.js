/**
 * middlewares/photoMulter.js — Configuração de Upload da Entidade Principal (Photo).
 *
 * Utiliza multer.diskStorage para salvar arquivos diretamente no disco em public/uploads/photos/.
 * Pertence ao Grupo B (um único arquivo por publicação), utilizando uploadPhoto.single('image').
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads/photos');

// Garante que o diretório de destino exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error('Formato de arquivo inválido. Apenas imagens JPG, PNG ou WEBP são permitidas.');
    error.status = 400;
    cb(error, false);
  }
};

const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
});

module.exports = uploadPhoto;
