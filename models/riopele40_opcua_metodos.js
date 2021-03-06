const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

class Metodo_OPCUA extends Model {}

Metodo_OPCUA.init({
  grupo: DataTypes.STRING,
  identificador: DataTypes.STRING,
  prefixo: DataTypes.STRING,
  chave: DataTypes.STRING,
  descricao: DataTypes.STRING,
  repeticoes: DataTypes.INTEGER, 
  tipo: DataTypes.STRING,
  map: DataTypes.STRING, 
  default: DataTypes.INTEGER
}, { sequelize, modelName: 'riopele40_opcua_metodos', tableName: 'riopele40_opcua_metodos' });

module.exports = Metodo_OPCUA; 