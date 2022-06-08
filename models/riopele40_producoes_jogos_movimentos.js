const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Machine = require('./riopele40_maquinas')
const Order = require('./riopele40_ordens_sap')

class Movements extends Model {}

Movements.init({
   id_seccao: DataTypes.INTEGER, 
   cod_maquina_fabricante: DataTypes.INTEGER,
   cod_sap: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_ordem_maquinas', 
         key: 'cod_sap', 
      }
   },
   ordem: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_ordens_sap', 
         key: 'ordem', 
      }
   },
   quantidade_produzida: DataTypes.FLOAT,
   data_inicio: DataTypes.DATE,
   data_fim: DataTypes.DATE,
   estado_sap: DataTypes.CHAR, 
   num_jogo: DataTypes.INTEGER
}, { sequelize, modelName: 'riopele40_producoes_jogos_movimentos', tableName: 'riopele40_producoes_jogos_movimentos' });

Machine.hasMany(Movements, {foreignKey: 'cod_sap'})
Movements.belongsTo(Machine, {foreignKey: 'cod_sap'})

Order.hasMany(Movements, {foreignKey: 'ordem'})
Movements.belongsTo(Order, {foreignKey: 'ordem'})

module.exports = Movements; 