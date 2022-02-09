const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Maquina = require('./riopele40_maquinas')
const MotivoParagem = require('./riopele40_motivos_paragem')

class Evento extends Model {}

Evento.init({
   id_seccao: DataTypes.INTEGER,
   cod_sap: DataTypes.STRING,
   cod_evento: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_motivos_paragem', 
         key: 'cod_evento', 
      }
   },
   cod_estado: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_motivos_paragem', 
         key: 'cod_estado', 
      }
   },
   cod_maquina_fabricante: {
      type: DataTypes.INTEGER,
      references: {
         model: 'riopele40_maquinas', 
         key: 'cod_maquina_fabricante', 
      }
   },
   data_inicio: DataTypes.STRING, 
   data_fim: DataTypes.STRING, 
   enviou_para_sap: DataTypes.CHAR, 
   ordem: DataTypes.STRING
}, { sequelize, modelName: 'riopele40_eventos_TESTES', tableName: 'riopele40_eventos_TESTES' });

Maquina.hasMany(Evento, {foreignKey: 'cod_maquina_fabricante'})
Evento.belongsTo(Maquina, {foreignKey: 'cod_maquina_fabricante'})

MotivoParagem.hasMany(Evento, {foreignKey: 'cod_evento'})
Evento.belongsTo(MotivoParagem, {foreignKey: 'cod_evento'})

MotivoParagem.hasMany(Evento, {foreignKey: 'cod_estado'})
Evento.belongsTo(MotivoParagem, {foreignKey: 'cod_estado'})

module.exports = Evento; 