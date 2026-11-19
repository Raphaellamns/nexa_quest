const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Missao = sequelize.define('Missao', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jornada: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pontos_recompensa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
});

module.exports = Missao;
