const connection = require('../utilities/connection').connection
const Servidor_OPCUA = require('../models/riopele40_servidores_opcua')
const Maquina = require('../models/riopele40_maquinas')

exports.list = (req, res) => {
    Maquina.findAll(
        {
            include: {
                model: Servidor_OPCUA, 
            }
        }
    ).then((list)=> {
        res.status(200).json(list); 
    }).catch((error)=> {
        console.log(error);
        res.status(400).send("Error!");
    })
} 
