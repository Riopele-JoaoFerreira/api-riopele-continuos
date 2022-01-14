const connection = require('../utilities/connection').connection;
const sequelize = connection; 
const { Model, DataTypes } = require('sequelize');

const Servidor_OPCUA = require('./riopele40_servidores_opcua')

class Maquina extends Model {}

Maquina.init({
  cod_sap: DataTypes.STRING,
  cod_maquina_fabricante: DataTypes.STRING,
  num_fusos: DataTypes.STRING,
  capacidade: DataTypes.STRING,
  sigla: DataTypes.STRING,
  posicao: DataTypes.INTEGER,
  ativa: DataTypes.TINYINT,
  identificador_opcua: DataTypes.STRING,
   id_servidor: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_servidores_opcua', 
         key: 'id', 
      }
   }
}, { sequelize, modelName: 'riopele40_maquinas', tableName: 'riopele40_maquinas' });

Servidor_OPCUA.hasMany(Maquina, {foreignKey: 'id_servidor'})
Maquina.belongsTo(Servidor_OPCUA, {foreignKey: 'id_servidor'})

module.exports = Maquina; 