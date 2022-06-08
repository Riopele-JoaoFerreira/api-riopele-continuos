const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Machine = require('./riopele40_maquinas')
const Order = require('./riopele40_ordens_sap')

class Variables  extends Model {}

Variables.init({
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
   velocidade: DataTypes.INTEGER,
   torcao: DataTypes.FLOAT, 
   data: DataTypes.DATE
}, { sequelize, modelName: 'riopele40_producoes_jogos_variaveis', tableName: 'riopele40_producoes_jogos_variaveis' });

Machine.hasMany(Variables, {foreignKey: 'cod_sap'})
Variables.belongsTo(Machine, {foreignKey: 'cod_sap'})

Order.hasMany(Variables, {foreignKey: 'ordem'})
Variables.belongsTo(Order, {foreignKey: 'ordem'})

module.exports = Variables; 