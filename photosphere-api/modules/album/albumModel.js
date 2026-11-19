/**
 * modules/album/albumModel.js — Álbum: a coleção pessoal de fotos (Aula 13).
 *
 * No PhotoSphere, a "playlist" do roteiro é o ÁLBUM ("organizar álbuns", das regras
 * de negócio). Um usuário tem muitos álbuns; um álbum guarda muitas fotos, e uma foto
 * pode estar em muitos álbuns (de pessoas diferentes) → muitos-para-muitos, pela
 * tabela de junção album_photos (albumPhotoModel.js).
 *
 * isPublic começa FALSE: um álbum novo é privado até a dona decidir publicá-lo.
 * photosCount é um contador GUARDADO, mantido em transação pelo albumService
 * (e pelo deletePhoto, que desconta de cada álbum afetado).
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { VALIDATION } = require('../../config/constants');

const Album = sequelize.define(
  'Album',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(VALIDATION.ALBUM_TITLE_MAX),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(VALIDATION.ALBUM_DESCRIPTION_MAX),
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    photosCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    timestamps: true,
    tableName: 'albums',
    indexes: [{ fields: ['user_id'], name: 'idx_albums_user_id' }],
  }
);

module.exports = Album;
