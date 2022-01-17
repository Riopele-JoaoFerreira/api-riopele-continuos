const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Maquina = require('./riopele40_maquinas')
const MotivoParagem = require('./riopele40_motivos_paragem')

class Paragem extends Model {}

Paragem.init({
   id_seccao: DataTypes.INTEGER,
   cod_maquina_fabricante: DataTypes.INTEGER, 
   data_inicio: DataTypes.DATE,
   data_fim: DataTypes.DATE, 
   estado_sap: DataTypes.CHAR, 
   cod_sap: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_maquinas', 
         key: 'cod_sap', 
      }
   },
   cod_paragem: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_motivos_paragem', 
         key: 'cod_paragem', 
      }
   }
}, { sequelize, modelName: 'riopele40_paragens', tableName: 'riopele40_paragens' });

Maquina.hasMany(Paragem, {foreignKey: 'cod_sap'})
Paragem.belongsTo(Maquina, {foreignKey: 'cod_sap'})

MotivoParagem.hasMany(Paragem, {foreignKey: 'cod_paragem'})
Paragem.belongsTo(MotivoParagem, {foreignKey: 'cod_paragem'})

module.exports = Paragem; 