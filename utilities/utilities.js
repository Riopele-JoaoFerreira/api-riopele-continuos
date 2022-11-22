const OPCUA_Client = require('node-opcua');
const { Op } = require('sequelize');
const Machine = require('../models/riopele40_maquinas');
const Production = require('../models/riopele40_producoes');

exports.getType = (type) => {
    switch (type) {
        case 'int16':
            return { dataType: OPCUA_Client.DataType.Int16 };
        break;
        case 'int32':
            return { dataType: OPCUA_Client.DataType.Int32 };
        break;
        case 'string':
            return { dataType: OPCUA_Client.DataType.String };
        break;
        case 'uint16':
            return { dataType: OPCUA_Client.DataType.UInt16 };
        break;
        case 'uint32':
            return { dataType: OPCUA_Client.DataType.UInt32 };
        break;
        case 'real32':
            return { dataType: OPCUA_Client.DataType.Float };
        break;
    }
}

exports.convert = (type, value) => {
    switch (type) {
        case 'int16':
            return parseInt(value);
        break;
        case 'int32':
            return parseInt(value);
        break;
        case 'string':
            if(value == 0) {
                return ''; 
            } else {
                 return String(value);
            }
        break;
        case 'uint16':
            return parseInt(value);
        break;
        case 'uint32':
            return parseInt(value);
        break;
        case 'real32':
            return parseFloat(value);
        break;
    }
}

exports.getGameNumber = (ordem, cod_sap, callback) => {
    Production.findAll({
        where: {
            [Op.and]: [
                {
                    ordem: ordem,  
                },
                {
                    cod_sap: cod_sap
                }
            ]
        }, 
        order: [['num_jogo', 'DESC']],
        limit: 1,
        attributes: ['num_jogo']
    }).then(res => {
        console.log(ordem, cod_sap);
        if(res[0].num_jogo > 0) {
            return callback(res[0].num_jogo + 1); 
        } else {
            return callback(1); 
        }
    }).catch((err)=> {
        if(err) {
            return callback(1); 
        }
    })
}

exports.getActualGameNumber = (ordem, cod_sap, callback) => {
    Production.findAll({
        where: {
            [Op.and]: [
                {
                    ordem: ordem,  
                },
                {
                    cod_sap: cod_sap
                }
            ]
        }, 
        order: [['num_jogo', 'DESC']],
        limit: 1,
        attributes: ['num_jogo']
    }).then(res => {
        if(res[0].num_jogo > 0) {
            return callback(res[0].num_jogo); 
        } else {
            return callback(0); 
        }
    }).catch((err)=> {
        if(err) {
            return callback(0); 
        }
    })
}

exports.getMachineInfo = (id, callback) => {
    Machine.findAll({
        where: {
            id: id
        }, 
    }).then(res => {
        if(res[0]) {
            return callback(res[0]); 
        } else {
            return callback(null); 
        }
    }).catch((err)=> {
        console.log(err);
        if(err) {
            return callback(null); 
        }
    })
}

exports.closeIfOpen = (ordem, cod_sap, data, callback) => {
    Production.update({
        data_fim: data
    }, {
        where: {
            ordem: ordem, 
            cod_sap: cod_sap, 
            data_fim: {
                [Op.eq]: null
            }
        }
    }).then((res)=> {
        return callback();
    }).catch((err)=> {
        if(err) {
            return callback(); 
        }  
    })
}

exports.getMachineInfoByOPCUAID = (id, callback) => {
    Machine.findAll({
        where: {
            identificador_opcua: id
        }, 
    }).then(res => {
        if(res[0]) {
            return callback(res[0]); 
        } else {
            return callback(null); 
        }
    }).catch((err)=> {
        console.log(err);
        if(err) {
            return callback(null); 
        }
    })
}

exports.timestamptToDate = (date_, hour_) => {
     // DATE
     let date = new Date('1990-01-01');
     let actual_date = date.addDays(date_);
     let sql_date = actual_date.toISOString().slice(0, 10);
 
     // HOUR
     let hours = hour_/3600000
     let decimal_Time_String = hours;
     let decimal_Time = parseFloat(decimal_Time_String);
     decimal_Time = decimal_Time * 60 * 60;
     hours = Math.floor((decimal_Time / (60 * 60)));
     decimal_Time = decimal_Time - (hours * 60 * 60);
     let minutes = Math.floor((decimal_Time / 60));
     decimal_Time = decimal_Time - (minutes * 60);
     let seconds = Math.round(decimal_Time);
 
     if(hours < 10) {
         hours = "0" + hours;
     }
 
     if(minutes < 10) {
         minutes = "0" + minutes;
     }
    
     if(seconds < 10) {
         seconds = "0" + seconds;
     }
 
     if(seconds == 60) {
         seconds = 59;
     }
 
     let actual_hour = "" + hours + ":" + minutes + ":" + seconds;
     var final_date = sql_date + ' ' + actual_hour;

     return final_date; 
}
