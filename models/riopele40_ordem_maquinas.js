const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Machine = require('./riopele40_maquinas')
const Order = require('./riopele40_ordens_sap')

class Order_Machine extends Model {}

Order_Machine.init({
   id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
   },
   id_maquina: {
      type: DataTypes.INTEGER,
      references: {
         model: Machine, 
         key: 'id', 
      }
   },
   ordem: {
      type: DataTypes.STRING,
      references: {
         model: Order, 
         key: 'ordem', 
      }
   },
}, { sequelize, modelName: 'riopele40_ordem_maquinas', tableName: 'riopele40_ordem_maquinas' });

Order_Machine.belongsTo(Machine, {foreignKey: 'id_maquina'})

module.exports = Order_Machine; 