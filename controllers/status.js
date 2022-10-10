const async = require('async')
const Opcua = require('../utilities/opcua')
const OPCUA_Server = require('../models/riopele40_servidores_opcua')
const Machine_Group = require('../models/riopele40_grupos_maquinas')
const Machine = require('../models/riopele40_maquinas')
const Methods = require('../models/riopele40_opcua_metodos')

exports.getAllStatus = (req, res) => {

    let machine_info = null;  
    let error = null; 
    let nodes_to_read = []; 

    let where = {
        id_seccao: req.params.section
    }

    if(req.params.id) {
        where = {
            id_seccao: req.params.section, 
            id: req.params.id
        }
    }

    let getMachineInfo = (callback) => {
        Machine.findAll(
            {
                include: [
                    OPCUA_Server, 
                    Machine_Group
                ],
                where: where
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
                grupo: 'variaveis', 
                chave: 'Estado'
            }
        }).then(res => {
            let array = []; 
            res.forEach(method => {

                machine_info.forEach(machine => {
                    let obj = [{server_name: machine.riopele40_servidores_opcua.url},{ nodeId: method.prefixo + machine.identificador_opcua + method.identificador}, {machine: machine}, {section: req.params.section}];
                    array.push(obj)
                })
            })
            nodes_to_read = array
            return callback(); 
        }).catch((err) => {
            console.log(err);
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