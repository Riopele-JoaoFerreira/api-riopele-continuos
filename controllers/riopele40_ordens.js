const Servidor_OPCUA = require('../models/riopele40_servidores_opcua')
const Maquina = require('../models/riopele40_maquinas')
const OrdensMaquina = require('../models/riopele40_ordem_maquinas')
const OrdemPlaneada = require('../models/riopele40_ordens_planeadas')
const MetodoOpcua = require('../models/riopele40_opcua_metodos')
const Op = require('sequelize').Op
const utilities = require('../utilities/utilities')
const OPCUAClient = require('node-opcua');
const Opcua = require('../utilities/opcua')

exports.updateTable = (req, res) => {
    Maquina.findAll(
        {
            include: {
                model: Servidor_OPCUA, 
            },
            where: {
                id: req.body.id
            }
        }
    ).then((info_maquina)=> {
        OrdensMaquina.findAll({
            where: {
                id_maquina: req.body.id
            },
        }).then(ordens_maquina => {
            let ids = []; 
            ordens_maquina.forEach(ordem_maquina => {
                ids.push(ordem_maquina.id)
            })
            OrdemPlaneada.findAll({
                where: {
                    id_ordem_maquina: {
                        [Op.in]: ids
                    }
                }, 
                order: [['ordenacao']],
                include: {
                    model: OrdensMaquina
                }
            }).then(ordens_planeadas => {
                MetodoOpcua.findAll({
                    where: {
                        grupo: 'ordens'
                    }
                }).then(metodos_opcua => {
                    let repeticoes = metodos_opcua[0].repeticoes
                    let nodes_to_write = []; 
                    for (let i = 1; i <= repeticoes; i++) {
                        metodos_opcua.forEach(metodo => {
                            value = 0;
                            try {
                                // EXCEPÇÃO NECESSÁRIA
                                if(metodo.map == 'ordem') {
                                    if(ordens_planeadas[i-1].riopele40_ordem_maquina.ordem) {
                                        value = ordens_planeadas[i-1].riopele40_ordem_maquina.ordem
                                    } else {
                                        value = metodo.default; 
                                    }
                                } else {
                                    if(ordens_planeadas[i-1][metodo.map]) {
                                        value = ordens_planeadas[i-1][metodo.map]
                                    } else {
                                        value = metodo.default; 
                                    }
                                }
                            } catch (error) {}

                            let node_ID = metodo.prefixo + info_maquina[0].identificador_opcua+metodo.identificador+i+"_"+metodo.chave; 
                            let obj_data =  {
                                nodeId: node_ID,
                                attributeId: OPCUAClient.AttributeIds.Value,
                                value: {
                                    value: {
                                        dataType: utilities.getTipo(metodo.tipo).dataType,
                                        value: utilities.converter(metodo.tipo, value)
                                    }
                                }
                            }
                            nodes_to_write.push(obj_data)
                        })
                    }
                    //res.status(200).json(nodes_to_write); 
                    Opcua.Set_TableOrdem(nodes_to_write, (erro) => {
                        if(!erro) {
                            res.status(200).json("Tabela Atualizada!"); 
                        } else {
                            res.status(400).send("Error!");
                        }
                    })
                }).catch(error => {
                    res.status(400).send("Error!");
                })
            }).catch(error => {
                res.status(400).send("Error!");
            })
        }).catch(error => {
            res.status(400).send("Error!");
        })
    }).catch(error=> {
        res.status(400).send("Error!");
    })
} 
