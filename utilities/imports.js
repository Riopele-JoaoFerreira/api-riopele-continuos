exports.importModels = (callback) => {
    const Servidor_OPCUA = require("../models/riopele40_servidores_opcua"); 
    const Metodo_OPCUA = require("../models/riopele40_opcua_metodos"); 
    const Maquina = require("../models/riopele40_maquinas"); 
    return callback();     
}

