const Servidor_OPCUA = require('../models/riopele40_servidores_opcua')
const Maquina = require('../models/riopele40_maquinas')
const OrdensMaquina = require('../models/riopele40_ordem_maquinas')
const OrdemPlaneada = require('../models/riopele40_ordens_planeadas')

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
            include: [
                {
                    model: OrdemPlaneada,
                    order: [['ordenacao', 'ASC']],
                }
            ] 
        }).then(ordens_maquina => {
            res.status(200).json(ordens_maquina); 
        }).catch((error => {
            console.log(error)
            res.status(400).send("Error!");
        }))
    }).catch((error)=> {
        res.status(400).send("Error!");
    })
} 
