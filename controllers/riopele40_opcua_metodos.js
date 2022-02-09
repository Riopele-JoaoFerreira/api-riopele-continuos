const connection = require('../utilities/connection')
const Metodo_OPCUA = require('../models/riopele40_opcua_metodos')

exports.getMetodos = function (callback) {
    console.log("ok")
    Metodo_OPCUA.findAll().then((list)=> {
        return callback(list)
    }).catch((error)=> {
        return callback(null)
    })
} 

exports.setMetodos = function (callback) {
    console.log("ok")
    Metodo_OPCUA.findAll().then((list)=> {
        return callback(list)
    }).catch((error)=> {
        return callback(null)
    })
} 

exports.CycleMetodos = function (callback) {
    console.log("ok")
    Metodo_OPCUA.findAll().then((list)=> {
        return callback(list)
    }).catch((error)=> {
        return callback(null)
    })
} 

exports.getDataTypes = function (callback) {
    connection.connection.query("SELECT DISTINCT tipo FROM riopele40_opcua_metodos").then((list)=> {
        return callback(list[0])
    }).catch((error)=> {
        return callback(null)
    })
} 
