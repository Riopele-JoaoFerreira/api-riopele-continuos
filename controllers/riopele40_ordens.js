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

exports.updateTable = (req, res) => {

    let machine_info = null;  
    let orders_planned = []; 
    let orders_info = null; 
    let error = null; 
    let nodes_to_write = []; 

    let getMachineInfo = (callback) => {
        Machine.findAll(
            {
                include: {
                    model: OPCUA_Server, 
                },
                where: {
                    id: req.body.id
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
                id_maquina: req.body.id
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
            console.log(err);
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

exports.updateRunningTable = (req, res) => {

    let machine_info = null;  
    let orders_planned = []; 
    let orders_info = null; 
    let error = null; 
    let nodes_to_write = []; 
    let server_name = null; 

    let getMachineInfo = (callback) => {
        Machine.findAll(
            {
                include: {
                    model: OPCUA_Server, 
                },
                where: {
                    id: req.body.id
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
                id_maquina: req.body.id
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
            console.log(error);
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
