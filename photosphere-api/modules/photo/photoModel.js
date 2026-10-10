/**
 * modules/photo/photoModel.js — Modelo da Entidade Principal (Photo) no MySQL via Sequelize.
 *
 * Pertence ao Grupo B (um único arquivo de mídia direta).
 * Cada foto possui um autor (userId) e alimenta a coluna de contagem 'photosCount' do usuário.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Photo = sequelize.define(
  'Photo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: 'photos',
    indexes: [
      { fields: ['user_id'], name: 'idx_photos_user_id' },
      { fields: ['created_at'], name: 'idx_photos_created_at' },
    ],
  }
);

module.exports = Photo;
