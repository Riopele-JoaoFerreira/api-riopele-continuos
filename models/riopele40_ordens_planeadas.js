const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const OrdemMaquina = require('./riopele40_ordem_maquinas')

class OrdemPlaneada extends Model {}

OrdemPlaneada.init({
   id_seccao: DataTypes.INTEGER,
   sequencia: DataTypes.INTEGER, 
   artigo: DataTypes.STRING, 
   descricao: DataTypes.STRING, 
   lote: DataTypes.STRING, 
   componente_principal: DataTypes.STRING, 
   descricao_componente_principal: DataTypes.STRING, 
   lote_componente_principal: DataTypes.STRING, 
   quantidade_a_produzir: DataTypes.FLOAT, 
   tonalidade: DataTypes.STRING, 
   ne: DataTypes.FLOAT, 
   ne_final: DataTypes.INTEGER, 
   torcao: DataTypes.FLOAT, 
   numero_cabos: DataTypes.INTEGER, 
   variacao_velocidade: DataTypes.FLOAT, 
   velocidade: DataTypes.INTEGER, 
   data_inicio: DataTypes.DATE, 
   quantidade_produzida: DataTypes.FLOAT, 
   data_fim: DataTypes.DATE, 
   fusos: DataTypes.INTEGER, 
   cor_cone: DataTypes.STRING, 
   estado: DataTypes.INTEGER, 
   operacao: DataTypes.STRING, 
   data_prevista: DataTypes.DATEONLY, 
   data_inicio_planeada: DataTypes.DATEONLY, 
   ordenacao: DataTypes.INTEGER, 
   tipo_planeamento: DataTypes.CHAR, 
   peso_por_fuso: DataTypes.FLOAT, 
   sentido_torcao: DataTypes.CHAR, 
   fechado_manualmente: DataTypes.CHAR,
   id_ordem_maquina: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_ordem_maquinas', 
         key: 'id', 
      }
   }
}, { sequelize, modelName: 'riopele40_ordens_planeadas', tableName: 'riopele40_ordens_planeadas' });

OrdemMaquina.hasMany(OrdemPlaneada, {foreignKey: 'id_ordem_maquina'})
OrdemPlaneada.belongsTo(OrdemMaquina, {foreignKey: 'id_ordem_maquina'})

module.exports = OrdemPlaneada; 