const async = require('async')
const Opcua = require('../utilities/opcua')
const OPCUA_Server = require('../models/riopele40_servidores_opcua')
const Machine_Group = require('../models/riopele40_grupos_maquinas')
const Machine = require('../models/riopele40_maquinas')
const Methods = require('../models/riopele40_opcua_metodos')
const Op = require('sequelize').Op; 

exports.getAllStatus = (req, res) => {

    let machine_info = null;  
    let error = null; 
    let nodes_to_read = []; 

    let where = {
        id_seccao: req.params.section
    }

    if(req.params.id) {
        where = {
            [Op.and]: {
                id_seccao: req.params.section, 
                id: req.params.id
            }
        }
    }

    let getMachineInfo = (callback) => {
        Machine.findAll(
            {
                include: [
                    OPCUA_Server, 
                    Machine_Group
                ],
                where: where, 
                order: [['cod_sap', 'asc']]
            }
        ).then((res)=> {
            machine_info = res; 
            return callback(); 
        }).catch((err) => {
            error = err; 
            return callback(); 
        })
    }

    let getMethods = (callback) => {
        Methods.findAll({
            where: {
                [Op.and]: {
                    grupo: 'variaveis', 
                    chave: 'Estado'
                }
            }
        }).then(res => {
            let array = []; 
            res.forEach(method => {  
                machine_info.forEach(machine => {
                    let obj = [{server_name: machine.riopele40_servidores_opcua.url},{ nodeId: method.prefixo + machine.identificador_opcua + method.identificador}, {machine: machine}, {section: req.params.section}, {identificador_opcua: machine.identificador_opcua}];
                    array.push(obj)
                })
            })
            nodes_to_read = array
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
            Opcua.getMachineStatus(nodes_to_read, (result, error) => {
                if(!error) {
                    if(res) {

                        const sortObject = obj => Object.keys(obj).sort().reduce((res, key) => (res[key] = obj[key], res), {});

                        keys = Object.keys(result);
                        result = sortObject(result);

                        let i = keys.length; 
                        let len = keys.length; 

                        for (i = 0; i < len; i++) {
                            let k = keys[i]; 
                            result[k].sort((a,b) => (a.cod_sap > b.cod_sap) ? 1 : ((b.cod_sap > a.cod_sap) ? -1 : 0))
                        }

                        res.status(200).json(result); 
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
