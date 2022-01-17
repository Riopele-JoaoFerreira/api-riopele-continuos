const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Maquina = require('./riopele40_maquinas')
const Ordem = require('./riopele40_ordens_sap')

class Variaveis extends Model {}

Variaveis.init({
   id_seccao: DataTypes.INTEGER, 
   cod_maquina_fabricante: DataTypes.INTEGER,
   cod_sap: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_ordem_maquinas', 
         key: 'cod_sap', 
      }
   },
   ordem: {
      type: DataTypes.STRING,
      references: {
         model: 'riopele40_ordens_sap', 
         key: 'ordem', 
      }
   },
   num_jogo: DataTypes.INTEGER,
   velocidade: DataTypes.INTEGER,
   torcao: DataTypes.FLOAT, 
   data: DataTypes.DATE
}, { sequelize, modelName: 'riopele40_producoes_jogos_variaveis', tableName: 'riopele40_producoes_jogos_variaveis' });

Maquina.hasMany(Variaveis, {foreignKey: 'cod_sap'})
Variaveis.belongsTo(Maquina, {foreignKey: 'cod_sap'})

Ordem.hasMany(Variaveis, {foreignKey: 'ordem'})
Variaveis.belongsTo(Ordem, {foreignKey: 'ordem'})

module.exports = Variaveis; 