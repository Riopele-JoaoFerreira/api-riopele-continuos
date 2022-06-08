const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

class OPCUA_Server extends Model {}

OPCUA_Server.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  descricao: DataTypes.STRING,
  protocolo: DataTypes.STRING,
  url: DataTypes.STRING,
  porta: DataTypes.INTEGER,
  repeticoes: DataTypes.INTEGER
}, { sequelize, modelName: 'riopele40_servidores_opcua', tableName: 'riopele40_servidores_opcua' });

module.exports = OPCUA_Server; 