const OPCUA_Client = require('node-opcua');
const { Op, or } = require('sequelize');
const Machine = require('../models/riopele40_maquinas');
const Production = require('../models/riopele40_producoes');
const Parametro = require('../models/parametros'); 
const sequelize = require('./connection').connection
const connect = require('./opcua')

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
            [Op.and]: [
                {
                    cod_sap: cod_sap
                },
                {
                    data_fim: {
                        [Op.eq]: null
                    }
                }
            ]
        }
    }).then((res)=> {
        return callback();
    }).catch((err)=> {
        if(err) {
            return callback(); 
        }  
    })
}

exports.timestamptToDate = (date_, hour_) => {
     // DATE
     let date = new Date('1990-01-01');
     let actual_date = date.addDays(date_ + 1);
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

exports.isLocked = (callback) => {
    Parametro.findOne({
        where: {
            parametro: 'api_continuos_lock'
        }
    }).then((res) => {
        if(res.valor == 'S') {
            return callback(true);
        } else {
            return callback(false); 
        }
    }).catch((err) => {
        return callback(false)
    })
}

exports.lock = () => {
    Parametro.update(
        {
            valor: 'S'
        }, 
        {
            where: {
                parametro: 'api_continuos_lock'
            }
        }
    )
    Parametro.update(
        {
            valor: Date.now()
        }, 
        {
            where: {
                parametro: 'api_continuos_lock_timestamp'
            }
        }
    )
}

exports.unlock = () => {
    Parametro.update(
        {
            valor: 'N'
        }, 
        {
            where: {
                parametro: 'api_continuos_lock'
            }
        }
    )
    Parametro.update(
        {
            valor: null
        }, 
        {
            where: {
                parametro: 'api_continuos_lock_timestamp'
            }
        }
    )
}

exports.check_locked_time = () => {
    Parametro.findAll( 
        {
            where: {
                parametro: 'api_continuos_lock_timestamp'
            }
        }
    ).then(parametro => {
        if (parametro[0].valor > 0) {
            if(Date.now() - parametro[0].valor > 60000) {
                console.log("Locked Limit Time Exceeded (20minutes), Unlocking") 
                this.unlock()
                connect.connect();  
            }
        }
    })
}