const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

class MotivoParagem extends Model {}

MotivoParagem.init({
   cod_paragem: DataTypes.INTEGER,
   designacao: DataTypes.STRING,
   id_seccao: DataTypes.INTEGER,
   cor: DataTypes.STRING,
   ativa: DataTypes.CHAR,
   cor2: DataTypes.STRING,
   intermitente: DataTypes.CHAR,
   tipo: DataTypes.STRING,
   cod_evento: DataTypes.INTEGER,
   e_paragem: DataTypes.CHAR
}, { sequelize, modelName: 'riopele40_motivos_paragem', tableName: 'riopele40_motivos_paragem' });

module.exports = MotivoParagem; 