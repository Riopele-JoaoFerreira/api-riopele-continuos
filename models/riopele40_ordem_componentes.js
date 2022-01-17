const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const OrdemSAP = require('./riopele40_ordens_sap')

class OrdemComponentes extends Model {}

OrdemComponentes.init({
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

OrdemSAP.hasMany(OrdemComponentes, {foreignKey: 'cod_sap'})
OrdemComponentes.belongsTo(OrdemSAP, {foreignKey: 'cod_sap'})

module.exports = OrdemComponentes; 