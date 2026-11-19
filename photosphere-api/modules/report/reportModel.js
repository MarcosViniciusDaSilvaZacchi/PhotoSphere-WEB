/**
 * modules/report/reportModel.js — Denúncia de uma foto (Aula 14).
 *
 * Uma linha = "userId denunciou a foto photoId pelo motivo reason".
 *  - reason é um ENUM com os cinco motivos fixos: o banco guarda a CHAVE
 *    ("harassment"), e a tela mostra o RÓTULO ("Assédio ou discurso de ódio");
 *  - índice ÚNICO (user_id, photo_id): uma pessoa denuncia a mesma foto uma vez só
 *    (o banco garante, mesmo com dois cliques simultâneos);
 *  - índice em photo_id: listar/apagar as denúncias de uma foto.
 *
 * Com photoId allowNull: false, o belongsTo gera ON DELETE NO ACTION: o banco
 * RECUSA apagar uma foto que tem denúncias — por isso o deletePhoto apaga as
 * denúncias antes (filhas antes do pai).
 *
 * Aula 15: status (pending/reviewed) e reviewedAt. A tabela já tinha linhas quando
 * a coluna nasceu: o defaultValue 'pending' é o que permite ao sync({ alter: true })
 * acrescentar uma coluna NOT NULL — as denúncias antigas ficam todas "pendentes".
 * O índice em status acelera a lista do painel, que filtra por situação.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { REPORT } = require('../../config/constants');

const Report = sequelize.define(
  'Report',
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
    reason: {
      type: DataTypes.ENUM(...REPORT.REASONS),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(REPORT.STATUS)),
      allowNull: false,
      defaultValue: REPORT.STATUS.PENDING,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'reports',
    indexes: [
      { unique: true, fields: ['user_id', 'photo_id'], name: 'idx_unique_report_user_photo' },
      { fields: ['photo_id'], name: 'idx_reports_photo_id' },
      { fields: ['status'], name: 'idx_reports_status' },
    ],
  }
);

module.exports = Report;
