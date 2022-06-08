const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Order = require('./riopele40_ordens_sap')

class Order_Components extends Model {}

Order_Components.init({
   ordem: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_ordens_sap', 
         key: 'ordem', 
      }
   },
   operacao: DataTypes.STRING, 
   material: DataTypes.STRING, 
   descricao: DataTypes.STRING, 
   lote: DataTypes.STRING, 
   quantidade: DataTypes.FLOAT, 
   unidade: DataTypes.STRING, 
   ne: DataTypes.FLOAT, 
   torcao: DataTypes.FLOAT, 
   sentido_torcao: DataTypes.CHAR, 
   numero_cabos: DataTypes.INTEGER, 
   tonalidade: DataTypes.STRING
}, { sequelize, modelName: 'riopele40_ordens_componentes', tableName: 'riopele40_ordens_componentes' });

Order.hasMany(Order_Components, {foreignKey: 'cod_sap'})
Order_Components.belongsTo(Order, {foreignKey: 'cod_sap'})

module.exports = Order_Components; 