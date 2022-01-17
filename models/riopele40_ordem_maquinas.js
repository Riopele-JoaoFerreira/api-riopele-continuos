const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Maquina = require('./riopele40_maquinas')
const OrdemSAP = require('./riopele40_ordens_sap')

class OrdemMaquina extends Model {}

OrdemMaquina.init({
   id_maquina: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_maquinas', 
         key: 'id', 
      }
   },
   ordem: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_ordens_sap', 
         key: 'ordem', 
      }
   },
}, { sequelize, modelName: 'riopele40_ordem_maquinas', tableName: 'riopele40_ordem_maquinas' });

Maquina.hasMany(OrdemMaquina, {foreignKey: 'id_maquina'})
OrdemMaquina.belongsTo(Maquina, {foreignKey: 'id_maquina'})

OrdemSAP.hasMany(OrdemMaquina, {foreignKey: 'ordem'})
OrdemMaquina.belongsTo(OrdemSAP, {foreignKey: 'ordem'})

module.exports = OrdemSAP; 