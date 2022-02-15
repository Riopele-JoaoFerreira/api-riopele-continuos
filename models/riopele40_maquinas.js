const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const ServidorOPCUA = require('./riopele40_servidores_opcua')
const GrupoMaquina = require('./riopele40_grupos_maquinas')

class Maquina extends Model {}

Maquina.init({
   id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
   },
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
         model: ServidorOPCUA, 
         key: 'id', 
      }
   },
   id_grupo: {
      type: DataTypes.INTEGER,
      references: {
         model: GrupoMaquina, 
         key: 'id', 
      }
   }
}, { sequelize, modelName: 'riopele40_maquinas', tableName: 'riopele40_maquinas' });

Maquina.belongsTo(ServidorOPCUA, {foreignKey: 'id_servidor'})
Maquina.belongsTo(GrupoMaquina, {foreignKey: 'id_grupo'})

module.exports = Maquina; 