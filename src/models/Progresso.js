const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Missao = require('./Missao');

const Progresso = sequelize.define('Progresso', {
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  indexes: [{ name: 'uq_progresso_usuario_missao', unique: true, fields: ['usuario_id', 'missao_id'] }],
});

const vinculoUsuario = { foreignKey: { name: 'usuario_id', allowNull: false }, onDelete: 'CASCADE' };
Usuario.hasMany(Progresso, vinculoUsuario);
Progresso.belongsTo(Usuario, vinculoUsuario);

const vinculoMissao = { foreignKey: 'missao_id', onDelete: 'SET NULL' };
Missao.hasMany(Progresso, vinculoMissao);
Progresso.belongsTo(Missao, vinculoMissao);

module.exports = Progresso;
