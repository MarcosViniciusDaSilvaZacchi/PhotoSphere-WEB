/**
 * modules/follow/followModel.js — Relação "quem segue quem" (Aula 11).
 *
 * Uma linha = "o usuário followerId segue o usuário followingId".
 * As DUAS colunas apontam para a MESMA tabela (users) — por isso as
 * associações em config/associations.js precisam de apelidos (Follower / Following).
 *
 * Dois índices:
 *  1. ÚNICO COMPOSTO (follower_id, following_id): uma pessoa só segue outra uma vez.
 *     Como follower_id vem PRIMEIRO, ele também acelera "quem EU sigo"
 *     (WHERE follower_id = ?) — usado no feed filtrado e na lista "Seguindo".
 *  2. SIMPLES (following_id): o composto não serve para buscar só pela segunda
 *     coluna, e "quem segue FULANO" (WHERE following_id = ?) é a lista de Seguidores.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Follow = sequelize.define(
  'Follow',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Quem segue
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    // Quem é seguido
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    timestamps: true,
    tableName: 'follows',
    indexes: [
      { unique: true, fields: ['follower_id', 'following_id'], name: 'idx_unique_follow_follower_following' },
      { fields: ['following_id'], name: 'idx_follows_following_id' },
    ],
  }
);

module.exports = Follow;
