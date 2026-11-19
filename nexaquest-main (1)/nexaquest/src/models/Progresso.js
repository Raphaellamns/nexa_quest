const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Missao = require('./Missao');

const Progresso = sequelize.define('Progresso', {
  data: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Usuario.hasMany(Progresso, { foreignKey: 'usuario_id' });
Progresso.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Missao.hasMany(Progresso, { foreignKey: 'missao_id' });
Progresso.belongsTo(Missao, { foreignKey: 'missao_id' });

module.exports = Progresso;