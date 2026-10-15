/**
 * modules/like/likeModel.js — Curtida de uma foto (Aula 10).
 *
 * Uma linha = "o usuário X curtiu a foto Y".
 *
 * O índice ÚNICO COMPOSTO (user_id, photo_id) é a garantia definitiva de que
 * uma pessoa só curte uma vez. A checagem no código (findOne antes do create)
 * não basta: dois cliques quase simultâneos podem passar os dois pelo findOne
 * antes de qualquer um gravar. O banco, com o índice, recusa a segunda linha.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Like = sequelize.define(
  'Like',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    photoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'photos', key: 'id' },
    },
  },
  {
    timestamps: true,
    tableName: 'likes',
    indexes: [
      { unique: true, fields: ['user_id', 'photo_id'], name: 'idx_unique_like_user_photo' },
      { fields: ['photo_id'], name: 'idx_likes_photo_id' },
    ],
  }
);

module.exports = Like;
