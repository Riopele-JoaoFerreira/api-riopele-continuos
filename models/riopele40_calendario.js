const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Maquina = require('./riopele40_maquinas')

class Calendario extends Model {}

Calendario.init({
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

Maquina.hasMany(Calendario, {foreignKey: 'id_riopele40_maquina'})
Calendario.belongsTo(Maquina, {foreignKey: 'id_riopele40_maquina'})

module.exports = Calendario; 