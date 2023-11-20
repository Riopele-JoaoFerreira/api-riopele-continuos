const Op = require('sequelize').Op
const async = require('async')
const utilities = require('../utilities/utilities')
const OPCUA_Client = require('node-opcua');
const Opcua = require('../utilities/opcua')
const OPCUA_Server = require('../models/riopele40_servidores_opcua')
const Machine = require('../models/riopele40_maquinas')
const Orders_Machine = require('../models/riopele40_ordem_maquinas')
const Orders_Planned = require('../models/riopele40_ordens_planeadas')
const Methods = require('../models/riopele40_opcua_metodos')

exports.updateTable = (req, res, id_maquina) => {

    let machine_info = null;  
    let orders_planned = []; 
    let orders_info = null; 
    let error = null; 
    let nodes_to_write = []; 

    let id = null;
    if(id_maquina) {
        id = id_maquina
    } else {
        id = req.body.id
    }

    let getMachineInfo = (callback) => {
        Machine.findAll(
            {
                include: {
                    model: OPCUA_Server, 
                },
                where: {
                    id: id
                }
            }
        ).then((res)=> {
            machine_info = res; 
            return callback(); 
        }).catch((err) => {

            error = err; 
            return callback(); 
        })
    }

    let getOrdersInMachine = (callback) => {
        Orders_Machine.findAll({
            where: {
                id_maquina: id
            },
        }).then(res => {
            let array = []; 
            res.forEach(order_planned => {
                array.push(order_planned.id)
            })
            orders_planned = array; 
            return callback(); 
        }).catch((err) => {
            error =  err; 
            return callback(); 
        })
    }

    let getOrdersInfo = (callback) => {
        Orders_Planned.findAll({
            where: {
                [Op.and]: {
                    id_ordem_maquina: {
                        [Op.in]: orders_planned
                    },
                    data_fim: {
                        [Op.eq]: null
                    }
                }
            }, 
            order: [['ordenacao']],
            include: {
                model: Orders_Machine
            }
        }).then(res => {   
            orders_info = res; 
            return callback(); 
        }).catch((err) => {
            error = err; 
            return callback(); 
        })
    }

    let getMethods = (callback) => {
        Methods.findAll({
            where: {
                grupo: 'ordens'
            }
        }).then(res => {
            let loops = res[0].repeticoes
            let array = []; 
            for (let i = 1; i <= loops; i++) {
                res.forEach(method => {
                    value = 0;
                    try {
                        if(method.map == 'ordem') {
                            if(orders_info[i-1].riopele40_ordem_maquina.ordem) {
                                value = orders_info[i-1].riopele40_ordem_maquina.ordem
                            } else {
                                value = method.default; 
                            }
                        } else if(method.map == 'quantidade_produzida') {
                            if(orders_info[i-1][method.map]) {
                                value = orders_info[i-1][method.map]
                                if(!(value >= 0)) {
                                    value = 0
                                }
                            } else {
                                value = method.default; 
                            }
                        } else if(method.map == 'velocidade') {
                            console.log("velocidade");
                            if(orders_info[i-1][method.map]) {

                                let new_value = machine_info[0].fator_velocidade * orders_info[i-1][method.map]; 
                                if(new_value > machine_info[0].velocidade_minima) {
                                    new_value = machine_info[0].velocidade_minima; 
                                }

                                console.log(new_value);

                                value = orders_info[i-1][method.map]
                            } else {
                                value = method.default; 
                            }
                        } else {
                            if(orders_info[i-1][method.map]) {
                                value = orders_info[i-1][method.map]
                            } else {
                                value = method.default; 
                            }
                        }
                    } catch (err) {
                        value = method.default; 
                    }

                    let node_ID = method.prefixo + machine_info[0].identificador_opcua+method.identificador+i+"_"+method.chave; 
                    let obj =  {
                        nodeId: node_ID,
                        attributeId: OPCUA_Client.AttributeIds.Value,
                        value: {
                            value: {
                                dataType: utilities.getType(method.tipo).dataType,
                                value: utilities.convert(method.tipo, value)
                            }
                        }
                    } 
                    array.push(obj)
                })
            }
            nodes_to_write = array
            return callback(); 
        }).catch((err) => {
            error = err; 
            return callback();
        })
    }

    async.waterfall([getMachineInfo, getOrdersInMachine, getOrdersInfo, getMethods], () => {
        let server_name = machine_info[0].riopele40_servidores_opcua.url; 
        if(error) {
            res.status(400).send('Error'); 
        } else {
            Opcua.setTableOrders(nodes_to_write, server_name, (error) => {
                if(!error) {
                    if(res) {
                         res.status(200).send("Success"); 
                    }
                } else {
                    if(res) {
                        res.status(400).send("Error");
                    }
                }
            })
        }
    })
} 

