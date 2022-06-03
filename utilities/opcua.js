const OPCUAClient = require('node-opcua');
const Metodo_OPCUA = require('../controllers/riopele40_opcua_metodos');
const async = require('async');
const eventos_model = require('../models/riopele40_eventos')
const config = require('../config/config')
const moment= require('moment');
const { data_hora } = require('../controllers/opcua');
const Op = require('sequelize').Op; 
const options = require('../config/opcua').config
const endpointUrl = require('../config/opcua').url
const client = OPCUAClient.OPCUAClient.create(options);
let session = null;

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


// SET TABLE ON "ORDENS PLANEADAS" MENU
exports.setTableOrders = function (table, callback) {
    connect().then(() => {
        let error = null; 
        let stack = [];
        table.forEach(node => {
            stack.push((callback) => {
                session.write(node, function(err,statusCode,diagnosticInfo) {
                    console.log(err);
                    if (err) {
                        error = err;  
                    }
                    return callback();
                });
            })
        })
        async.waterfall(stack, () => {
            console.log(error);
            return callback(error);
        })
    });
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
    Metodo_OPCUA.setMetodos((evento) => {
        evento.forEach(metodo => {
            node_ID = metodo.prefixo + "ContinuosOlifil.113-101" + metodo.identificador
            var val = {};
            switch (metodo.tipo) {
                case 'int16':
                    val = {
                        dataType: OPCUAClient.DataType.Int16,
                        value: 16 /** VERIFICAR - colocar valores em arrays e indexar cada posição com o seu próprio valor **/
                    }
                break;
                case 'int32':
                    val = {
                        dataType: OPCUAClient.DataType.Int32,
                        value: 32
                    }
                break;
                case 'string':
                    val = {
                        dataType: OPCUAClient.DataType.String,
                        value: "string"
                    }
                break;
                case 'uint16':
                    val = {
                        dataType: OPCUAClient.DataType.UInt16,
                        value: 17
                    }
                break;
                case 'uint32':
                    val = {
                        dataType: OPCUAClient.DataType.UInt32,
                        value: 33
                    }
                break;
                case 'real32':
                    val = {
                        dataType: OPCUAClient.DataType.Float,
                        value: 34
                    }
                break;
            }
            var nodeToWrite = [
                {
                    nodeId: node_ID,
                    attributeId: OPCUAClient.AttributeIds.Value,
                    value: {
                        value: val
                    }
                }
            ];
            session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                if (!err) {
                    //console.log(" write ok" );
                } else{
                    console.log("ERRO: ", erro);
                }
            });
            // return callback()
        }
        
    )})
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
    // Nodes a serem lidos
    var evento = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Codigo"},
    ];
    var estado = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Estado"},
    ];
    var ordem = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual1_ordem"},
    ];  

    var data = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Data"},
    ];
   
    var hora = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Hora"},
    ];

    // Data
    let dados_data = await session.read(data);
    let data_evento = await dados_data.map(result => result.value.value)[0];
    const date = new Date('1990-01-01');
    data_atual=date.addDays(data_evento);
    data_sql=(data_atual.toLocaleDateString("pt-PT"));

    // Hora
    let dados_hora = await session.read(hora);
    let hora_evento = await dados_hora.map(result => result.value.value)[0];
    horas=hora_evento/3600000
    var decimalTimeString = horas;
    var decimalTime = parseFloat(decimalTimeString);
    decimalTime = decimalTime * 60 * 60;
    var hours = Math.floor((decimalTime / (60 * 60)));
    decimalTime = decimalTime - (hours * 60 * 60);
    var minutes = Math.floor((decimalTime / 60));
    decimalTime = decimalTime - (minutes * 60);
    var seconds = Math.round(decimalTime);
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
    hora_atual=("" + hours + ":" + minutes + ":" + seconds);

    var data_hora= data_sql+ ' ' + hora_atual;
    console.log(data_hora)

    // Dados (codigo de evento, ordem e estado)

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
                data_inicio: data_hora, 
                cod_estado: cod_estado,
                ordem: ordem_atual[0],
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
                            console.log(res)
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

            // Dados (codigo de evento, ordem e estado)
            dados_evento = await session.read(evento);
            codigo_evento = await dados_evento.map(result => result.value.value);
            codigo_evento = await dados_evento.map(result => result.value.value)[0];
            cod_estado = await dados_estado.map(result => result.value.value)[0];
            dados_ordem = await session.read(ordem);
            ordem_atual = await dados_ordem.map(result => result.value.value)[0];

            // Data
            dados_data = await session.read(data);
            data_evento = await dados_data.map(result => result.value.value)[0];
            const date = new Date('1990-01-01');
            data_atual=date.addDays(data_evento);
            data_sql=(data_atual.toLocaleDateString("pt-PT"));

            // Hora
            dados_hora = await session.read(hora);
            hora_evento = await dados_hora.map(result => result.value.value)[0];
            horas=hora_evento/3600000
            decimalTimeString = horas;
            decimalTime = parseFloat(decimalTimeString);
            decimalTime = decimalTime * 60 * 60;
            hours = Math.floor((decimalTime / (60 * 60)));
            decimalTime = decimalTime - (hours * 60 * 60);
            minutes = Math.floor((decimalTime / 60));
            decimalTime = decimalTime - (minutes * 60);
            seconds = Math.round(decimalTime);
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
            hora_atual=("" + hours + ":" + minutes + ":" + seconds);
        
            data_hora= data_sql+ ' ' + hora_atual;
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



