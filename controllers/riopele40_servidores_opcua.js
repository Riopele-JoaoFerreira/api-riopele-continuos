const connection = require('../utilities/connection').connection
const Servidor_OPCUA = require('../models/riopele40_servidores_opcua')
const Maquina = require('../models/riopele40_maquinas')

exports.list = (req, res) => {
    Servidor_OPCUA.findAll({
        include: {
            model: Maquina
        }
    }).then((list)=> {
        res.status(200).json(list); 
    }).catch((error)=> {
        console.log(error);
        res.status(400).send("Error!");
    })
} 

exports.listRaw = (req, res) => {
    connection.query('SELECT * FROM riopele40_servidores_opcua').then((list)=> {
        res.status(200).json(list); 
    }).catch((error)=> {
        console.log(error);
        res.status(400).send("Error!");
    })
} 
