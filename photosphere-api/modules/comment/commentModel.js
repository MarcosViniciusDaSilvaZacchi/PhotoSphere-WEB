/**
 * modules/comment/commentModel.js — Comentário em uma foto (Aula 10).
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { VALIDATION } = require('../../config/constants');

const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.STRING(VALIDATION.COMMENT_MAX),
      allowNull: false,
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
    tableName: 'comments',
    indexes: [{ fields: ['photo_id', 'created_at'], name: 'idx_comments_photo_created' }],
  }
);

module.exports = Comment;
