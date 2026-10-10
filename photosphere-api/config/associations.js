/**
 * config/associations.js — Centralização de Associações do Sequelize.
 *
 * Centralizar as associações (hasMany, belongsTo, etc.) em um único arquivo
 * evita problemas de dependência circular (circular reference) entre os modelos,
 * garantindo que todos os Models estejam definidos e registrados antes de
 * estabelecer os relacionamentos e chaves estrangeiras.
 */

const User = require('../modules/user/userModel');
const Photo = require('../modules/photo/photoModel');

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

module.exports = {
  User,
  Photo,
};
