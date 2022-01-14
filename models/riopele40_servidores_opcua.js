const connection = require('../utilities/connection').connection;
const sequelize = connection; 
const { Model, DataTypes } = require('sequelize');

class Servidor_OPCUA extends Model {}

Servidor_OPCUA.init({
  descricao: DataTypes.STRING,
  protocolo: DataTypes.STRING,
  url: DataTypes.STRING,
  porta: DataTypes.INTEGER,
  repeticoes: DataTypes.INTEGER
}, { sequelize, modelName: 'riopele40_servidores_opcua', tableName: 'riopele40_servidores_opcua' });

module.exports = Servidor_OPCUA; 