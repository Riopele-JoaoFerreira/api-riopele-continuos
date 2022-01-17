const OPCUA = require('../utilities/opcua')

exports.lerEventos = (req, res) => {
    OPCUA.Ler_eventos((callback)=> {
        res.status(200).json(callback)
    })
} 
