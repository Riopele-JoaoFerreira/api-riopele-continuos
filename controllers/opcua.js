const OPCUA = require('../utilities/opcua')

exports.ler_Eventos = (req, res) => {
    OPCUA.Ler_eventos((callback)=> {
        res.status(200).json(callback)
    })
} 

exports.set_eventos = (req, res) => {
    OPCUA.Set_eventos((callback)=> {
        res.status(200).json(callback)
    })
} 

exports.cycle_eventos = (req, res) => {
    OPCUA.Cycle_eventos((callback)=> {
        res.status(200).json(callback)
    })
} 