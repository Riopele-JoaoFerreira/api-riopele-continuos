const moment= require('moment');
const OPCUA_Client = require('node-opcua');
const Opcua = require('../utilities/opcua')
const async = require('async');
const sequelize = require('../utilities/connection').connection;
const Op = require('sequelize').Op; 
const Events = require('../models/riopele40_eventos')
const Machine = require('../models/riopele40_maquinas')
const OPCUA_Server = require('../models/riopele40_servidores_opcua')
const Method = require('../models/riopele40_opcua_metodos');
const Order_Planned = require('../models/riopele40_ordens_planeadas');
const Controller = require('../controllers/riopele40_ordens');
const { timestamptToDate, closeIfOpen, getGameNumber, getActualGameNumber, getMachineInfo } = require('./utilities');
const Production = require('../models/riopele40_producoes');
const Movements = require('../models/riopele40_producoes_jogos_movimentos');
const Stops = require('../models/riopele40_motivos_paragem');

let clients = []; 
let sessions = []; 
let startOrderEvents = [11];
let startGameEvents = [7];
let endOrderEvents = [13];
let endGameEvents = [9];

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

/*setTimeout(function() {
    let obj_test = {
        id_seccao: 18,
        cod_sap: 'PCON0101',
        cod_evento: 13,                
        cod_maquina_fabricante: 101,
        data_inicio: '2022-08-11 12:15:00', 
        cod_estado: 1,
        ordem: '200020962',
    }

    let server_name_test = 'SRVRIOT02'; 
    let session_test = searchServerName(server_name_test, sessions);

    startOrder(obj_test, session_test, 'ContinuosRiopB.101-B101'); 

}, 5000)*/

exports.setTableOrders = function (table, server_name, callback) {
    let error = null; 
    let stack = [];
    table.forEach(node => {
        stack.push((callback) => {
            let session_ = searchServerName(server_name, sessions); 
            session_.write(node, function(err,status_code,diagnostic_info) {
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

    async.waterfall([getMachineInfo, getMethodNew, getMethodEventCode, getMethodStateCode, getMethodOrder, getMethodHour, getMethodDate], () => {
        let stack = []; 
        machines_list.forEach(machine => {
            stack.push((callback) => {
                let server_name = machine.riopele40_servidores_opcua.url; 
                let session_ = searchServerName(server_name, sessions);

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
                                    Events.create(obj).then((res) => {
                                        if(startOrderEvents.includes(obj.cod_evento)) {
                                            startOrder(obj, session_, machine.identificador_opcua)
                                        } else if(startGameEvents.includes(obj.cod_evento)) {
                                            startGame(obj, session_, machine.identificador_opcua)
                                        } else if(endOrderEvents.includes(obj.cod_evento)) {
                                            endOrder(obj, session_, machine.identificador_opcua)
                                        } else if(endGameEvents.includes(obj.cod_evento)) {
                                            endGame(obj, session_, machine.identificador_opcua)
                                        }
                                    }).catch((err) => {
                                    })
                                }).catch((err) => {}) 
                            }
                        }); 
                    }
                })()
                return callback(); 
            })    
        });
        async.waterfall(stack, () => {})  
    }).catch((err) => {})
}

exports.updateOrders = function () {

    let machines_list = null;
    
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
                    let orders_to_update = []; 
                    let nodes_to_read = []; 
                    let opcua_identifiers = []; 
                    let machines_id = []; 
                    let stack1 = []; 
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
                    nodes_to_read.forEach(async node => {
                        stack1.push(async(callback) => {  
                            res = await session_.read(node);
                            try {
                                let order = res.value.value[0]
                            
                                if(order != '') {
                                    orders_to_update.push(order)
                                }

                                return callback(); 
                            } catch (error) {
                                return callback()
                            } 
                        })
                    });
                    async.waterfall(stack1, () => {
                        let i = 0; 
                        let stack2 = []; 
                        nodes_to_read.forEach(async node => {
                            stack2.push(async(callback) => {  
                                res = await session_.read(node);
                                await updateOrder(opcua_identifiers[i], machines_id[i], i + 1, orders_to_update, session_)
                                i++; 
                            })
                        });
                        async.waterfall(stack2, () => {
                            return callback(); 
                        })  
                    })  
                }).catch((err) => {
                    return callback();
                })
            })
        });
        async.waterfall(stack, () => {
            return callback(); 
        })  
    }

    async.waterfall([getMachineInfo, getMethods], () => {})
}

