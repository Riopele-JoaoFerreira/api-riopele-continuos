const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

class OPCUA_Running_Minutes extends Model {}

OPCUA_Running_Minutes.init({
  id_seccao: DataTypes.INTEGER,
  id_maquina: DataTypes.INTEGER,
  turno: DataTypes.INTEGER,
  dia: DataTypes.STRING,
  hora: DataTypes.STRING,
  minutos_trabalhados: DataTypes.INTEGER
}, { sequelize, modelName: 'riopele40_minutos_trabalhados', tableName: 'riopele40_minutos_trabalhados' });

module.exports = OPCUA_Running_Minutes; 