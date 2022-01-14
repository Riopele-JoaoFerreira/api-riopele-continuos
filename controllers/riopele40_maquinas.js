const Servidor_OPCUA = require('../models/riopele40_servidores_opcua')
const Maquina = require('../models/riopele40_maquinas')
const Op = require('sequelize').Op

exports.list = (req, res) => {
    Maquina.findAll(
        {
            include: {
                model: Servidor_OPCUA, 
                where: {
                    id: {
                        [Op.ne]: null 
                    }
                }
            }
        }
    ).then((list)=> {
        res.status(200).json(list); 
    }).catch((error)=> {
        res.status(400).send("Error!");
    })
} 
