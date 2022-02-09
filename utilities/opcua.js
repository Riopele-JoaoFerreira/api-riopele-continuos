const OPCUAClient = require('node-opcua');
const Metodo_OPCUA = require('../controllers/riopele40_opcua_metodos');
const async = require('async');
const eventos_model = require('../models/riopele40_eventos')
const config = require('../config/config')
const moment= require('moment')
const Op = require('sequelize').Op; 

const options = {
    applicationName: "MyClient",
    connectionStrategy: {
        initialDelay: 1000,
        maxRetry: 1
    },
    securityMode: OPCUAClient.MessageSecurityMode.None,
    securityPolicy: OPCUAClient.SecurityPolicy.None,
    //endpoint_must_exist: false,
    endpointMustExist: false,
};

const client = OPCUAClient.OPCUAClient.create(options);
let session = null;
const endpointUrl = "opc.tcp://SRVRIOT03:48012";

async function disconnect(client) {
    await client.disconnect();
    console.log("disconnected!");
}

async function connect() {
    try {
        await client.connect(endpointUrl);
        console.log("connected!");
        session = await client.createSession();
        console.log("session created!");
    } catch(err) {
    console.log("An error has occured : ",err);
    }
}

// READ EVENTOS (DONE)
function ReadEvento(callback) {
    let stack = [];
    let node_ID = '';
    let node_ID_obj = null;
    valores_obtidos = [];

    Metodo_OPCUA.getMetodos((resultado) => {

        resultado.forEach(metodo => {
            stack.push((callback) => {
                node_ID = metodo.prefixo + "ContinuosOlifil.113-101" + metodo.identificador;

                node_ID_obj =  {
                    nodeId: node_ID
                };

                session.read(node_ID_obj).then((dataValue) => {
                    data_obj = {
                        nodeId: node_ID_obj.nodeId,
                        value: dataValue.value.value,
                        tipo: metodo.tipo
                    }
                    valores_obtidos.push(data_obj)
                    return callback();
                }).catch((error) => {
                    return callback();
                })
            })
        })
        async.waterfall(stack, () => {
            return callback();
        })
    })
}

exports.Ler_eventos = function (callback) {
    connect().then(() => {
        ReadEvento((res) => {
              return callback (valores_obtidos)
        })
    });
}


// SET EVENTOS (Done em massa, falta através de SQL)
function SetEvento(callback) {
    let node_ID=''
    var array_int16=[]
    var array_int32=[]
    var array_uint16=[]
    var array_uint32=[]
    var array_string=[]
    var array_real32=[]

    Metodo_OPCUA.setMetodos((evento) => {
        evento.forEach(metodo => {
            //console.log(metodo.tipo)
            node_ID = metodo.prefixo + "ContinuosOlifil.113-101" + metodo.identificador
            //console.log(node_ID)
            var val = {};
            if (metodo.tipo == 'int16'){
                //console.log('ok2')
                array_int16.push(node_ID)
            }
           
            else if (metodo.tipo == 'int32'){
                array_int32.push(node_ID)
            }
            else if (metodo.tipo == 'uint32'){
                array_uint32.push(node_ID)
            }
            else if (metodo.tipo == 'uint16'){
                array_uint16.push(node_ID)
            }
            else if (metodo.tipo =='real32'){
                array_real32.push(node_ID)
            }
            else if (metodo.tipo == 'string'){
                array_string.push(node_ID)
            }
            console.log(array_int16)

            // switch (metodo.tipo) {
            //     case 'int16':
            //         val = {
            //             dataType: OPCUAClient.DataType.Int16,
            //             value: 16 /** VERIFICAR - colocar valores em arrays e indexar cada posição com o seu próprio valor **/
            //         }
            //     break;
            //     case 'int32':
            //         val = {
            //             dataType: OPCUAClient.DataType.Int32,
            //             value: 8
            //         }
            //     break;
            //     case 'string':
            //         val = {
            //             dataType: OPCUAClient.DataType.String,
            //             value: "16"
            //         }
            //     break;
            //     case 'uint16':
            //         val = {
            //             dataType: OPCUAClient.DataType.UInt16,
            //             value: 16
            //         }
            //     break;
            //     case 'uint32':
            //         val = {
            //             dataType: OPCUAClient.DataType.UInt32,
            //             value: 16
            //         }
            //     break;
            //     case 'real32':
            //         val = {
            //             dataType: OPCUAClient.DataType.Float,
            //             value: 16
            //         }
            //     break;
            // }
            // var nodeToWrite = [
            //     {
            //         nodeId: node_ID,
            //         attributeId: OPCUAClient.AttributeIds.Value,
            //         value: {
            //             value: val
            //         }
            //     }
            // ];
            // session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
            //     if (!err) {
            //         //console.log(" write ok" );
            //     } else{
            //         console.log("ERRO: ", erro);
            //     }
            // });
            // return callback()           
        }
        

    )})
        console.log(array_int16)
        console.log(array_int32)
        console.log(array_uint16)
        console.log(array_uint32)
        console.log(array_string)
        console.log(array_real32)
}

exports.Set_eventos = function (evento) {
    connect().then(() => {
        SetEvento((res) => {
            return callback ()
        })
    });
}

// CYCLE NOVO EVENTO (DONE)
async function CycleEvento(callback) {
    var evento = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Codigo"},
    ];
    var estado = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Estado"},
    ];
    var ordem = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual1_ordem"},
    ];  
    let dados_evento = await session.read(evento);
    let dados_estado = await session.read(estado);
    let dados_ordem = await session.read(ordem);
    let codigo_evento = await dados_evento.map(result => result.value.value)[0];
    let cod_estado = await dados_estado.map(result => result.value.value)[0];
    let ordem_atual = await dados_ordem.map(result => result.value.value)[0];

    if(codigo_evento>0){
        while (codigo_evento>0){
            var nodeToWrite = [
                {
                    nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Novo",
                    attributeId: OPCUAClient.AttributeIds.Value,
                    value: {    
                        value: { 
                            dataType: OPCUAClient.DataType.Int16,
                            value: 0
                        }
                    }
                }        
            ];
            let BD_object= {
                id_seccao: config.config.seccao_fiacao_b,
                cod_sap: 'PCON2101',
                cod_evento: codigo_evento,                
                cod_maquina_fabricante: 113,
                data_inicio: moment().format('YYYY-MM-DD HH:mm:ss'), 
                cod_estado: cod_estado,
                ordem: ordem_atual[0]
            }
            session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                if (!err) {
                    console.log(" write ok" );

                    eventos_model.update({
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
                        eventos_model.create(BD_object).then((res) => {
                            console.log('Evento Guardado')
                        }).catch((err) => {
                            console.log('Erro:', err);
                        })
                    }).catch((err) => {
                        console.log('Erro:', err);
                    }) 
                } else{
                    return erro;
                }
            }); 
            dados_evento = await session.read(evento);
            codigo_evento = await dados_evento.map(result => result.value.value);
            codigo_evento = await dados_evento.map(result => result.value.value)[0];
            cod_estado = await dados_estado.map(result => result.value.value)[0];
            dados_ordem = await session.read(ordem);
            ordem_atual = await dados_ordem.map(result => result.value.value)[0];
        }
        return callback()
    }
    else {
        return callback()
    }
     
}

exports.Cycle_eventos = function (callback) {
    connect().then(() => {
        CycleEvento((res) => {
            disconnect(client); 
            return callback()
        })
    });
}