const moment= require('moment');
const OPCUA_Client = require('node-opcua');
const async = require('async');
const config = require('../config/config')
const Op = require('sequelize').Op; 
const options = require('../config/opcua').config
const endpoint_Url = require('../config/opcua').url
const client = OPCUA_Client.OPCUAClient.create(options);
const events = require('../models/riopele40_eventos')
let session = null;

async function connect() {
    try {
        await client.connect(endpoint_Url);
        session = await client.createSession();
    } catch(err) {
    console.log("An error has occured : ",err);
    }
}

async function disconnect() {
    await client.disconnect();
}

// SET TABLE ON "ORDENS PLANEADAS" MENU
exports.setTableOrders = function (table, callback) {
    connect().then(() => {
        let error = null; 
        let stack = [];
        table.forEach(node => {
            stack.push((callback) => {
                session.write(node, function(err,status_code,diagnostic_info) {
                    if (err) {
                        error = err;  
                    }
                    return callback();
                });
            })
        })
        async.waterfall(stack, () => {
            disconnect();
            return callback(error);
        })
    });
}

// EXPORT NEW EVENTS FROM OPCUA
exports.exportEvents = function (callback) {
    connect().then(async () => {
        let event_info = null; 
        while (await (event_info = await getEvent()).event_code > 0){
            let nodeToWrite = [
                {
                    nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Novo",
                    attributeId: OPCUA_Client.AttributeIds.Value,
                    value: {    
                        value: { 
                            dataType: OPCUA_Client.DataType.Int16,
                            value: 0
                        }
                    }
                }        
            ];

            let obj = {
                id_seccao: config.config.seccao_fiacao_b,
                cod_sap: 'PCON2101',
                cod_evento: event_info.event_code,                
                cod_maquina_fabricante: 113,
                data_inicio: event_info.timestamp, 
                cod_estado: event_info.state_code,
                ordem: event_info.order,
            }

            console.log(obj);
            session.write(nodeToWrite, function(err,status_code,diagnostic_info) {
                if (!err) {
                    events.update({
                        data_fim: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            [Op.and]: {
                                cod_maquina_fabricante: 113,
                                data_fim: {
                                    [Op.eq]: null
                                } 
                            }
                        }
                    }).then((res) => {
                        events.create(obj).then((res) => {}).catch((err) => {})
                    }).catch((err) => {}) 
                }
            }); 
        }
        disconnect();
        return callback(); 
    });
}

async function getEvent() {
    
    var event_obj = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Codigo"},
    ];
    
    var state_obj = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Estado"},
    ];
    
    var order_obj = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual1_ordem"},
    ];  
    
    var date_obj = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Data"},
    ];
    
    var hour_obj = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Hora"},
    ];

    // DATE
    let res = await session.read(date_obj);
    let event_date = await res.map(result => result.value.value)[0];
    let date = new Date('1990-01-01');
    let actual_date = date.addDays(event_date);
    let sql_date = actual_date.toLocaleDateString("pt-PT");

    // HOUR
    res = await session.read(hour_obj);
    let event_hour = await res.map(result => result.value.value)[0];
    let hours = event_hour/3600000
    let decimal_Time_String = hours;
    let decimal_Time = parseFloat(decimal_Time_String);
    decimal_Time = decimal_Time * 60 * 60;
    hours = Math.floor((decimal_Time / (60 * 60)));
    decimal_Time = decimal_Time - (hours * 60 * 60);
    let minutes = Math.floor((decimal_Time / 60));
    decimal_Time = decimal_Time - (minutes * 60);
    let seconds = Math.round(decimal_Time);

    if(hours < 10)
    {
        hours = "0" + hours;
    }
    if(minutes < 10)
    {
        minutes = "0" + minutes;
    }
    if(seconds < 10)
    {
        seconds = "0" + seconds;
    }

    let actual_hour = "" + hours + ":" + minutes + ":" + seconds;
    var timestamp = sql_date + ' ' + actual_hour;

    res = await session.read(event_obj);
    let event_code = await res.map(result => result.value.value)[0];

    res = await session.read(state_obj);
    let state_code = await res.map(result => result.value.value)[0];

    res = await session.read(order_obj);
    let order = await res.map(result => result.value.value)[0];

    let obj = {
        timestamp: timestamp, 
        event_code: event_code, 
        state_code: state_code, 
        order: order[0]
    };

    return obj
}