const connection = require('../utilities/connection').connection
const Servidor_OPCUA = require('../models/riopele40_servidores_opcua')
const Maquina = require('../models/riopele40_maquinas')
const OPCUA = require('../utilities/opcua')

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

exports.readOPCUA = (req, res) => {
    OPCUA.readOPCUA('server', [], (result) => {
        res.status(200).send(result)
    })
} 

exports.writeOPCUA = (req, res) => {
    OPCUA.writeOPCUA('server', [], (result) => {
        res.status(200).send(result)
    })
} 

exports.CycleOPCUA = (req, res) => {
    OPCUA.CycleOPCUA('server', [], (result) => {
        res.status(200).send(result)
    })
} 
