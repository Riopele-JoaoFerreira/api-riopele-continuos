const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Machine = require('./riopele40_maquinas')

class Order extends Model {}

Order.init({
   id_seccao: DataTypes.INTEGER, 
   ordem: DataTypes.STRING,
   operacao: DataTypes.STRING,
   artigo: DataTypes.STRING,
   descricao_artigo: DataTypes.STRING, 
   lote: DataTypes.STRING, 
   componente_principal: DataTypes.STRING, 
   descricao_componente_principal: DataTypes.STRING, 
   lote_componente_principal: DataTypes.STRING, 
   quantidade_a_produzir: DataTypes.FLOAT, 
   data_prevista: DataTypes.DATEONLY, 
   data_inicio_planeada: DataTypes.DATEONLY, 
   cor: DataTypes.STRING, 
   tonalidade: DataTypes.STRING, 
   ne: DataTypes.FLOAT, 
   ne_final: DataTypes.INTEGER, 
   sentido_torcao: DataTypes.CHAR, 
   torcao: DataTypes.INTEGER, 
   numero_cabos: DataTypes.INTEGER, 
   cor_cone: DataTypes.STRING, 
   velocidade: DataTypes.INTEGER, 
   observacoes: DataTypes.TEXT, 
   quantidade_pesada: DataTypes.FLOAT, 
   fornecida: DataTypes.CHAR, 
   encerrada: DataTypes.CHAR, 
   velocidade_sap: DataTypes.INTEGER,
   centro_trabalho: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_maquinas', 
         key: 'cod_sap', 
      }
   },
}, { sequelize, modelName: 'riopele40_ordens_sap', tableName: 'riopele40_ordens_sap' });

Machine.hasMany(Order, {foreignKey: 'cod_sap'})
Order.belongsTo(Machine, {foreignKey: 'cod_sap'})

module.exports = Order; 