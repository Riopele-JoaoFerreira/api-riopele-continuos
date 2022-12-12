const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

class Parametro extends Model {}

Parametro.init({
   parametro: {
      type: DataTypes.STRING,
      primaryKey: true 
   },
   valor: DataTypes.STRING,
   info: DataTypes.STRING,
}, { sequelize, modelName: 'parametros', tableName: 'parametros' });

module.exports = Parametro; 