exports.recordProductions = function () {

    let machines_list = null;
    
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
                    let orders_to_update = []; 
                    let nodes_to_read = []; 
                    let opcua_identifiers = []; 
                    let machines_id = []; 
                    let stack1 = []; 
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
                    nodes_to_read.forEach(async node => {
                        stack1.push(async(callback) => {  
                            res = await session_.read(node);
                            try {
                                let order = res.value.value[0]
                            
                                if(order != '') {
                                    orders_to_update.push(order)
                                }

                                return callback(); 
                            } catch (error) {
                                return callback()
                            } 
                        })
                    });
                    async.waterfall(stack1, () => {
                        let i = 0; 
                        let stack2 = []; 
                        nodes_to_read.forEach(async node => {
                            stack2.push(async(callback) => {  
                                res = await session_.read(node);
                                await recordProduction(opcua_identifiers[i], machines_id[i], i + 1, orders_to_update[i], session_)
                                i++; 
                            })
                        });
                        async.waterfall(stack2, () => {
                            return callback(); 
                        })  
                    })  
                }).catch((err) => {
                    return callback();
                })
            })
        });
        async.waterfall(stack, () => {
            return callback(); 
        })  
    }

    async.waterfall([getMachineInfo, getMethods], () => {})
}

exports.readNode = async function(nodeID, server_name) {
    let session_ = searchServerName(server_name, sessions); 
    return await session_.read(nodeID);
}

exports.getMachineStatus = function (nodes_to_read, callback) {
    let error = null; 
    let stack = [];
    let list = {}; 
    nodes_to_read.forEach(node => {
        stack.push((callback) => {
            let session_ = searchServerName(node[0].server_name, sessions); 
            session_.read(node[1]).then((res)=> {

                let estado = res.value.value
                let server_name = node[0].server_name;
                    
                Method.findAll({
                    where: {
                        grupo: 'ordem_atual'
                    }
                }).then(async res => {
                    let loops = res[0].repeticoes
                    let array = []; 
                    for (let i = 1; i <= loops; i++) {
                       
                        method_order = await Opcua.getMethod('ordem_atual', "ordem");         
                        let method_order_obj = [
                            { nodeId: method_order.prefixo + node[4].identificador_opcua + method_order.identificador + i + '_' + method_order.chave},
                        ];
        
                        method_article = await Opcua.getMethod('ordem_atual', "artigo");   
                        let method_article_obj = [
                            { nodeId: method_article.prefixo + node[4].identificador_opcua + method_article.identificador + i + '_' + method_article.chave},
                        ];
        
                        method_batch = await Opcua.getMethod('ordem_atual', "lote");   
                        let method_batch_obj = [
                            { nodeId: method_batch.prefixo + node[4].identificador_opcua + method_batch.identificador + i + '_' + method_batch.chave},
                        ];
        
                        method_ne = await Opcua.getMethod('ordem_atual', "ne_final");   
                        let method_ne_obj = [
                            { nodeId: method_ne.prefixo + node[4].identificador_opcua + method_ne.identificador + i + '_' + method_ne.chave},
                        ];
        
                        method_twist = await Opcua.getMethod('ordem_atual', "torcao");   
                        let method_twist_obj = [
                            { nodeId: method_twist.prefixo + node[4].identificador_opcua + method_twist.identificador + i + '_' + method_twist.chave},
                        ];
        
                        method_game_production = await Opcua.getMethod('ordem_atual', "var10");   
                        let method_game_production_obj = [
                            { nodeId: method_game_production.prefixo + node[4].identificador_opcua + method_game_production.identificador + i + '_' + method_game_production.chave},
                        ];
        
                        method_game_production_estimated = await Opcua.getMethod('ordem_atual', "quantidade_jogo");   
                        let method_game_production_estimated_obj = [
                            { nodeId: method_game_production_estimated.prefixo + node[4].identificador_opcua + method_game_production_estimated.identificador + i + '_' + method_game_production_estimated.chave},
                        ];
        
                        let method_order_res = await Opcua.readNode(method_order_obj, server_name);
                        let order = await method_order_res.map(result => result.value.value)[0];
                        let method_article_res = await Opcua.readNode(method_article_obj, server_name);
                        let article = await method_article_res.map(result => result.value.value)[0];
                        let method_batch_res = await Opcua.readNode(method_batch_obj, server_name);
                        let batch = await method_batch_res.map(result => result.value.value)[0];
                        let method_ne_res = await Opcua.readNode(method_ne_obj, server_name);
                        let ne = await method_ne_res.map(result => result.value.value)[0];
                        let method_twist_res = await Opcua.readNode(method_twist_obj, server_name);
                        let twist = await method_twist_res.map(result => result.value.value)[0];
                        let method_game_production_res = await Opcua.readNode(method_game_production_obj, server_name);
                        let game_production = await method_game_production_res.map(result => result.value.value)[0];
                        let method_game_production_estimated_res = await Opcua.readNode(method_game_production_estimated_obj, server_name);
                        let game_production_estimated = await method_game_production_estimated_res.map(result => result.value.value)[0];
                        let progress = Math.ceil((game_production/game_production_estimated)*100)
        
                        try {
                            let obj = {
                                "ordem": order[0],
                                "lote": batch[0],
                                "artigo": article[0],
                                "ne": ne,
                                "torcao":twist,
                                "progresso": progress
                            }; 
            
                            if(order[0] != '') {
                               array.push(obj) 
                            }
                        } catch (error) {}   
                    }

                    Stops.findAll({
                        where: {
                            id_seccao: node[3].section, 
                            cod_paragem: estado, 
                            tipo: 'ES' 
                        }
                    }).then((stop) => {
                        let obj = {
                            id: node[2].machine.id,
                            cod_sap: node[2].machine.cod_sap,
                            cod_maquina_fabricante: node[2].machine.cod_maquina_fabricante,
                            num_fusos: node[2].machine.num_fusos,
                            cod_estado: estado,
                            info_estado: stop,
                            info_ordem: array
                        }
                        
                        if(list.hasOwnProperty(node[2].machine.riopele40_grupos_maquina.nome)) {
                            list[node[2].machine.riopele40_grupos_maquina.nome].push(obj)
                        } else {
                            list[node[2].machine.riopele40_grupos_maquina.nome] = []; 
                            list[node[2].machine.riopele40_grupos_maquina.nome].push(obj)
                        }
                        return callback()
                    }).catch((err) => {
                        error = err;
                        return callback(); 
                    })
                }).catch((err) => {
                    error = err;
                    return callback()
                })
            }).catch((err)=> {
                error = err;
                return callback()
            });    
        })
    })
    async.waterfall(stack, () => {
        return callback(list, error);
    })
}


