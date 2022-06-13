const moment= require('moment');
const OPCUA_Client = require('node-opcua');
const async = require('async');
const sequelize = require('../utilities/connection').connection;
const Op = require('sequelize').Op; 
const options = require('../config/opcua').config
const endpoint_Url = require('../config/opcua').url
const client = OPCUA_Client.OPCUAClient.create(options);
const Events = require('../models/riopele40_eventos')
const Machine = require('../models/riopele40_maquinas')
const OPCUA_Server = require('../models/riopele40_servidores_opcua')
const Method = require('../models/riopele40_opcua_metodos');
const Order_Planned = require('../models/riopele40_ordens_planeadas');
const Controller = require('../controllers/riopele40_ordens');


let session = null;
let running_job = false; 

async function connect() {
    await client.disconnect();
    try {
        await client.connect(endpoint_Url);
        session = await client.createSession();
    } catch(err) {}
}

async function disconnect() {
    await client.disconnect();
}

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
            return callback(error);
        })
    });
}

exports.exportEvents = function () {

    if(!running_job) {
        running_job = true; 
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
                                { nodeId: method_event_order.prefixo + machine.identificador_opcua + method_event_order.identificador + 1 + "_" + method_event_order.chave},
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
                            return callback(); 
                        }); 
                    } else {
                        return callback(); 
                    }
                })    
            });
            async.parallel(stack, () => {
                running_job = false; 
            })  
        }).catch((err) => {
            running_job = false; 
        })
    }
}

exports.updateOrders = function () {

    if(!running_job) {
        running_job = true; 
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
            machines_list.forEach(machine => {
                stack.push((callback) => {
                    if(machine.id == 233) {
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
                return callback(); 
            })
        }

        async.waterfall([getMachineInfo, getMethods], () => {
            connect().then(async () => {
                let orders_to_update = []; 
                let i = 0; 
                nodes_to_read.forEach(async node => {
                    res = await session.read(node);
                    let order = res.value.value[0]
                    if(order != '') {
                        await updateOrder(order, opcua_identifiers[i], machines_id[i], i + 1)
                    }
                    i ++; 
                });
                running_job = false; 
            })
        }).catch((err) => {
            running_job = false; 
        })
    }
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

async function updateOrder(order, identificador_opcua, machine_id, index) {

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

        let id_res = await session.read(id_obj);
        let id = await id_res.map(result => result.value.value)[0];
        let splindles_res = await session.read(splindles_obj);
        let splindles = await splindles_res.map(result => result.value.value)[0];
        let state_res = await session.read(state_obj);
        let state = await state_res.map(result => result.value.value)[0];

        sequelize.query("UPDATE riopele40_ordens_planeadas SET estado = 0 WHERE data_fim IS NULL AND id_ordem_maquina IN (SELECT id FROM riopele40_ordem_maquinas WHERE id_maquina = '"+machine_id+"')").then((res) => {
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
    })
}