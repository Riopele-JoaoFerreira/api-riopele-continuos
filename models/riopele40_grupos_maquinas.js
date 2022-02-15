const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

class GrupoMaquina extends Model {}

GrupoMaquina.init({
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

module.exports = GrupoMaquina; 