// SetOrdem (recebeu 3 e escreve a 3ª ordem)
function SetOrdem(){
 
    array_artigo_atual=["artigo1","artigo2","artigo","artigo4","artigo5","artigo6"]//string
    array_componente_principal_atual=[]//string(?)--------------
    array_descricao_atual=["Poliester 100%","Algodão 100%","Linho 100%","Linho 100%","Linho 100%","Linho 100%"]//string
    array_estado_atual=[1,0,2,0,2,1]//int16(0-standby 1-selecionado 2-trabalhar)
    array_fusos_atual=[936,850,678,940,756,809]//int16
    array_ID_atual=[1,2,3,4,5,6]//int32(ID da Ordem)
    array_lote_atual=["200002","200002","200003","200004","200005","200006"]//string (nº de lote)
    array_lote_componente_principal_atual=[]//string(?)--------------
    array_ne_final_atual=[30/1,30/1,27/1,40/1,50/1,60/1]//real32
    array_ne_real_atual=[30/1,30/1,27/1,40/1,50/1,60/1]//real32
    array_ordem_atual=["200005","200006","200007","200008","200009","200010"]//string (nº de ordem)
    array_quantidade_jogo_atual=[]//real32(?)--------------
    array_quantidade_ordem_atual=[]//real32(?)--------------
    array_sentido_torcao_atual=["S","S","S","S","S","S"]//string
    array_tonalidade_atual=["Azul","Vermelho","Amarelo","Verde","Amarelo","Verde"]//string
    array_torcao_atual=[21,22,23,24,25,26]//real32
    array_velocidade_real_atual=[]//int16(?) qual é a diferença entre os 3?--------------
    array_velocidade_media_atual=[]//int16(?)--------------
    array_velocidade_sap_atual=[]//int16(?)--------------

    let node_ID=''
    ordem_atual=3
    
        var dados_ordem={  //dados da ordem a escrever no node especifico do numero de ordem atual que recebeu
            // artigo:,
            // descricao:,                
            // estado:,
            // fusos:, 
            // id:,
            // lote:,
            // ne_final:,
            // ne_real:,                 
            //ordem_atual:ordem_atual, //(neste caso 3ª ordem)
            // sentido_torcao:, 
            // torcao:,
        }

         //para cada tipo de dado da ordem tenho de ter várias iterações de ecscrita como na SetTableOrdem
         //escrever os valores tanto em SQL como em OPCUA
            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_artigo"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.String,
                                value: array_artigo_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" ARTIGO ATUAL OK ");
                        console.log(array_artigo_atual[ordem_atual-1]);
                    } else{
                        return erro;}});

            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_descricao"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.String,
                                value: array_descricao_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" DESCRIÇÃO ATUAL OK" );
                    } else{
                        return erro;}});
    //_______
            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_Estado"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.Int16,
                                value: array_estado_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" ESTADO ATUAL OK" );
                    } else{
                        return erro;}});

            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_fusos"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.Int16,
                                value: array_fusos_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" FUSOS ATUAL OK" );
                    } else{
                        return erro;}});
        

            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_ID"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.Int32,
                                value: array_ID_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" ID ATUAL OK" );
                    } else{
                        return erro;}});
    
            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_lote"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.String,
                                value: array_lote_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" LOTE ATUAL OK" );
                    } else{
                        return erro;}});

            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_ne_final"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.Float,
                                value: array_ne_final_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" NE FINAL ATUAL OK" );
                    } else{
                        return erro;}});
        

            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_ne_real"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.Float,
                                value: array_ne_real_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" NE REAL ATUAL OK" );
                    } else{
                        return erro;}});
        
    
            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_ordem"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.String,
                                value: array_ordem_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" ORDEM ATUAL OK" );
                    } else{
                        return erro;}});

        

            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_sentido_torcao"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.String,
                                value: array_sentido_torcao_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" SENTIDO TORÇÃO ATUAL OK" );
                    } else{
                        return erro;}});


            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_tonalidade"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.String,
                                value: array_tonalidade_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" TONALIDADE ATUAL OK" );
                    } else{
                        return erro;}});

      
            node_ID ="NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual" + ordem_atual +"_torcao"
                var nodeToWrite = [
                    {nodeId: node_ID,
                        attributeId: OPCUAClient.AttributeIds.Value,
                        value: {value: {
                                dataType: OPCUAClient.DataType.Float,
                                value: array_torcao_atual[ordem_atual-1]}}}];
                session.write(nodeToWrite, function(err,statusCode,diagnosticInfo) {
                    if (!err) {
                        console.log(" TORÇÃO ATUAL OK" );
                    } else{
                        return erro;}});    


}

