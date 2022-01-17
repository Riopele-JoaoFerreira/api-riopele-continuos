const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Maquina = require('./riopele40_maquinas')
const Ordem = require('./riopele40_ordens_sap')

class Movimentos extends Model {}

Movimentos.init({
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
   quantidade_produzida: DataTypes.FLOAT,
   data_inicio: DataTypes.DATE,
   data_fim: DataTypes.DATE,
   estado_sap: DataTypes.CHAR, 
   num_jogo: DataTypes.INTEGER
}, { sequelize, modelName: 'riopele40_producoes_jogos_movimentos', tableName: 'riopele40_producoes_jogos_movimentos' });

Maquina.hasMany(Movimentos, {foreignKey: 'cod_sap'})
Movimentos.belongsTo(Maquina, {foreignKey: 'cod_sap'})

Ordem.hasMany(Movimentos, {foreignKey: 'ordem'})
Movimentos.belongsTo(Ordem, {foreignKey: 'ordem'})

module.exports = Movimentos; 