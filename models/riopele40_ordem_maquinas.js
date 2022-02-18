const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Maquina = require('./riopele40_maquinas')
const OrdemSAP = require('./riopele40_ordens_sap')

class OrdemMaquina extends Model {}

OrdemMaquina.init({
   id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
   },
   id_maquina: {
      type: DataTypes.INTEGER,
      references: {
         model: Maquina, 
         key: 'id', 
      }
   },
   ordem: {
      type: DataTypes.STRING,
      references: {
         model: OrdemSAP, 
         key: 'ordem', 
      }
   },
}, { sequelize, modelName: 'riopele40_ordem_maquinas', tableName: 'riopele40_ordem_maquinas' });

OrdemMaquina.belongsTo(Maquina, {foreignKey: 'id_maquina'})

module.exports = OrdemMaquina; 