/**
 * modules/album/albumPhotoModel.js — Tabela de junção álbum ↔ foto (Aula 13).
 *
 * Uma linha = "a foto Y está no álbum X".
 *
 * Dois índices, cada um para uma pergunta:
 *  1. ÚNICO COMPOSTO (album_id, photo_id): a mesma foto não entra duas vezes no
 *     mesmo álbum (o banco recusa, mesmo com dois cliques simultâneos). Como
 *     album_id vem primeiro, ele também acelera "quais fotos estão no álbum X".
 *  2. SIMPLES (photo_id): o composto não serve para buscar só pela segunda coluna,
 *     e "em quais álbuns está a foto Y" é a pergunta do modal "Salvar" e da exclusão
 *     da foto (que precisa descontar o contador de cada álbum).
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AlbumPhoto = sequelize.define(
  'AlbumPhoto',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    albumId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'albums', key: 'id' },
    },
    photoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'photos', key: 'id' },
    },
  },
  {
    timestamps: true,
    tableName: 'album_photos',
    indexes: [
      { unique: true, fields: ['album_id', 'photo_id'], name: 'idx_unique_album_photo' },
      { fields: ['photo_id'], name: 'idx_album_photos_photo_id' },
    ],
  }
);

module.exports = AlbumPhoto;
