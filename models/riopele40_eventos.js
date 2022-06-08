const sequelize = require('../utilities/connection').connection;
const { Model, DataTypes } = require('sequelize');

const Machine = require('./riopele40_maquinas')
const Stop_Reason = require('./riopele40_motivos_paragem')

class Event extends Model {}

Event.init({
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

Machine.hasMany(Event, {foreignKey: 'cod_maquina_fabricante'})
Event.belongsTo(Machine, {foreignKey: 'cod_maquina_fabricante'})

Stop_Reason.hasMany(Event, {foreignKey: 'cod_evento'})
Event.belongsTo(Stop_Reason, {foreignKey: 'cod_evento'})

Stop_Reason.hasMany(Event, {foreignKey: 'cod_estado'})
Event.belongsTo(Stop_Reason, {foreignKey: 'cod_estado'})

module.exports = Event; 