const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const OPCUA_Server = require('./riopele40_servidores_opcua')
const Machine_Group = require('./riopele40_grupos_maquinas')

class Machine extends Model {}

Machine.init({
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
         model: OPCUA_Server, 
         key: 'id', 
      }
   },
   id_grupo: {
      type: DataTypes.INTEGER,
      references: {
         model: Machine_Group, 
         key: 'id', 
      }
   }
}, { sequelize, modelName: 'riopele40_maquinas', tableName: 'riopele40_maquinas' });

Machine.belongsTo(OPCUA_Server, {foreignKey: 'id_servidor'})
Machine.belongsTo(Machine_Group, {foreignKey: 'id_grupo'})

module.exports = Machine; 