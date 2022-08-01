const moment= require('moment');
const OPCUA_Client = require('node-opcua');
const async = require('async');
const sequelize = require('../utilities/connection').connection;
const Op = require('sequelize').Op; 
const Events = require('../models/riopele40_eventos')
const Machine = require('../models/riopele40_maquinas')
const OPCUA_Server = require('../models/riopele40_servidores_opcua')
const Method = require('../models/riopele40_opcua_metodos');
const Order_Planned = require('../models/riopele40_ordens_planeadas');
const Controller = require('../controllers/riopele40_ordens');

let clients = []; 
let sessions = []; 

async function connect() {

    clients.forEach( async client_session => {
        await client_session.disconnect();
    });

    OPCUA_Server.findAll().then((res)=> {
        res.forEach(async server => {
            try {
                let options = {
                    applicationName: server.url,
                    connectionStrategy: {
                        initialDelay: 1000,
                        maxRetry: 1
                    },
                    securityMode: OPCUA_Client.MessageSecurityMode.None,
                    securityPolicy: OPCUA_Client.SecurityPolicy.None,
                    endpointMustExist: false,
                };

                let client = OPCUA_Client.OPCUAClient.create(options);
                let url = server.protocolo + server.url + ":" + server.porta;
                let server_name = server.url; 
                let obj = {};

                let client_session = await client.connect(url);
                let session = await client.createSession();
                obj[server_name] = session
                sessions.push(obj); 
                clients.push(client); 
            } catch(err) {}
        });
    })
}

connect(); 

exports.setTableOrders = function (table, server_name, callback) {
    let error = null; 
    let stack = [];
    table.forEach(node => {
        stack.push((callback) => {
            let session_ = searchServerName(server_name, sessions); 
            session_.write(node, function(err,status_code,diagnostic_info) {
                if (err) {
                    console.log(err);
                    error = err;  
                }
                return callback();
            });
        })
    })
    async.waterfall(stack, () => {
        return callback(error);
    })
}

exports.exportEvents = function () {

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
        method_event_order = await getMethod('eventos', "Str1"); 
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
                let server_name = machine.riopele40_servidores_opcua.url; 
                let session_ = searchServerName(server_name, sessions);
                if(machine.id == 233 || machine.id == 220) {
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

                    (async ()=>{
                        while (await (event_info = await getEvent(event_obj, state_obj, order_obj, date_obj, hour_obj, session_)).event_code > 0){
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

                            session_.write(node_to_write, function(err,status_code,diagnostic_info) {
                                if (!err) {
                                    Events.update({
                                        data_fim: event_info.timestamp,
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
                                        Events.create(obj).then((res) => {}).catch((err) => {
                                            console.log(err);
                                        })
                                    }).catch((err) => {
                                        console.log(err);
                                    }) 
                                }
                            }); 
                        }
                    })()
                    return callback(); 
                } else {
                    return callback(); 
                }
            })    
        });
        async.parallel(stack, () => {})  
    }).catch((err) => {})
}