exports.updateRunningTable = (req, res, id_maquina) => {

    let machine_info = null;  
    let orders_planned = []; 
    let orders_info = null; 
    let error = null; 
    let nodes_to_write = []; 
    let server_name = null; 

    let id = null;
    if(id_maquina) {
        id = id_maquina
    } else {
        id = req.body.id
    }

    let getMachineInfo = (callback) => {
        Machine.findAll(
            {
                include: {
                    model: OPCUA_Server, 
                },
                where: {
                    id: id
                }
            }
        ).then((res)=> {
            machine_info = res; 
            server_name = machine_info[0].riopele40_servidores_opcua.url; 
            return callback(); 
        }).catch((err) => {
            error = err; 
            return callback(); 
        })
    }

    let getOrdersInMachine = (callback) => {
        Orders_Machine.findAll({
            where: {
                id_maquina: id
            },
        }).then(res => {
            let array = []; 
            res.forEach(order_planned => {
                array.push(order_planned.id)
            })
            orders_planned = array; 
            return callback(); 
        }).catch((err) => {
            error =  err; 
            return callback(); 
        })
    }

    let getOrdersInfo = (callback) => {
        Orders_Planned.findAll({
            where: {
                id_ordem_maquina: {
                    [Op.in]: orders_planned
                }, 
                estado: {
                    [Op.or]:[1,2]  
                }
            }, 
            order: [['ordenacao']],
            include: {
                model: Orders_Machine
            }
        }).then(res => {   
            orders_info = res; 
            return callback(); 
        }).catch((err) => {
            error = err; 
            return callback(); 
        })
    }

    let getMethods = (callback) => {
        Methods.findAll({
            where: {
                grupo: 'ordem_atual'
            }
        }).then(async res => {
            let loops = res[0].repeticoes
            let array = []; 
            for (let i = 1; i <= loops; i++) {
                method_order = await Opcua.getMethod('ordem_atual', "ordem"); 
                let method_obj = [
                    { nodeId: method_order.prefixo + machine_info[0].identificador_opcua + method_order.identificador + i + '_' + method_order.chave},
                ];
                let method_res = await Opcua.readNode(method_obj, server_name);
                let order_running = await method_res.map(result => result.value.value)[0];
                
                if(order_running[0] != '') {
                    orders_info.forEach(order_planned => {
                        if(order_running[0] == order_planned.riopele40_ordem_maquina.ordem) {
                            res.forEach(method => {
                                value = 0;
                                try {
                                    if(method.map == 'ordem') {
                                        if(order_planned.riopele40_ordem_maquina.ordem) {
                                            value = order_planned.riopele40_ordem_maquina.ordem
                                        } else {
                                            value = method.default; 
                                        }
                                    } else {
                                        if(order_planned[method.map]) {
                                            value = order_planned[method.map]
                                        } else {
                                            value = method.default; 
                                        }
                                    }
                                } catch (err) {
                                    value = method.default; 
                                }
            
                                let node_ID = method.prefixo + machine_info[0].identificador_opcua+method.identificador+i+"_"+method.chave; 
                                let obj =  {
                                    nodeId: node_ID,
                                    attributeId: OPCUA_Client.AttributeIds.Value,
                                    value: {
                                        value: {
                                            dataType: utilities.getType(method.tipo).dataType,
                                            value: utilities.convert(method.tipo, value)
                                        }
                                    }
                                }
                                array.push(obj)
                            })
                        }
                    })
                }
                    
            }
            nodes_to_write = array
            return callback(); 
        }).catch((err) => {
            error = err; 
            return callback();
        })
    }

    async.waterfall([getMachineInfo, getOrdersInMachine, getOrdersInfo, getMethods], () => {
        
        if(error) {
            res.status(400).send('Error'); 
        } else {
            Opcua.setTableOrders(nodes_to_write, server_name, (error) => {
                if(!error) {
                    if(res) {
                         res.status(200).send("Success"); 
                    }
                } else {
                    if(res) {
                        res.status(400).send("Error");
                    }
                }
            })
        }
    })
} 

