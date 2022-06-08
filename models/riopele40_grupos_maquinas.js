const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

class Machine_Group extends Model {}

Machine_Group.init({
   id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
   },
   id_seccao: DataTypes.INTEGER,
   nome: DataTypes.STRING,
   posicao: DataTypes.INTEGER,
   ativa: DataTypes.CHAR,
   visivel: DataTypes.CHAR
}, { sequelize, modelName: 'riopele40_grupos_maquinas', tableName: 'riopele40_grupos_maquinas' });

module.exports = Machine_Group; 