async function getMethod(group, key) {
    let method = await Method.findOne({
        where: {
            [Op.and]: [
                {
                    grupo: group, 
                },
                {
                    chave: key
                }
            ]
        }
    })
    return method; 
} 

async function getEvent(event_obj, state_obj, order_obj, date_obj, hour_obj, session_) {
    // DATE
    let res = await session_.read(date_obj);
    let event_date = await res.map(result => result.value.value)[0];
    let date = new Date('1990-01-01');
    let actual_date = date.addDays(event_date);
    let sql_date = actual_date.toISOString().slice(0, 10);

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

    if(seconds == 60) {
        seconds = 59;
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

    async.waterfall([getMethodID, getMethodSpindle, getMethodState], async () => {
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

async function recordProduction(identificador_opcua, machine_id, index, order, session_) {

    let getMethodID = async (callback) => {
        method_order_id = await getMethod('ordem_atual', "ID"); 
    }

    let getActualProduction = async (callback) => {
        method_production = await getMethod('ordem_atual', "var10"); 
    }

    let getActualProductionOrder = async (callback) => {
        method_order_production = await getMethod('ordem_atual', "quantidade_produzida"); 
    }

    let getSetPoint = async (callback) => {
        method_setpoint = await getMethod('ordem_atual', "sp_velocidade"); 
    }

    let getMethodEndHour = async (callback) => {
        method_end_hour = await getMethod('ordem_atual', "hora_fim_jogo"); 
    }

    let getMethodEndDate = async (callback) => {
        method_end_date = await getMethod('ordem_atual', "data_fim_jogo"); 
    }


    async.waterfall([getMethodID, getActualProduction, getActualProductionOrder, getSetPoint, getMethodEndHour, getMethodEndDate], async () => {
        let id_obj = [
            { nodeId: method_order_id.prefixo + identificador_opcua + method_order_id.identificador + index + '_' + method_order_id.chave},
        ];

        let production_obj = [
            { nodeId: method_production.prefixo + identificador_opcua + method_production.identificador + index + '_' + method_production.chave},
        ];

        let production_order_obj = [
            { nodeId: method_order_production.prefixo + identificador_opcua + method_order_production.identificador + index + '_' + method_order_production.chave},
        ];

        let setpoint_obj = [
            { nodeId: method_setpoint.prefixo + identificador_opcua + method_setpoint.identificador + index + '_' + method_setpoint.chave},
        ];

        let method_end_hour_obj = [
            { nodeId: method_end_hour.prefixo + identificador_opcua + method_end_hour.identificador + index + '_' + method_end_hour.chave},
        ];

        let method_end_date_obj = [
            { nodeId: method_end_date.prefixo + identificador_opcua + method_end_date.identificador + index + '_' + method_end_date.chave},
        ];

        let id_res = await session_.read(id_obj);
        let id = await id_res.map(result => result.value.value)[0];
        let production_res = await session_.read(production_obj);
        let production = await production_res.map(result => result.value.value)[0];
        let production_order_res = await session_.read(production_order_obj);
        let production_order = await production_order_res.map(result => result.value.value)[0];
        let setpoint_res = await session_.read(setpoint_obj);
        let setpoint = await setpoint_res.map(result => result.value.value)[0];
        let end_hour_res = await session_.read(method_end_hour_obj);
        let end_hour = await end_hour_res.map(result => result.value.value)[0];
        let end_date_res = await session_.read(method_end_date_obj);
        let end_date= await end_date_res.map(result => result.value.value)[0];
        let final_date = timestamptToDate(end_date, end_hour); 

        if(id > 0) {
            let num_jogo = null; 
            let machine_info = null; 

            let getActualGameNumber_ = (callback) => {
                getActualGameNumber(order, machine_info.cod_sap, (res)=>{
                    num_jogo = res; 
                    return callback();
                })
            }
            
            let getMachineInfo_ = (callback) => {
                getMachineInfo(machine_id, (res)=>{
                    machine_info = res; 
                    return callback();
                })
            }
    
            async.waterfall([getMachineInfo_, getActualGameNumber_], async () => {
                sequelize.query("SELECT SUM(quantidade_produzida) as quantidade_produzida FROM riopele40_producoes_jogos_TESTES WHERE id_seccao = '"+ machine_info.id_seccao +"' AND cod_maquina_fabricante = '"+ machine_info.cod_maquina_fabricante +"' AND ordem = '"+ order +"' AND num_jogo = '"+ num_jogo +"'").then((res) => {
                    let old_production = null; 
                    if(res.length > 0) {
                        if(res[0][0].quantidade_produzida > 0) {
                            old_production = res[0][0].quantidade_produzida; 
                        } else {
                            old_production = 0; 
                        }
                    } else {
                        old_production = 0; 
                    }
                    let date = moment().format('YYYY-MM-DD HH:mm:ss'); 
                    Movements.update({
                        data_fim: date
                    }, {
                        where: {
                            [Op.and]: [
                                {
                                    id_seccao: machine_info.id_seccao,  
                                },
                                {
                                    cod_maquina_fabricante: machine_info.cod_maquina_fabricante
                                },
                                {
                                    ordem: order,
                                }, 
                                {
                                    data_fim: {
                                        [Op.eq]: null
                                    }
                                }
                            ]       
                        }
                    }).then((res) => {
                        let new_production = parseFloat(production).toFixed(3) - old_production; 

                        if(new_production < 0) {
                            new_production = 0
                        }

                        Movements.create({
                            id_seccao: machine_info.id_seccao,
                            cod_maquina_fabricante: machine_info.cod_maquina_fabricante,
                            cod_sap: machine_info.cod_sap,
                            ordem: order, 
                            quantidade_produzida: new_production, 
                            data_inicio: date, 
                            estado_sap: 'P',
                            num_jogo: num_jogo 
                        }).then((res)=> {
                            if(production > 0) {
                                Production.update({
                                    quantidade_produzida: parseFloat(production).toFixed(3), 
                                    velocidade_setpoint: parseFloat(setpoint).toFixed(3),
                                    data_fim_prevista: final_date
                                }, {
                                    where: {
                                        [Op.and]: [
                                            {
                                                id_seccao: machine_info.id_seccao,  
                                            },
                                            {
                                                cod_maquina_fabricante: machine_info.cod_maquina_fabricante
                                            },
                                            {
                                                ordem: order,
                                            }, 
                                            {
                                                num_jogo: num_jogo
                                            }
                                        ]      
                                    }
                                }).then((res) => {
                                    Order_Planned.update({
                                        quantidade_produzida: parseFloat(production_order).toFixed(3)
                                    }, {
                                        where: {
                                            id: id
                                        }
                                    }).then((res)=> {
                                        return true
                                    }).catch((err) => {
                                        return false
                                    })
                                }).catch((err)=> {
                                    return false
                                })
                            } else {
                                Order_Planned.update({
                                    quantidade_produzida: parseFloat(production_order).toFixed(3)
                                }, {
                                    where: {
                                        id: id
                                    }
                                }).then((res)=> {
                                    return true
                                }).catch((err) => {
                                    return false
                                })
                            }
                        }).catch((err) => {
                            return false; 
                        })
                    }).catch((err)=> {
                        return false; 
                    })
                }).catch((err) => {
                    return false
                }) 
            })
        }
    })
    return true; 
}

function searchServerName(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (Object.keys(myArray[i]) == nameKey) {
            return myArray[i][nameKey];
        }
    }
}

function startOrder(data, session_, identificador_opcua) {

    let getMethodID = async () => {
        method_id = await getMethod('ordem_atual', "ID"); 
    }

    let getMethodOrder = async () => {
        method_order_id = await getMethod('ordem_atual', "ordem"); 
    }

    async.waterfall([getMethodID, getMethodOrder], async () => {

        for (let index = 1; index <= method_order_id.repeticoes; index++) {

            let id_obj = [
                { nodeId: method_id.prefixo + identificador_opcua + method_id.identificador + index + '_' + method_id.chave},
            ];
    
            let order_obj = [
                { nodeId: method_order_id.prefixo + identificador_opcua + method_order_id.identificador + index + '_' + method_order_id.chave},
            ];

            let id_res = await session_.read(id_obj);
            let id = await id_res.map(result => result.value.value)[0];
            let order_res = await session_.read(order_obj);
            let order = await order_res.map(result => result.value.value)[0];
            if(order == data.ordem) { 
            
                Order_Planned.update({
                    data_inicio: data.data_inicio
                }, {
                    where: {
                        id: id
                    }
                }).then((res)=> {
                    return true
                }).catch((err) => {
                    return false
                })
                break; 
            } else {
                continue; 
            }
        }
      
    }) 
}

function endOrder(data, session_, identificador_opcua) {

    let getMethodID = async () => {
        method_id = await getMethod('ordem_atual', "ID"); 
    }

    let getMethodOrder = async () => {
        method_order_id = await getMethod('ordem_atual', "ordem"); 
    }

    async.waterfall([getMethodID, getMethodOrder], async () => {

        for (let index = 1; index <= method_order_id.repeticoes; index++) {

            let id_obj = [
                { nodeId: method_id.prefixo + identificador_opcua + method_id.identificador + index + '_' + method_id.chave},
            ];
    
            let order_obj = [
                { nodeId: method_order_id.prefixo + identificador_opcua + method_order_id.identificador + index + '_' + method_order_id.chave},
            ];

            let id_res = await session_.read(id_obj);
            let id = await id_res.map(result => result.value.value)[0];
            let order_res = await session_.read(order_obj);
            let order = await order_res.map(result => result.value.value)[0];
            if(order == data.ordem) {
            
                let getActualProductionOrder = async (callback) => {
                    method_order_production = await getMethod('ordem_atual', "quantidade_produzida"); 
                }

                async.waterfall([getActualProductionOrder], async () => {
            
                    let production_order_obj = [
                        { nodeId: method_order_production.prefixo + identificador_opcua + method_order_production.identificador + index + '_' + method_order_production.chave},
                    ];
            
                    let production_order_res = await session_.read(production_order_obj);
                    let production_order = await production_order_res.map(result => result.value.value)[0];

                    Order_Planned.update({
                        quantidade_produzida: parseFloat(production_order).toFixed(3),
                        data_fim: data.data_inicio
                    }, {
                        where: {
                            id: id
                        }
                    }).then((res)=> {
                        return true
                    }).catch((err) => {
                        return false
                    })
                })  
                break; 
            } else {
                continue; 
            }
        }
      
    }) 
}

function startGame(data, session_, identificador_opcua) {

    let getMethodID = async () => {
        method_id = await getMethod('ordem_atual', "ID"); 
    }

    let getMethodOrder = async () => {
        method_order_id = await getMethod('ordem_atual', "ordem"); 
    }

    let getMethoGameProduction = async () => {
        method_game_production = await getMethod('ordem_atual', "quantidade_jogo"); 
    }

    async.waterfall([getMethodID, getMethodOrder, getMethoGameProduction], async () => {
        for (let index = 1; index <= method_order_id.repeticoes; index++) {
            let id_obj = [
                { nodeId: method_id.prefixo + identificador_opcua + method_id.identificador + index + '_' + method_id.chave},
            ];

            let order_obj = [
                { nodeId: method_order_id.prefixo + identificador_opcua + method_order_id.identificador + index + '_' + method_order_id.chave},
            ];

            let game_production_obj = [
                { nodeId: method_game_production.prefixo + identificador_opcua + method_game_production.identificador + index + '_' + method_game_production.chave},
            ];
            
            let id_res = await session_.read(id_obj);
            let id = await id_res.map(result => result.value.value)[0];
            let order_res = await session_.read(order_obj);
            let order = await order_res.map(result => result.value.value)[0];
            let game_production_res = await session_.read(game_production_obj);
            let game_production = await game_production_res.map(result => result.value.value)[0];
            let num_jogo = null; 

            if(id != 0 && order != 0) {
                getGameNumber(order[0], data.cod_sap, (res)=>{
                    num_jogo = res; 
                    closeIfOpen(order[0], data.cod_sap, data.data_inicio, (res) => {
                        // ORDER DETAIL
                        Order_Planned.findAll({
                            where: {
                                id: id
                            }
                        }).then((res) => {
                            let getMethodEndHour = async (callback) => {
                                method_end_hour = await getMethod('ordem_atual', "hora_fim_jogo"); 
                            }

                            let getMethodEndDate = async (callback) => {
                                method_end_date = await getMethod('ordem_atual', "data_fim_jogo"); 
                            }

                            let getMethodVelocidade = async (callback) => {
                                method_velocity = await getMethod('ordem_atual', "velocidade_sap"); 
                            }

                            let getMethodVelocidade_SP = async (callback) => {
                                method_velocity_sp = await getMethod('ordem_atual', "sp_velocidade"); 
                            }

                            let getMethodTorcao = async (callback) => {
                                method_twist = await getMethod('ordem_atual', "torcao"); 
                            }

                            let getMethodNE = async (callback) => {
                                method_ne = await getMethod('ordem_atual', "ne_final"); 
                            }

                            async.waterfall([getMethodVelocidade, getMethodTorcao, getMethodNE, getMethodVelocidade_SP, getMethodEndHour, getMethodEndDate], async () => {
                                let method_velocity_obj = [
                                    { nodeId: method_velocity.prefixo + identificador_opcua + method_velocity.identificador + index + '_' + method_velocity.chave},
                                ];
                        
                                let method_twist_obj = [
                                    { nodeId: method_twist.prefixo + identificador_opcua + method_twist.identificador + index + '_' + method_twist.chave},
                                ];

                                let method_ne_obj = [
                                    { nodeId: method_ne.prefixo + identificador_opcua + method_ne.identificador + index + '_' + method_ne.chave},
                                ];

                                let method_velocity_sp_obj = [
                                    { nodeId: method_velocity_sp.prefixo + identificador_opcua + method_velocity_sp.identificador + index + '_' + method_velocity_sp.chave},
                                ];

                                let method_end_hour_obj = [
                                    { nodeId: method_end_hour.prefixo + identificador_opcua + method_end_hour.identificador + index + '_' + method_end_hour.chave},
                                ];

                                let method_end_date_obj = [
                                    { nodeId: method_end_date.prefixo + identificador_opcua + method_end_date.identificador + index + '_' + method_end_date.chave},
                                ];

                                let velocity_res = await session_.read(method_velocity_obj);
                                let velocity = await velocity_res.map(result => result.value.value)[0];
                                let twist_res = await session_.read(method_twist_obj);
                                let twist = await twist_res.map(result => result.value.value)[0];
                                let ne_res = await session_.read(method_ne_obj);
                                let ne = await ne_res.map(result => result.value.value)[0];
                                let velocity_sp_res = await session_.read(method_velocity_sp_obj);
                                let velocity_sp = await velocity_sp_res.map(result => result.value.value)[0];
                                let end_hour_res = await session_.read(method_end_hour_obj);
                                let end_hour = await end_hour_res.map(result => result.value.value)[0];
                                let end_date_res = await session_.read(method_end_date_obj);
                                let end_date= await end_date_res.map(result => result.value.value)[0];

                                let final_date = timestamptToDate(end_date, end_hour); 

                                let obj = {
                                    id_seccao: data.id_seccao,    
                                    cod_maquina_fabricante: data.cod_maquina_fabricante,
                                    cod_sap: data.cod_sap,
                                    ordem: order[0],
                                    quantidade_prevista: game_production, 
                                    quantidade_produzida: 0, 
                                    data_inicio: data.data_inicio, 
                                    fusos: res[0].fusos, 
                                    data_fim_prevista: final_date, 
                                    velocidade_setpoint : velocity_sp,
                                    num_jogo: num_jogo 
                                } 

                                Production.create(obj).then((res)=> {}).then((err) => {})
                            })
                        }).catch((err) => {})
                    })
                })
            } else {
                continue; 
            }
        }
    }) 
}

function endGame(data, session_, identificador_opcua) {

    console.log("end game");

    let getMethodID = async () => {
        method_id = await getMethod('ordem_atual', "ID"); 
    }

    let getMethodOrder = async () => {
        method_order_id = await getMethod('ordem_atual', "ordem"); 
    }

    async.waterfall([getMethodID, getMethodOrder], async () => {

        for (let index = 1; index <= method_order_id.repeticoes; index++) {

            let machine_info = null; 

            let id_obj = [
                { nodeId: method_id.prefixo + identificador_opcua + method_id.identificador + index + '_' + method_id.chave},
            ];

            let order_obj = [
                { nodeId: method_order_id.prefixo + identificador_opcua + method_order_id.identificador + index + '_' + method_order_id.chave},
            ];
    
            let id_res = await session_.read(id_obj);
            let id = await id_res.map(result => result.value.value)[0];
            let order_res = await session_.read(order_obj);
            let order = await order_res.map(result => result.value.value)[0];

            console.log(id, order[0]);

            if(id != 0 && order[0] != 0) {

                let getActualProduction = async () => {
                    method_production = await getMethod('ordem_atual', "var10"); 
                }
            
                let getActualProductionOrder = async () => {
                    method_order_production = await getMethod('ordem_atual', "quantidade_produzida"); 
                }

                let getMachineInfoByOPCUAID = (callback) => {
                    Machine.findAll({
                        where: {
                            identificador_opcua: id
                        }, 
                    }).then(res => {
                        if(res[0]) {
                            machine_info = res[0];
                            return callback(); 
                        } else {
                            return callback(); 
                        }
                    }).catch((err)=> {
                        if(err) {
                            return callback(); 
                        }
                    })
                }

                async.waterfall([getActualProduction, getActualProductionOrder, getMachineInfoByOPCUAID], async () => {
                    
                    let production_obj = [
                        { nodeId: method_production.prefixo + identificador_opcua + method_production.identificador + index + '_' + method_production.chave},
                    ];
            
                    let production_order_obj = [
                        { nodeId: method_order_production.prefixo + identificador_opcua + method_order_production.identificador + index + '_' + method_order_production.chave},
                    ];
            
                    let production_res = await session_.read(production_obj);
                    let production = await production_res.map(result => result.value.value)[0];
                    let production_order_res = await session_.read(production_order_obj);
                    let production_order = await production_order_res.map(result => result.value.value)[0];

                    console.log("EndGame");
                    console.log(order[0], machine_info.cod_maquina_fabricante);

                    Production.update({
                        quantidade_produzida: parseFloat(production).toFixed(3),
                        data_fim: data.data_inicio
                    }, {
                        where: {
                            [Op.and]: [
                                {
                                    id_seccao: machine_info.id_seccao,  
                                },
                                {
                                    cod_maquina_fabricante: machine_info.cod_maquina_fabricante, 
                                },
                                {
                                    ordem: order[0], 
                                }
                            ]
                        }
                    }).then((res) => {
                        Order_Planned.update({
                            quantidade_produzida: parseFloat(production_order).toFixed(3)
                        }, {
                            where: {
                                id: id
                            }
                        }).then((res)=> {
                            return true
                        }).catch((err) => {
                            return false
                        })
                    }).catch((err)=> {
                        return false
                    })
                })  
            }
        }
    }) 
}

exports.getMethod = getMethod; 
exports.connect = connect; 