const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Machine = require('./riopele40_maquinas')
const Order = require('./riopele40_ordens_sap')

class Production extends Model {}

Production.init({
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
   num_jogo: DataTypes.INTEGER, 
   quantidade_prevista: DataTypes.FLOAT, 
   quantidade_produzida: DataTypes.FLOAT, 
   data_inicio: DataTypes.DATE,
   data_fim: DataTypes.DATE,
   qtd_ordem_inicio: DataTypes.FLOAT, 
   qtd_ordem_fim: DataTypes.FLOAT,
   fusos: DataTypes.INTEGER, 
   comprimento: DataTypes.INTEGER
}, { sequelize, modelName: 'riopele40_producoes_jogos', tableName: 'riopele40_producoes_jogos' });

Machine.hasMany(Production, {foreignKey: 'cod_sap'})
Production.belongsTo(Machine, {foreignKey: 'cod_sap'})

Order.hasMany(Production, {foreignKey: 'ordem'})
Production.belongsTo(Order, {foreignKey: 'ordem'})

module.exports = Production; 