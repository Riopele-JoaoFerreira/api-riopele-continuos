const connection = require('../utilities/connection').connection;
const sequelize = connection; 
const { Model, DataTypes } = require('sequelize');

class Metodo_OPCUA extends Model {}

Metodo_OPCUA.init({
  grupo: DataTypes.STRING,
  identificador: DataTypes.STRING,
  prefixo: DataTypes.STRING,
  chave: DataTypes.STRING,
  descicao: DataTypes.STRING,
  repeticoes: DataTypes.INTEGER, 
  tipo: DataTypes.STRING,
}, { sequelize, modelName: 'riopele40_opcua_metodos', tableName: 'riopele40_opcua_metodos' });

module.exports = Metodo_OPCUA; 