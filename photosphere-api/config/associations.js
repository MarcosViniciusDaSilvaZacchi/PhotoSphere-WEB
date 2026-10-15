/**
 * config/associations.js — Centralização de Associações do Sequelize.
 *
 * Centralizar as associações (hasMany, belongsTo, etc.) em um único arquivo
 * evita problemas de dependência circular (circular reference) entre os modelos,
 * garantindo que todos os Models estejam definidos e registrados antes de
 * estabelecer os relacionamentos e chaves estrangeiras.
 *
 * Aula 10: Like e Comment, com associações NOS DOIS SENTIDOS
 * (hasMany a partir de User/Photo e belongsTo a partir de Like/Comment),
 * para poder fazer include partindo de qualquer um dos lados.
 */

const User = require('../modules/user/userModel');
const Photo = require('../modules/photo/photoModel');
const Like = require('../modules/like/likeModel');
const Comment = require('../modules/comment/commentModel');

// ─── User ⇄ Photo (Aula 07) ───────────────────────────────────────────────────
// Um Usuário tem muitas Fotos (1:N)
User.hasMany(Photo, {
  foreignKey: 'userId',
  as: 'photos',
  onDelete: 'CASCADE',
});

// Cada Foto pertence a um único Usuário (N:1)
Photo.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

// ─── Curtidas (Aula 10) ───────────────────────────────────────────────────────
User.hasMany(Like, { foreignKey: 'userId', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Photo.hasMany(Like, { foreignKey: 'photoId', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Photo, { foreignKey: 'photoId', as: 'photo' });

// ─── Comentários (Aula 10) ────────────────────────────────────────────────────
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Photo.hasMany(Comment, { foreignKey: 'photoId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Photo, { foreignKey: 'photoId', as: 'photo' });

module.exports = {
  User,
  Photo,
  Like,
  Comment,
};
