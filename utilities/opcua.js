const moment= require('moment');
const OPCUA_Client = require('node-opcua');
const async = require('async');
const config = require('../config/config')
const Op = require('sequelize').Op; 
const options = require('../config/opcua').config
const endpoint_Url = require('../config/opcua').url
const client = OPCUA_Client.OPCUAClient.create(options);
const Events = require('../models/riopele40_eventos')
const Machine = require('../models/riopele40_maquinas')
const OPCUA_Server = require('../models/riopele40_servidores_opcua')
const Method = require('../models/riopele40_opcua_metodos')

let session = null;

async function connect() {
    try {
        await client.connect(endpoint_Url);
        session = await client.createSession();
    } catch(err) {
    console.log("An error has occured : ",err);
    }
}

async function disconnect() {
    await client.disconnect();
}

// SET TABLE ON "ORDENS PLANEADAS" MENU
exports.setTableOrders = function (table, callback) {
    connect().then(() => {
        let error = null; 
        let stack = [];
        table.forEach(node => {
            stack.push((callback) => {
                session.write(node, function(err,status_code,diagnostic_info) {
                    if (err) {
                        error = err;  
                    }
                    return callback();
                });
            })
        })
        async.waterfall(stack, () => {
            disconnect();
            return callback(error);
        })
    });
}

// EXPORT NEW EVENTS FROM OPCUA
exports.exportEvents = function (callback) {

    let machines_list = null; 
    let method_new = method_event_code = method_event_state = method_event_date = method_event_hour = method_event_order = null; 

    let getMachineInfo = (callback) => {
        Machine.findAll({
            include: {
                model: OPCUA_Server, 
            },
            where: {
                identificador_opcua: {
                    [Op.ne]: null
                }
            }
        }).then((res)=> {
            machines_list = res; 
            return callback(); 
        }).catch((err) => {
            console.log(err);
            return callback(); 
        })
    }

    let getMethodNew = async (callback) => {
        method_new = await getMethod('eventos', "Novo"); 
    }

    let getMethodEventCode = async (callback) => {
        method_event_code = await getMethod('eventos', "Codigo"); 
    }

    let getMethodStateCode = async (callback) => {
        method_event_state = await getMethod('eventos', "Estado"); 
    }

    let getMethodOrder = async (callback) => {
        method_event_order = await getMethod('ordem_atual', "ordem"); 
    }

    let getMethodDate = async (callback) => {
        method_event_date = await getMethod('eventos', "Data"); 
    }

    let getMethodHour = async (callback) => {
        method_event_hour = await getMethod('eventos', "Hora");   
    }

    async.parallel([getMachineInfo, getMethodNew, getMethodEventCode, getMethodStateCode, getMethodOrder, getMethodHour, getMethodDate], () => {
        let stack = []; 
        machines_list.forEach(machine => {
            stack.push((callback) => {
                // REMOVE LATER
                if(machine.id == 233) {
                    connect().then(async () => {
                        let event_info = null; 

                        event_obj = [
                            { nodeId: method_event_code.prefixo + machine.identificador_opcua + method_event_code.identificador},
                        ];

                        state_obj = [
                            { nodeId: method_event_state.prefixo + machine.identificador_opcua + method_event_state.identificador},
                        ];

                        order_obj = [
                            { nodeId: method_event_order.prefixo + machine.identificador_opcua + method_event_order.identificador},
                        ];

                        date_obj = [
                            { nodeId: method_event_date.prefixo + machine.identificador_opcua + method_event_date.identificador},
                        ];

                        hour_obj = [
                            { nodeId: method_event_hour.prefixo + machine.identificador_opcua + method_event_hour.identificador},
                        ];

                        while (await (event_info = await getEvent(event_obj, state_obj, order_obj, date_obj, hour_obj)).event_code > 0){
                            let node_to_write = [
                                {
                                    nodeId: method_new.prefixo + machine.identificador_opcua + method_new.identificador ,
                                    attributeId: OPCUA_Client.AttributeIds.Value,
                                    value: {    
                                        value: { 
                                            dataType: OPCUA_Client.DataType.Int16,
                                            value: 0
                                        }
                                    }
                                }        
                            ];

                            let obj = {
                                id_seccao: machine.id_seccao,
                                cod_sap: machine.cod_sap,
                                cod_evento: event_info.event_code,                
                                cod_maquina_fabricante: machine.cod_maquina_fabricante,
                                data_inicio: event_info.timestamp, 
                                cod_estado: event_info.state_code,
                                ordem: event_info.order,
                            }
                
                            session.write(node_to_write, function(err,status_code,diagnostic_info) {
                                if (!err) {
                                    Events.update({
                                        data_fim: moment().format('YYYY-MM-DD HH:mm:ss')
                                    }, {
                                        where: {
                                            [Op.and]: {
                                                cod_maquina_fabricante: machine.cod_maquina_fabricante,
                                                data_fim: {
                                                    [Op.eq]: null
                                                } 
                                            }
                                        }
                                    }).then((res) => {
                                        Events.create(obj).then((res) => {}).catch((err) => {})
                                    }).catch((err) => {}) 
                                }
                            }); 
                        }
                        disconnect();
                        return callback(); 
                    }); 
                } else {
                    return callback(); 
                }
            })    
        });
        async.parallel(stack, () => {})  
    }).catch((err) => {})
}

async function getMethod(group, key) {
    let method = await Method.findAll({
        where: {
            grupo: group, 
            chave: key
        }
    })

    return method[0]; 
} 

async function getEvent(event_obj, state_obj, order_obj, date_obj, hour_obj) {
    
    // DATE
    let res = await session.read(date_obj);
    let event_date = await res.map(result => result.value.value)[0];
    let date = new Date('1990-01-01');
    let actual_date = date.addDays(event_date);
    let sql_date = actual_date.toLocaleDateString("pt-PT");

    // HOUR
    res = await session.read(hour_obj);
    let event_hour = await res.map(result => result.value.value)[0];
    let hours = event_hour/3600000
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

    let actual_hour = "" + hours + ":" + minutes + ":" + seconds;
    var timestamp = sql_date + ' ' + actual_hour;

    res = await session.read(event_obj);
    let event_code = await res.map(result => result.value.value)[0];

    res = await session.read(state_obj);
    let state_code = await res.map(result => result.value.value)[0];

    res = await session.read(order_obj);
    let order = await res.map(result => result.value.value)[0];

    let obj = {
        timestamp: timestamp, 
        event_code: event_code, 
        state_code: state_code, 
        order: order[0]
    };

    return obj
}