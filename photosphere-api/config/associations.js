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
 *
 * Aula 11: Follow liga User a User. Como as duas chaves apontam para a mesma
 * tabela, cada associação precisa de um APELIDO (as) — sem ele, o Sequelize não
 * saberia se um include de User significa "quem segue" ou "quem é seguido".
 *
 * Aula 13: Album e a junção AlbumPhoto (muitos-para-muitos entre álbum e foto).
 *
 * Aula 14: Notification (apelidos Recipient/Actor) e Report (apelido Reporter).
 */

const User = require('../modules/user/userModel');
const Photo = require('../modules/photo/photoModel');
const Like = require('../modules/like/likeModel');
const Comment = require('../modules/comment/commentModel');
const Follow = require('../modules/follow/followModel');
const Album = require('../modules/album/albumModel');
const AlbumPhoto = require('../modules/album/albumPhotoModel');
const Notification = require('../modules/notification/notificationModel');
const Report = require('../modules/report/reportModel');

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

// ─── Seguir (Aula 11) ─────────────────────────────────────────────────────────
// Lendo em voz alta: "a linha de Follow pertence ao Follower (quem segue)
// pela coluna followerId, e ao Following (quem é seguido) pela coluna followingId".
Follow.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'Following', foreignKey: 'followingId' });

// ─── Álbuns: muitos-para-muitos Album ⇄ Photo pela junção AlbumPhoto (Aula 13) ──
// onDelete: 'CASCADE' nos hasMany gera ON DELETE CASCADE nas chaves de album_photos.
// O CASCADE apaga as LINHAS da junção, mas não desconta o photosCount dos álbuns —
// por isso o deletePhoto faz esse desconto no código, na mesma transação.
User.hasMany(Album, { foreignKey: 'userId', as: 'albums', onDelete: 'CASCADE' });
Album.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Album.hasMany(AlbumPhoto, { foreignKey: 'albumId', as: 'entries', onDelete: 'CASCADE' });
AlbumPhoto.belongsTo(Album, { foreignKey: 'albumId', as: 'album' });

Photo.hasMany(AlbumPhoto, { foreignKey: 'photoId', as: 'albumEntries', onDelete: 'CASCADE' });
AlbumPhoto.belongsTo(Photo, { foreignKey: 'photoId', as: 'photo' });

// ─── Notificações e denúncias (Aula 14) ──────────────────────────────────────
// SÓ o sentido belongsTo: é ele que cria as chaves estrangeiras, e o ON DELETE
// sai do allowNull de cada coluna — photoId opcional em notifications → SET NULL;
// photoId obrigatório em reports (e userId/actorId) → NO ACTION (o banco recusa).
Notification.belongsTo(User, { foreignKey: 'userId', as: 'Recipient' });
Notification.belongsTo(User, { foreignKey: 'actorId', as: 'Actor' });
Notification.belongsTo(Photo, { foreignKey: 'photoId', as: 'photo' });

Report.belongsTo(User, { foreignKey: 'userId', as: 'Reporter' });
Report.belongsTo(Photo, { foreignKey: 'photoId', as: 'photo' });

module.exports = {
  User,
  Photo,
  Like,
  Comment,
  Follow,
  Album,
  AlbumPhoto,
  Notification,
  Report,
};