exports.getOrderInfo = (req, res) => {

    let machine_info = null;  
    let error = null; 
    let server_name = null; 
    let array = []; 

    let getMachineInfo = (callback) => {
        Machine.findAll(
            {
                include: {
                    model: OPCUA_Server, 
                },
                where: {
                    cod_maquina_fabricante: req.params.id
                }
            }
        ).then((res)=> {
            machine_info = res; 
            server_name = machine_info[0].riopele40_servidores_opcua.url; 
            return callback(); 
        }).catch((err) => {
            error = err; 
            return callback(); 
        })
    }

    let getMethods = (callback) => {
        Methods.findAll({
            where: {
                grupo: 'ordem_atual'
            }
        }).then(async res => {
            let loops = res[0].repeticoes
            for (let i = 1; i <= loops; i++) {
               
                method_order = await Opcua.getMethod('ordem_atual', "ordem");         
                let method_order_obj = [
                    { nodeId: method_order.prefixo + machine_info[0].identificador_opcua + method_order.identificador + i + '_' + method_order.chave},
                ];

                method_article = await Opcua.getMethod('ordem_atual', "artigo");   
                let method_article_obj = [
                    { nodeId: method_article.prefixo + machine_info[0].identificador_opcua + method_article.identificador + i + '_' + method_article.chave},
                ];

                method_batch = await Opcua.getMethod('ordem_atual', "lote");   
                let method_batch_obj = [
                    { nodeId: method_batch.prefixo + machine_info[0].identificador_opcua + method_batch.identificador + i + '_' + method_batch.chave},
                ];

                method_ne = await Opcua.getMethod('ordem_atual', "ne_final");   
                let method_ne_obj = [
                    { nodeId: method_ne.prefixo + machine_info[0].identificador_opcua + method_ne.identificador + i + '_' + method_ne.chave},
                ];

                method_twist = await Opcua.getMethod('ordem_atual', "torcao");   
                let method_twist_obj = [
                    { nodeId: method_twist.prefixo + machine_info[0].identificador_opcua + method_twist.identificador + i + '_' + method_twist.chave},
                ];

                method_game_production = await Opcua.getMethod('ordem_atual', "var10");   
                let method_game_production_obj = [
                    { nodeId: method_game_production.prefixo + machine_info[0].identificador_opcua + method_game_production.identificador + i + '_' + method_game_production.chave},
                ];

                method_game_production_estimated = await Opcua.getMethod('ordem_atual', "quantidade_jogo");   
                let method_game_production_estimated_obj = [
                    { nodeId: method_game_production_estimated.prefixo + machine_info[0].identificador_opcua + method_game_production_estimated.identificador + i + '_' + method_game_production_estimated.chave},
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
                
            }
            return callback(); 
        }).catch((err) => {
            error = err; 
            return callback();
        })
    }

    async.waterfall([getMachineInfo, getMethods], () => {
        if(error) {
            res.status(400).send('Error'); 
        } else {
            res.status(200).json(array); 
        }
    })
} 