exports.Set_Ordem = function (callback) {
    connect().then(() => {
        SetOrdem((res) => {
            disconnect(client); 
            return callback()
        })
    });
}

// DataHora (data e hora dos eventos que foram selecionados)
async function DataHora(callback){

    var data = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Data"},
    ];
   
    let dados_data = await session.read(data);
    let data_evento = await dados_data.map(result => result.value.value)[0];
    const date = new Date('1990/01/01');
    data_atual=date.addDays(data_evento);
    data_sql=(data_atual.toLocaleDateString("en-GB"));
    //console.log(data_sql);

    var hora = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Hora"},
    ];

    let dados_hora = await session.read(hora);
    let hora_evento = await dados_hora.map(result => result.value.value)[0];
    horas=hora_evento/3600000
    // var n = new Date(0,0);
    // n. setMinutes(+horas * 60);
    // var hora_atual = n. toTimeString(). slice(0, 8);
    //console.log(hora_atual);
    
    var decimalTimeString = horas;
    var decimalTime = parseFloat(decimalTimeString);
    decimalTime = decimalTime * 60 * 60;
    var hours = Math.floor((decimalTime / (60 * 60)));
    decimalTime = decimalTime - (hours * 60 * 60);
    var minutes = Math.floor((decimalTime / 60));
    decimalTime = decimalTime - (minutes * 60);
    var seconds = Math.round(decimalTime);
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
    hora_atual=("" + hours + ":" + minutes + ":" + seconds);

    console.log(data_sql+ ' ' + hora_atual);
    
}         

exports.Data_Hora = function (callback) {
    connect().then(() => {
        DataHora((res) => {
            disconnect(client); 
            return callback()
        })
    });
}