exports.updateOrders = function () {

    let machines_list = null;
    let opcua_identifiers = []; 
    let machines_id = []; 
    let nodes_to_read = [];  
    
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

    let getMethods = (callback) => {
        let stack = []; 
        let server_name = null; 
        let session_ = null;
        machines_list.forEach(machine => {
            stack.push((callback) => {
                server_name = machine.riopele40_servidores_opcua.url; 
                session_ = searchServerName(server_name, sessions);
                if(machine.id == 233 || machine.id == 220) {
                    Method.findAll({
                        where: {
                            grupo: 'ordem_atual',
                            chave: 'ordem'
                        }
                    }).then(res => {
                        let loops = res[0].repeticoes
                        let array = []; 
                        let machines_array = []; 
                        let ids = []; 
                        for (let i = 1; i <= loops; i++) {
                            res.forEach(method => {
                                let obj =  {
                                    nodeId: method.prefixo + machine.identificador_opcua + method.identificador + i + "_" + method.chave,
                                }
                                array.push(obj)
                                machines_array.push(machine.identificador_opcua)
                                ids.push(machine.id)
                            })
                        }
                        nodes_to_read = array
                        opcua_identifiers = machines_array
                        machines_id = ids; 
                        return callback(); 
                    }).catch((err) => {
                        return callback();
                    })
                } else {
                    return callback(); 
                }
            })
        });
        async.parallel(stack, () => {
            let orders_to_update = []; 
            nodes_to_read.forEach(async node => {
                res = await session_.read(node);
                try {
                    let order = res.value.value[0]
                    if(order != '') {
                        orders_to_update.push(order)
                    }
                } catch (error) {} 
            });
            let i = 0; 
            nodes_to_read.forEach(async node => {
                res = await session_.read(node);
                await updateOrder(opcua_identifiers[i], machines_id[i], i + 1, orders_to_update, session_)
                i ++; 
            });
            return callback(); 
        })
    }

    async.waterfall([getMachineInfo, getMethods], () => {})
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

async function getEvent(event_obj, state_obj, order_obj, date_obj, hour_obj, session_) {
    // DATE
    let res = await session_.read(date_obj);
    let event_date = await res.map(result => result.value.value)[0];
    let date = new Date('1990-01-01');
    let actual_date = date.addDays(event_date);
    let sql_date = actual_date.toLocaleDateString("pt-PT");

    // HOUR
    res = await session_.read(hour_obj);
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

    res = await session_.read(event_obj);
    let event_code = await res.map(result => result.value.value)[0];

    res = await session_.read(state_obj);
    let state_code = await res.map(result => result.value.value)[0];

    res = await session_.read(order_obj);
    let order = await res.map(result => result.value.value)[0];
    try {
        order = order[0]
    } catch (error) {
        order = '';
    }

    let obj = {
        timestamp: timestamp, 
        event_code: event_code, 
        state_code: state_code, 
        order: order
    };

    return obj
}

async function updateOrder(identificador_opcua, machine_id, index, orders_list, session_) {

    let getMethodID = async (callback) => {
        method_order_id = await getMethod('ordem_atual', "ID"); 
    }

    let getMethodSpindle = async (callback) => {
        method_order_spindle = await getMethod('ordem_atual', "fusos"); 
    }

    let getMethodState = async (callback) => {
        method_order_state = await getMethod('ordem_atual', "Estado"); 
    }

    async.parallel([getMethodID, getMethodSpindle, getMethodState], async () => {
        let id_obj = [
            { nodeId: method_order_id.prefixo + identificador_opcua + method_order_id.identificador + index + '_' + method_order_id.chave},
        ];

        let splindles_obj = [
            { nodeId: method_order_spindle.prefixo + identificador_opcua + method_order_spindle.identificador + index + '_' + method_order_spindle.chave},
        ];

        let state_obj = [
            { nodeId: method_order_state.prefixo + identificador_opcua + method_order_state.identificador + index + '_' + method_order_state.chave},
        ];

        let id_res = await session_.read(id_obj);
        let id = await id_res.map(result => result.value.value)[0];
        let splindles_res = await session_.read(splindles_obj);
        let splindles = await splindles_res.map(result => result.value.value)[0];
        let state_res = await session_.read(state_obj);
        let state = await state_res.map(result => result.value.value)[0];

        if(orders_list.length == 0) {
            await sequelize.query("UPDATE riopele40_ordens_planeadas SET estado = null WHERE data_fim IS NULL AND id_ordem_maquina IN (SELECT id FROM riopele40_ordem_maquinas WHERE id_maquina = '"+machine_id+"')")
            return true; 
        } else {
            sequelize.query("UPDATE riopele40_ordens_planeadas SET estado = null WHERE data_fim IS NULL AND id_ordem_maquina IN (SELECT id FROM riopele40_ordem_maquinas WHERE id_maquina = '"+machine_id+"' AND ordem NOT IN ("+orders_list.join(',')+"))").then((res) => {
                Order_Planned.update({
                    fusos: splindles, 
                    estado: state 
                }, {
                    where: {
                        id: id
                    }
                }).then((res) => {
                    let req = {
                        body: {
                            id: machine_id
                        }
                    }
                    Controller.updateTable(req, null)
                    return true;
                }).catch((err) => {
                    return false;
                })
            }).catch((err) => {
                return false;
            })
        }
    })
}

exports.readNode = async function(nodeID, server_name) {
    let session_ = searchServerName(server_name, sessions); 
    return await session_.read(nodeID);
}

function searchServerName(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (Object.keys(myArray[i]) == nameKey) {
            return myArray[i][nameKey];
        }
    }
}

exports.getMethod = getMethod; 
exports.connect = connect; 