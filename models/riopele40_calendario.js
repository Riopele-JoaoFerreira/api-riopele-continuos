const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Machine = require('./riopele40_maquinas')

class Calendar extends Model {}

Calendar.init({
   id_seccao: DataTypes.INTEGER,
   dia: DataTypes.DATEONLY,
   cod_maquina_fabricante: DataTypes.STRING,
   cod_maquina_sap: DataTypes.STRING,
   t1: DataTypes.CHAR,
   t2: DataTypes.CHAR,
   tc: DataTypes.CHAR,
   id_riopele40_maquina: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_maquinas', 
         key: 'id', 
      }
   }
}, { sequelize, modelName: 'riopele40_calendario', tableName: 'riopele40_calendario' });

Machine.hasMany(Calendar, {foreignKey: 'id_riopele40_maquina'})
Calendar.belongsTo(Machine, {foreignKey: 'id_riopele40_maquina'})

module.exports = Calendar; 