async function CycleEvento2(callback) {
    // Nodes a serem lidos
    var evento = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Codigo"},
    ];
    var estado = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Estado"},
    ];
    var ordem = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.OrdemAtual1_ordem"},
    ];  

    var data = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Data"},
    ];
   
    var hora = [
        { nodeId: "NodeID;ns=4;s=ContinuosOlifil.113-101.Generic.Eventos_Hora"},
    ];

    // Data
    let dados_data = await session.read(data);
    let data_evento = await dados_data.map(result => result.value.value)[0];
    const date = new Date('1990-01-01');
    // console.log(date);
    // console.log(data_evento);
    data_atual=date.addDays(data_evento);
    data_sql=(data_atual.toLocaleDateString("pt-PT"));
    console.log('ok');

    // Hora
    let dados_hora = await session.read(hora);
    let hora_evento = await dados_hora.map(result => result.value.value)[0];
    horas=hora_evento/3600000
    var decimalTimeString = horas;
    var decimalTime = parseFloat(decimalTimeString);
    decimalTime = decimalTime * 60 * 60;
    var hours = Math.floor((decimalTime / (60 * 60)));
    decimalTime = decimalTime - (hours * 60 * 60);
    var minutes = Math.floor((decimalTime / 60));
    decimalTime = decimalTime - (minutes * 60);
    var seconds = Math.round(decimalTime);
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
    console.log('ok2');
    hora_atual=("" + hours + ":" + minutes + ":" + seconds);

    var data_hora= data_sql+ ' ' + hora_atual;
    //console.log(data_hora)

    // Dados (codigo de evento, ordem e estado)

    let dados_evento = await session.read(evento);
    let dados_estado = await session.read(estado);
    let dados_ordem = await session.read(ordem);
    let codigo_evento = await dados_evento.map(result => result.value.value)[0];
    let cod_estado = await dados_estado.map(result => result.value.value)[0];
    let ordem_atual = await dados_ordem.map(result => result.value.value)[0];
   
    if(codigo_evento[0]>0){
        console.log(('correti'));
        // console.log('ok');
        // console.log('cod_estado'+ ': ' + cod_estado);
        // console.log('cod_evento'+ ': ' + codigo_evento);
        // console.log('ordem_atual'+ ': ' + ordem_atual);
        while (codigo_evento[0]>0){
            console.log(codigo_evento[0]);
            var nodesToWrite = [
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
            //console.log(nodesToWrite)
            await session.write(nodesToWrite, function(err,statusCode,diagnosticInfo) {
                if (!err) {
                    console.log(" write ok" );
                    console.log(diagnosticInfo);
                    console.log(statusCode);
                } else{
                    return erro;
                }
            }); 

            // Dados (codigo de evento, ordem e estado)
            dados_evento = await session.read(evento);
            codigo_evento = await dados_evento.map(result => result.value.value);
            codigo_evento = await dados_evento.map(result => result.value.value)[0];
            cod_estado = await dados_estado.map(result => result.value.value)[0];
            dados_ordem = await session.read(ordem);
            ordem_atual = await dados_ordem.map(result => result.value.value)[0];

            // Data
            dados_data = await session.read(data);
            data_evento = await dados_data.map(result => result.value.value)[0];
            const date = new Date('1990-01-01');
            data_atual=date.addDays(data_evento);
            data_sql=(data_atual.toLocaleDateString("pt-PT"));

            // Hora
            dados_hora = await session.read(hora);
            hora_evento = await dados_hora.map(result => result.value.value)[0];
            horas=hora_evento/3600000
            decimalTimeString = horas;
            decimalTime = parseFloat(decimalTimeString);
            decimalTime = decimalTime * 60 * 60;
            hours = Math.floor((decimalTime / (60 * 60)));
            decimalTime = decimalTime - (hours * 60 * 60);
            minutes = Math.floor((decimalTime / 60));
            decimalTime = decimalTime - (minutes * 60);
            seconds = Math.round(decimalTime);
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
            hora_atual=("" + hours + ":" + minutes + ":" + seconds);
        
            data_hora= data_sql+ ' ' + hora_atual;
        }
        return callback()
    }
    else {
        return callback()
    }
     
}

exports.Cycle_eventos2 = function (callback) {
    connect().then(() => {
        CycleEvento2((res) => {
             disconnect(client); 
            return callback()
        })
    });
}