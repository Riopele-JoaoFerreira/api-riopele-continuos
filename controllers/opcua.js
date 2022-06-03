const OPCUA = require('../utilities/opcua')

// SET TABLE ON "ORDENS PLANEADAS" MENU
exports.setTableOrders = (req, res) => {
    OPCUA.setTableOrders((callback)=> {
        res.status(200).json(callback)
    })
}












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



exports.set_ordem = (req, res) => {
    OPCUA.Set_Ordem((callback)=> {
        res.status(200).json(callback)
    })
}

exports.data_hora = (req, res) => {
    OPCUA.Data_Hora((callback)=> {
        res.status(200).json(callback)
    })
}

exports.cycle2= (req, res) => {
    OPCUA.Cycle_eventos2((callback)=> {
        res.status(200).json(callback)
    })
}
