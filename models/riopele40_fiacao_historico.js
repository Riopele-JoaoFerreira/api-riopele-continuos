const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Machine = require('./riopele40_maquinas')
const Order = require('./riopele40_ordens_sap')

class History extends Model {}

History.init({
   id_seccao: DataTypes.INTEGER, 
   cod_maquina_arum: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_ordem_maquinas', 
         key: 'cod_maquina_arum', 
      }
   },
   ordem: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_ordens_sap', 
         key: 'ordem', 
      }
   },
   fusos: DataTypes.INTEGER,
   cor_cone: DataTypes.STRING,
   velocidade_real: DataTypes.INTEGER, 
   torcao_real: DataTypes.INTEGER, 
   variacao_velocidade: DataTypes.FLOAT,
   estado: DataTypes.STRING, 
   data_inicio: DataTypes.DATE, 
   data_fim: DataTypes.DATE, 
   quantidade_a_produzir: DataTypes.FLOAT,
   quantidade_produzida: DataTypes.FLOAT, 
   enviou_para_sap: DataTypes.CHAR, 
   manual: DataTypes.CHAR, 
   user_cria: DataTypes.INTEGER, 
   data_criacao: DataTypes.DATE, 
   lote: DataTypes.STRING, 
   operacao: DataTypes.STRING, 
   id_seccao: DataTypes.INTEGER, 
}, { sequelize, modelName: 'riopele40_fiacao_historico', tableName: 'riopele40_fiacao_historico' });

Machine.hasMany(History, {foreignKey: 'cod_maquina_arum'})
History.belongsTo(Machine, {foreignKey: 'cod_maquina_arum'})

Order.hasMany(History, {foreignKey: 'ordem'})
History.belongsTo(Order, {foreignKey: 'ordem'})

module.exports = History; 