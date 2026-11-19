/**
 * modules/notification/notificationModel.js — Aviso para o dono de algo (Aula 14).
 *
 * Uma linha = "actorId fez <type> e userId precisa saber".
 *  - userId  → quem RECEBE o aviso (dono da foto / quem foi seguido);
 *  - actorId → quem AGIU (curtiu, comentou, seguiu);
 *  - photoId → a foto envolvida (NULL no "follow", que não tem foto).
 *
 * Índices:
 *  - (user_id, is_read): a pergunta mais frequente do sistema é "quantas NÃO LIDAS
 *    o usuário X tem?" (o sino pergunta a cada 30 s) — os dois filtros no mesmo índice;
 *  - (photo_id): achar os avisos de uma foto quando ela é excluída.
 *
 * Com photoId allowNull: true, o belongsTo gera ON DELETE SET NULL na chave da foto.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { NOTIFICATION } = require('../../config/constants');

const Notification = sequelize.define(
  'Notification',
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
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NOTIFICATION.TYPES)),
      allowNull: false,
    },
    photoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'photos', key: 'id' },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: 'notifications',
    indexes: [
      { fields: ['user_id', 'is_read'], name: 'idx_notifications_user_read' },
      { fields: ['photo_id'], name: 'idx_notifications_photo_id' },
    ],
  }
);

module.exports = Notification;
