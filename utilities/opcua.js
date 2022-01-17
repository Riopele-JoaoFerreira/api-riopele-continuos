const OPCUAClient = require('node-opcua'); 
const async = require('async'); 



const options = {  
    applicationName: "MyClient",
    connectionStrategy: {
        initialDelay: 1000,
        maxRetry: 1
    },
    securityMode: OPCUAClient.MessageSecurityMode.None,
    securityPolicy: OPCUAClient.SecurityPolicy.None,
    endpoint_must_exist: false,
};

const client = OPCUAClient.OPCUAClient.create(options); 
let session = null;
const endpointUrl = "opc.tcp://SRVRIOT02:48011"; // servidor onde estão os dados

inicio_node= "NodeID;ns=4;s=ContinuosRiopB.101-B101." //inicio de node

array_nodes = ['Generic.Eventos_Var1','Generic.Eventos_Var2','Generic.Eventos_Var3','Generic.Ordem1_horas_motor_principal','Generic.Ordem1_ne_final','Generic.Ordem1_ne_real','Generic.Ordem1_Potência Instantânea','Generic.Ordem1_quantidade_jogo','Generic.Ordem1_quantidade_ordem','Generic.Ordem1_torcao','Generic.Ordem1_var10','Generic.Ordem1_var11','Generic.Ordem1_var9','Generic.Ordem2_horas_motor_principal','Generic.Ordem2_ne_final','Generic.Ordem2_ne_real','Generic.Ordem2_Potência Instantânea','Generic.Ordem2_quantidade_jogo','Generic.Ordem2_quantidade_ordem','Generic.Ordem2_torcao','Generic.Ordem2_var10','Generic.Ordem2_var11','Generic.Ordem2_var9','Generic.Ordem3_horas_motor_principal','Generic.Ordem3_ne_final','Generic.Ordem3_ne_real','Generic.Ordem3_Potência Instantânea','Generic.Ordem3_quantidade_jogo','Generic.Ordem3_quantidade_ordem','Generic.Ordem3_torcao','Generic.Ordem3_var10','Generic.Ordem3_var11','Generic.Ordem3_var9','Generic.Ordem4_horas_motor_principal','Generic.Ordem4_ne_final','Generic.Ordem4_ne_real','Generic.Ordem4_Potência Instantânea','Generic.Ordem4_quantidade_jogo','Generic.Ordem4_quantidade_ordem','Generic.Ordem4_torcao','Generic.Ordem4_var10','Generic.Ordem4_var11','Generic.Ordem4_var9','Generic.Ordem5_horas_motor_principal','Generic.Ordem5_ne_final','Generic.Ordem5_ne_real','Generic.Ordem5_Potência Instantânea','Generic.Ordem5_quantidade_jogo','Generic.Ordem5_quantidade_ordem','Generic.Ordem5_torcao','Generic.Ordem5_var10','Generic.Ordem5_var11','Generic.Ordem5_var9','Generic.Ordem6_horas_motor_principal','Generic.Ordem6_ne_final','Generic.Ordem6_ne_real','Generic.Ordem6_Potência Instantânea','Generic.Ordem6_quantidade_jogo','Generic.Ordem6_quantidade_ordem','Generic.Ordem6_torcao','Generic.Ordem6_var10','Generic.Ordem6_var11','Generic.Ordem6_var9','Generic.OrdemAtual1_horas_motor_principal','Generic.OrdemAtual1_ne_final','Generic.OrdemAtual1_ne_real','Generic.OrdemAtual1_Potência Instantânea','Generic.OrdemAtual1_quantidade_jogo','Generic.OrdemAtual1_quantidade_ordem','Generic.OrdemAtual1_torcao','Generic.OrdemAtual1_var10','Generic.OrdemAtual1_var11','Generic.OrdemAtual1_var9','Generic.OrdemAtual2_horas_motor_principal','Generic.OrdemAtual2_ne_final','Generic.OrdemAtual2_ne_real','Generic.OrdemAtual2_Potência Instantânea','Generic.OrdemAtual2_quantidade_jogo','Generic.OrdemAtual2_quantidade_ordem','Generic.OrdemAtual2_torcao','Generic.OrdemAtual2_var10','Generic.OrdemAtual2_var11','Generic.OrdemAtual2_var9','Generic.OrdemAtual3_horas_motor_principal','Generic.OrdemAtual3_ne_final','Generic.OrdemAtual3_ne_real','Generic.OrdemAtual3_Potência Instantânea','Generic.OrdemAtual3_quantidade_jogo','Generic.OrdemAtual3_quantidade_ordem','Generic.OrdemAtual3_torcao','Generic.OrdemAtual3_var10','Generic.OrdemAtual3_var11','Generic.OrdemAtual3_var9','Generic.OrdemAtual4_horas_motor_principal','Generic.OrdemAtual4_ne_final','Generic.OrdemAtual4_ne_real','Generic.OrdemAtual4_Potência Instantânea','Generic.OrdemAtual4_quantidade_jogo','Generic.OrdemAtual4_quantidade_ordem','Generic.OrdemAtual4_torcao','Generic.OrdemAtual4_var10','Generic.OrdemAtual4_var11','Generic.OrdemAtual4_var9','Generic.Variaveis_Torcao','Generic.Variaveis_VelFusos','Generic.Variaveis_VelSaida','Generic.Eventos_Data','Generic.Ordem1_data_fim_jogo','Generic.Ordem1_data_fim_ordem','Generic.Ordem1_data_inicio_jogo','Generic.Ordem1_data_inicio_ordem','Generic.Ordem2_data_fim_jogo','Generic.Ordem2_data_fim_ordem','Generic.Ordem2_data_inicio_jogo','Generic.Ordem2_data_inicio_ordem','Generic.Ordem3_data_fim_jogo','Generic.Ordem3_data_fim_ordem','Generic.Ordem3_data_inicio_jogo','Generic.Ordem3_data_inicio_ordem','Generic.Ordem4_data_fim_jogo','Generic.Ordem4_data_fim_ordem','Generic.Ordem4_data_inicio_jogo','Generic.Ordem4_data_inicio_ordem','Generic.Ordem5_data_fim_jogo','Generic.Ordem5_data_fim_ordem','Generic.Ordem5_data_inicio_jogo','Generic.Ordem5_data_inicio_ordem','Generic.Ordem6_data_fim_jogo','Generic.Ordem6_data_fim_ordem','Generic.Ordem6_data_inicio_jogo','Generic.Ordem6_data_inicio_ordem','Generic.OrdemAtual1_data_fim_jogo','Generic.OrdemAtual1_data_fim_ordem','Generic.OrdemAtual1_data_inicio_jogo','Generic.OrdemAtual1_data_inicio_ordem','Generic.OrdemAtual2_data_fim_jogo','Generic.OrdemAtual2_data_fim_ordem','Generic.OrdemAtual2_data_inicio_jogo','Generic.OrdemAtual2_data_inicio_ordem','Generic.OrdemAtual3_data_fim_jogo','Generic.OrdemAtual3_data_fim_ordem','Generic.OrdemAtual3_data_inicio_jogo','Generic.OrdemAtual3_data_inicio_ordem','Generic.OrdemAtual4_data_fim_jogo','Generic.OrdemAtual4_data_fim_ordem','Generic.OrdemAtual4_data_inicio_jogo','Generic.OrdemAtual4_data_inicio_ordem','Generic.Eventos_Hora','Generic.Ordem1_hora_fim_jogo','Generic.Ordem1_hora_fim_ordem','Generic.Ordem1_hora_inicio_jogo','Generic.Ordem1_hora_inicio_ordem','Generic.Ordem2_hora_fim_jogo','Generic.Ordem2_hora_fim_ordem','Generic.Ordem2_hora_inicio_jogo','Generic.Ordem2_hora_inicio_ordem','Generic.Ordem3_hora_fim_jogo','Generic.Ordem3_hora_fim_ordem','Generic.Ordem3_hora_inicio_jogo','Generic.Ordem3_hora_inicio_ordem','Generic.Ordem4_hora_fim_jogo','Generic.Ordem4_hora_fim_ordem','Generic.Ordem4_hora_inicio_jogo','Generic.Ordem4_hora_inicio_ordem','Generic.Ordem5_hora_fim_jogo','Generic.Ordem5_hora_fim_ordem','Generic.Ordem5_hora_inicio_jogo','Generic.Ordem5_hora_inicio_ordem','Generic.Ordem6_hora_fim_jogo','Generic.Ordem6_hora_fim_ordem','Generic.Ordem6_hora_inicio_jogo','Generic.Ordem6_hora_inicio_ordem','Generic.OrdemAtual1_hora_fim_jogo','Generic.OrdemAtual1_hora_fim_ordem','Generic.OrdemAtual1_hora_inicio_jogo','Generic.OrdemAtual1_hora_inicio_ordem','Generic.OrdemAtual2_hora_fim_jogo','Generic.OrdemAtual2_hora_fim_ordem','Generic.OrdemAtual2_hora_inicio_jogo','Generic.OrdemAtual2_hora_inicio_ordem','Generic.OrdemAtual3_hora_fim_jogo','Generic.OrdemAtual3_hora_fim_ordem','Generic.OrdemAtual3_hora_inicio_jogo','Generic.OrdemAtual3_hora_inicio_ordem','Generic.OrdemAtual4_hora_fim_jogo','Generic.OrdemAtual4_hora_fim_ordem','Generic.OrdemAtual4_hora_inicio_jogo','Generic.OrdemAtual4_hora_inicio_ordem','Generic.Ordem1_ID','Generic.Ordem2_ID','Generic.Ordem3_ID','Generic.Ordem4_ID','Generic.Ordem5_ID','Generic.Ordem6_ID','Generic.OrdemAtual1_ID','Generic.OrdemAtual2_ID','Generic.OrdemAtual3_ID','Generic.OrdemAtual4_ID','Generic.Eventos_Codigo','Generic.Eventos_Estado','Generic.Eventos_Novo','Generic.Ordem1_Estado','Generic.Ordem1_fusos','Generic.Ordem1_var5','Generic.Ordem1_var6','Generic.Ordem1_var7','Generic.Ordem1_var8','Generic.Ordem1_velocidade_media','Generic.Ordem1_velocidade_real','Generic.Ordem1_velocidade_sap','Generic.Ordem2_Estado','Generic.Ordem2_fusos','Generic.Ordem2_var5','Generic.Ordem2_var6','Generic.Ordem2_var7','Generic.Ordem2_var8','Generic.Ordem2_velocidade_media','Generic.Ordem2_velocidade_real','Generic.Ordem2_velocidade_sap','Generic.Ordem3_Estado','Generic.Ordem3_fusos','Generic.Ordem3_var5','Generic.Ordem3_var6','Generic.Ordem3_var7','Generic.Ordem3_var8','Generic.Ordem3_velocidade_media','Generic.Ordem3_velocidade_real','Generic.Ordem3_velocidade_sap','Generic.Ordem4_Estado','Generic.Ordem4_fusos','Generic.Ordem4_var5','Generic.Ordem4_var6','Generic.Ordem4_var7','Generic.Ordem4_var8','Generic.Ordem4_velocidade_media','Generic.Ordem4_velocidade_real','Generic.Ordem4_velocidade_sap','Generic.Ordem5_Estado','Generic.Ordem5_fusos','Generic.Ordem5_var5','Generic.Ordem5_var6','Generic.Ordem5_var7','Generic.Ordem5_var8','Generic.Ordem5_velocidade_media','Generic.Ordem5_velocidade_real','Generic.Ordem5_velocidade_sap','Generic.Ordem6_Estado','Generic.Ordem6_fusos','Generic.Ordem6_var5','Generic.Ordem6_var6','Generic.Ordem6_var7','Generic.Ordem6_var8','Generic.Ordem6_velocidade_media','Generic.Ordem6_velocidade_real','Generic.Ordem6_velocidade_sap','Generic.OrdemAtual1_Estado','Generic.OrdemAtual1_fusos','Generic.OrdemAtual1_var5','Generic.OrdemAtual1_var6','Generic.OrdemAtual1_var7','Generic.OrdemAtual1_var8','Generic.OrdemAtual1_velocidade_media','Generic.OrdemAtual1_velocidade_real','Generic.OrdemAtual1_velocidade_sap','Generic.OrdemAtual2_Estado','Generic.OrdemAtual2_fusos','Generic.OrdemAtual2_var5','Generic.OrdemAtual2_var6','Generic.OrdemAtual2_var7','Generic.OrdemAtual2_var8','Generic.OrdemAtual2_velocidade_media','Generic.OrdemAtual2_velocidade_real','Generic.OrdemAtual2_velocidade_sap','Generic.OrdemAtual3_Estado','Generic.OrdemAtual3_fusos','Generic.OrdemAtual3_var5','Generic.OrdemAtual3_var6','Generic.OrdemAtual3_var7','Generic.OrdemAtual3_var8','Generic.OrdemAtual3_velocidade_media','Generic.OrdemAtual3_velocidade_real','Generic.OrdemAtual3_velocidade_sap','Generic.OrdemAtual4_Estado','Generic.OrdemAtual4_fusos','Generic.OrdemAtual4_var5','Generic.OrdemAtual4_var6','Generic.OrdemAtual4_var7','Generic.OrdemAtual4_var8','Generic.OrdemAtual4_velocidade_media','Generic.OrdemAtual4_velocidade_real','Generic.OrdemAtual4_velocidade_sap','Generic.Variaveis_Estado','Generic.Eventos_Str1','Generic.Eventos_Str2','Generic.Eventos_Str3','Generic.Ordem1_artigo','Generic.Ordem1_componente_principal','Generic.Ordem1_descricao','Generic.Ordem1_lote','Generic.Ordem1_lote_componente_principal','Generic.Ordem1_ordem','Generic.Ordem1_sentido_torcao','Generic.Ordem1_tonalidade','Generic.Ordem1_var1','Generic.Ordem1_var2','Generic.Ordem1_var3','Generic.Ordem1_var4','Generic.Ordem2_artigo','Generic.Ordem2_componente_principal','Generic.Ordem2_descricao','Generic.Ordem2_lote','Generic.Ordem2_lote_componente_principal','Generic.Ordem2_ordem','Generic.Ordem2_sentido_torcao','Generic.Ordem2_tonalidade','Generic.Ordem2_var1','Generic.Ordem2_var2','Generic.Ordem2_var3','Generic.Ordem2_var4','Generic.Ordem3_artigo','Generic.Ordem3_componente_principal','Generic.Ordem3_descricao','Generic.Ordem3_lote','Generic.Ordem3_lote_componente_principal','Generic.Ordem3_ordem','Generic.Ordem3_sentido_torcao','Generic.Ordem3_tonalidade','Generic.Ordem3_var1','Generic.Ordem3_var2','Generic.Ordem3_var3','Generic.Ordem3_var4','Generic.Ordem4_artigo','Generic.Ordem4_componente_principal','Generic.Ordem4_descricao','Generic.Ordem4_lote','Generic.Ordem4_lote_componente_principal','Generic.Ordem4_ordem','Generic.Ordem4_sentido_torcao','Generic.Ordem4_tonalidade','Generic.Ordem4_var1','Generic.Ordem4_var2','Generic.Ordem4_var3','Generic.Ordem4_var4','Generic.Ordem5_artigo','Generic.Ordem5_componente_principal','Generic.Ordem5_descricao','Generic.Ordem5_lote','Generic.Ordem5_lote_componente_principal','Generic.Ordem5_ordem','Generic.Ordem5_sentido_torcao','Generic.Ordem5_tonalidade','Generic.Ordem5_var1','Generic.Ordem5_var2','Generic.Ordem5_var3','Generic.Ordem5_var4','Generic.Ordem6_artigo','Generic.Ordem6_componente_principal','Generic.Ordem6_descricao','Generic.Ordem6_lote','Generic.Ordem6_lote_componente_principal','Generic.Ordem6_ordem','Generic.Ordem6_sentido_torcao','Generic.Ordem6_tonalidade','Generic.Ordem6_var1','Generic.Ordem6_var2','Generic.Ordem6_var3','Generic.Ordem6_var4','Generic.OrdemAtual1_artigo','Generic.OrdemAtual1_componente_principal','Generic.OrdemAtual1_descricao','Generic.OrdemAtual1_lote','Generic.OrdemAtual1_lote_componente_principal','Generic.OrdemAtual1_ordem','Generic.OrdemAtual1_sentido_torcao','Generic.OrdemAtual1_tonalidade','Generic.OrdemAtual1_var1','Generic.OrdemAtual1_var2','Generic.OrdemAtual1_var3','Generic.OrdemAtual1_var4','Generic.OrdemAtual2_artigo','Generic.OrdemAtual2_componente_principal','Generic.OrdemAtual2_descricao','Generic.OrdemAtual2_lote','Generic.OrdemAtual2_lote_componente_principal','Generic.OrdemAtual2_ordem','Generic.OrdemAtual2_sentido_torcao','Generic.OrdemAtual2_tonalidade','Generic.OrdemAtual2_var1','Generic.OrdemAtual2_var2','Generic.OrdemAtual2_var3','Generic.OrdemAtual2_var4','Generic.OrdemAtual3_artigo','Generic.OrdemAtual3_componente_principal','Generic.OrdemAtual3_descricao','Generic.OrdemAtual3_lote','Generic.OrdemAtual3_lote_componente_principal','Generic.OrdemAtual3_ordem','Generic.OrdemAtual3_sentido_torcao','Generic.OrdemAtual3_tonalidade','Generic.OrdemAtual3_var1','Generic.OrdemAtual3_var2','Generic.OrdemAtual3_var3','Generic.OrdemAtual3_var4','Generic.OrdemAtual4_artigo','Generic.OrdemAtual4_componente_principal','Generic.OrdemAtual4_descricao','Generic.OrdemAtual4_lote','Generic.OrdemAtual4_lote_componente_principal','Generic.OrdemAtual4_ordem','Generic.OrdemAtual4_sentido_torcao','Generic.OrdemAtual4_tonalidade','Generic.OrdemAtual4_var1','Generic.OrdemAtual4_var2','Generic.OrdemAtual4_var3']
// nodes com tipo de dados int32

valores_obtidos=[]  // array vazia para ir adicionando valores de leitura

async function browse() {
    const browseResult = await session.browse("RootFolder");
    
    let result = []; 

    for(const reference of browseResult.references) {
        result.push(reference); 
    }
    return result; 
}

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


// READ EVENTOS 

function ReadEvento(callback) {
    let stack = [];
    let node_ID = ''; 
    let node_ID_obj = null; 
    array_nodes.forEach(element => { 
        stack.push((callback) => {
            node_ID = inicio_node + element
           
            node_ID_obj =  {
                nodeId: node_ID
            }; 

            session.read(node_ID_obj).then((dataValue) => {
                data_obj = {
                    nodeId: node_ID_obj.nodeId,
                    value: dataValue.value.value, 
                    
                }
                valores_obtidos.push(data_obj)
                //console.log(valores_obtidos);
                return callback(); 
            }).catch((error) => {
                return callback(); 
            })
        })
    })

    async.waterfall(stack, () => {
        return callback(); 
    })
}

exports.Ler_eventos = function (callback) {
    connect().then(() => {
        ReadEvento((res) => {
              return callback (valores_obtidos)
        })
    });
}

//SET EVENTOS
//diferenciação de tipos de dados

array_nodes_int16=['Generic.Eventos_Codigo','Generic.Eventos_Estado','Generic.Eventos_Novo','Generic.Ordem1_Estado','Generic.Ordem1_fusos','Generic.Ordem1_var5','Generic.Ordem1_var6','Generic.Ordem1_var7','Generic.Ordem1_var8','Generic.Ordem1_velocidade_media','Generic.Ordem1_velocidade_real','Generic.Ordem1_velocidade_sap','Generic.Ordem2_Estado','Generic.Ordem2_fusos','Generic.Ordem2_var5','Generic.Ordem2_var6','Generic.Ordem2_var7','Generic.Ordem2_var8','Generic.Ordem2_velocidade_media','Generic.Ordem2_velocidade_real','Generic.Ordem2_velocidade_sap','Generic.Ordem3_Estado','Generic.Ordem3_fusos','Generic.Ordem3_var5','Generic.Ordem3_var6','Generic.Ordem3_var7','Generic.Ordem3_var8','Generic.Ordem3_velocidade_media','Generic.Ordem3_velocidade_real','Generic.Ordem3_velocidade_sap','Generic.Ordem4_Estado','Generic.Ordem4_fusos','Generic.Ordem4_var5','Generic.Ordem4_var6','Generic.Ordem4_var7','Generic.Ordem4_var8','Generic.Ordem4_velocidade_media','Generic.Ordem4_velocidade_real','Generic.Ordem4_velocidade_sap','Generic.Ordem5_Estado','Generic.Ordem5_fusos','Generic.Ordem5_var5','Generic.Ordem5_var6','Generic.Ordem5_var7','Generic.Ordem5_var8','Generic.Ordem5_velocidade_media','Generic.Ordem5_velocidade_real','Generic.Ordem5_velocidade_sap','Generic.Ordem6_Estado','Generic.Ordem6_fusos','Generic.Ordem6_var5','Generic.Ordem6_var6','Generic.Ordem6_var7','Generic.Ordem6_var8','Generic.Ordem6_velocidade_media','Generic.Ordem6_velocidade_real','Generic.Ordem6_velocidade_sap','Generic.OrdemAtual1_Estado','Generic.OrdemAtual1_fusos','Generic.OrdemAtual1_var5','Generic.OrdemAtual1_var6','Generic.OrdemAtual1_var7','Generic.OrdemAtual1_var8','Generic.OrdemAtual1_velocidade_media','Generic.OrdemAtual1_velocidade_real','Generic.OrdemAtual1_velocidade_sap','Generic.OrdemAtual2_Estado','Generic.OrdemAtual2_fusos','Generic.OrdemAtual2_var5','Generic.OrdemAtual2_var6','Generic.OrdemAtual2_var7','Generic.OrdemAtual2_var8','Generic.OrdemAtual2_velocidade_media','Generic.OrdemAtual2_velocidade_real','Generic.OrdemAtual2_velocidade_sap','Generic.OrdemAtual3_Estado','Generic.OrdemAtual3_fusos','Generic.OrdemAtual3_var5','Generic.OrdemAtual3_var6','Generic.OrdemAtual3_var7','Generic.OrdemAtual3_var8','Generic.OrdemAtual3_velocidade_media','Generic.OrdemAtual3_velocidade_real','Generic.OrdemAtual3_velocidade_sap','Generic.OrdemAtual4_Estado','Generic.OrdemAtual4_fusos','Generic.OrdemAtual4_var5','Generic.OrdemAtual4_var6','Generic.OrdemAtual4_var7','Generic.OrdemAtual4_var8','Generic.OrdemAtual4_velocidade_media','Generic.OrdemAtual4_velocidade_real','Generic.OrdemAtual4_velocidade_sap','Generic.Variaveis_Estado']

array_nodes_int32=['Generic.Ordem1_ID','Generic.Ordem2_ID','Generic.Ordem3_ID','Generic.Ordem4_ID','Generic.Ordem5_ID','Generic.Ordem6_ID','Generic.OrdemAtual1_ID','Generic.OrdemAtual2_ID','Generic.OrdemAtual3_ID','Generic.OrdemAtual4_ID']

array_nodes_uint16=['Generic.Eventos_Data','Generic.Ordem1_data_fim_jogo','Generic.Ordem1_data_fim_ordem','Generic.Ordem1_data_inicio_jogo','Generic.Ordem1_data_inicio_ordem','Generic.Ordem2_data_fim_jogo','Generic.Ordem2_data_fim_ordem','Generic.Ordem2_data_inicio_jogo','Generic.Ordem2_data_inicio_ordem','Generic.Ordem3_data_fim_jogo','Generic.Ordem3_data_fim_ordem','Generic.Ordem3_data_inicio_jogo','Generic.Ordem3_data_inicio_ordem','Generic.Ordem4_data_fim_jogo','Generic.Ordem4_data_fim_ordem','Generic.Ordem4_data_inicio_jogo','Generic.Ordem4_data_inicio_ordem','Generic.Ordem5_data_fim_jogo','Generic.Ordem5_data_fim_ordem','Generic.Ordem5_data_inicio_jogo','Generic.Ordem5_data_inicio_ordem','Generic.Ordem6_data_fim_jogo','Generic.Ordem6_data_fim_ordem','Generic.Ordem6_data_inicio_jogo','Generic.Ordem6_data_inicio_ordem','Generic.OrdemAtual1_data_fim_jogo','Generic.OrdemAtual1_data_fim_ordem','Generic.OrdemAtual1_data_inicio_jogo','Generic.OrdemAtual1_data_inicio_ordem','Generic.OrdemAtual2_data_fim_jogo','Generic.OrdemAtual2_data_fim_ordem','Generic.OrdemAtual2_data_inicio_jogo','Generic.OrdemAtual2_data_inicio_ordem','Generic.OrdemAtual3_data_fim_jogo','Generic.OrdemAtual3_data_fim_ordem','Generic.OrdemAtual3_data_inicio_jogo','Generic.OrdemAtual3_data_inicio_ordem','Generic.OrdemAtual4_data_fim_jogo','Generic.OrdemAtual4_data_fim_ordem','Generic.OrdemAtual4_data_inicio_jogo','Generic.OrdemAtual4_data_inicio_ordem']

array_nodes_uint32=['Generic.Eventos_Hora','Generic.Ordem1_hora_fim_jogo','Generic.Ordem1_hora_fim_ordem','Generic.Ordem1_hora_inicio_jogo','Generic.Ordem1_hora_inicio_ordem','Generic.Ordem2_hora_fim_jogo','Generic.Ordem2_hora_fim_ordem','Generic.Ordem2_hora_inicio_jogo','Generic.Ordem2_hora_inicio_ordem','Generic.Ordem3_hora_fim_jogo','Generic.Ordem3_hora_fim_ordem','Generic.Ordem3_hora_inicio_jogo','Generic.Ordem3_hora_inicio_ordem','Generic.Ordem4_hora_fim_jogo','Generic.Ordem4_hora_fim_ordem','Generic.Ordem4_hora_inicio_jogo','Generic.Ordem4_hora_inicio_ordem','Generic.Ordem5_hora_fim_jogo','Generic.Ordem5_hora_fim_ordem','Generic.Ordem5_hora_inicio_jogo','Generic.Ordem5_hora_inicio_ordem','Generic.Ordem6_hora_fim_jogo','Generic.Ordem6_hora_fim_ordem','Generic.Ordem6_hora_inicio_jogo','Generic.Ordem6_hora_inicio_ordem','Generic.OrdemAtual1_hora_fim_jogo','Generic.OrdemAtual1_hora_fim_ordem','Generic.OrdemAtual1_hora_inicio_jogo','Generic.OrdemAtual1_hora_inicio_ordem','Generic.OrdemAtual2_hora_fim_jogo','Generic.OrdemAtual2_hora_fim_ordem','Generic.OrdemAtual2_hora_inicio_jogo','Generic.OrdemAtual2_hora_inicio_ordem','Generic.OrdemAtual3_hora_fim_jogo','Generic.OrdemAtual3_hora_fim_ordem','Generic.OrdemAtual3_hora_inicio_jogo','Generic.OrdemAtual3_hora_inicio_ordem','Generic.OrdemAtual4_hora_fim_jogo','Generic.OrdemAtual4_hora_fim_ordem','Generic.OrdemAtual4_hora_inicio_jogo','Generic.OrdemAtual4_hora_inicio_ordem']

array_nodes_string=['Generic.Eventos_Str1','Generic.Eventos_Str2','Generic.Eventos_Str3','Generic.Ordem1_artigo','Generic.Ordem1_componente_principal','Generic.Ordem1_descricao','Generic.Ordem1_lote','Generic.Ordem1_lote_componente_principal','Generic.Ordem1_ordem','Generic.Ordem1_sentido_torcao','Generic.Ordem1_tonalidade','Generic.Ordem1_var1','Generic.Ordem1_var2','Generic.Ordem1_var3','Generic.Ordem1_var4','Generic.Ordem2_artigo','Generic.Ordem2_componente_principal','Generic.Ordem2_descricao','Generic.Ordem2_lote','Generic.Ordem2_lote_componente_principal','Generic.Ordem2_ordem','Generic.Ordem2_sentido_torcao','Generic.Ordem2_tonalidade','Generic.Ordem2_var1','Generic.Ordem2_var2','Generic.Ordem2_var3','Generic.Ordem2_var4','Generic.Ordem3_artigo','Generic.Ordem3_componente_principal','Generic.Ordem3_descricao','Generic.Ordem3_lote','Generic.Ordem3_lote_componente_principal','Generic.Ordem3_ordem','Generic.Ordem3_sentido_torcao','Generic.Ordem3_tonalidade','Generic.Ordem3_var1','Generic.Ordem3_var2','Generic.Ordem3_var3','Generic.Ordem3_var4','Generic.Ordem4_artigo','Generic.Ordem4_componente_principal','Generic.Ordem4_descricao','Generic.Ordem4_lote','Generic.Ordem4_lote_componente_principal','Generic.Ordem4_ordem','Generic.Ordem4_sentido_torcao','Generic.Ordem4_tonalidade','Generic.Ordem4_var1','Generic.Ordem4_var2','Generic.Ordem4_var3','Generic.Ordem4_var4','Generic.Ordem5_artigo','Generic.Ordem5_componente_principal','Generic.Ordem5_descricao','Generic.Ordem5_lote','Generic.Ordem5_lote_componente_principal','Generic.Ordem5_ordem','Generic.Ordem5_sentido_torcao','Generic.Ordem5_tonalidade','Generic.Ordem5_var1','Generic.Ordem5_var2','Generic.Ordem5_var3','Generic.Ordem5_var4','Generic.Ordem6_artigo','Generic.Ordem6_componente_principal','Generic.Ordem6_descricao','Generic.Ordem6_lote','Generic.Ordem6_lote_componente_principal','Generic.Ordem6_ordem','Generic.Ordem6_sentido_torcao','Generic.Ordem6_tonalidade','Generic.Ordem6_var1','Generic.Ordem6_var2','Generic.Ordem6_var3','Generic.Ordem6_var4','Generic.OrdemAtual1_artigo','Generic.OrdemAtual1_componente_principal','Generic.OrdemAtual1_descricao','Generic.OrdemAtual1_lote','Generic.OrdemAtual1_lote_componente_principal','Generic.OrdemAtual1_ordem','Generic.OrdemAtual1_sentido_torcao','Generic.OrdemAtual1_tonalidade','Generic.OrdemAtual1_var1','Generic.OrdemAtual1_var2','Generic.OrdemAtual1_var3','Generic.OrdemAtual1_var4','Generic.OrdemAtual2_artigo','Generic.OrdemAtual2_componente_principal','Generic.OrdemAtual2_descricao','Generic.OrdemAtual2_lote','Generic.OrdemAtual2_lote_componente_principal','Generic.OrdemAtual2_ordem','Generic.OrdemAtual2_sentido_torcao','Generic.OrdemAtual2_tonalidade','Generic.OrdemAtual2_var1','Generic.OrdemAtual2_var2','Generic.OrdemAtual2_var3','Generic.OrdemAtual2_var4','Generic.OrdemAtual3_artigo','Generic.OrdemAtual3_componente_principal','Generic.OrdemAtual3_descricao','Generic.OrdemAtual3_lote','Generic.OrdemAtual3_lote_componente_principal','Generic.OrdemAtual3_ordem','Generic.OrdemAtual3_sentido_torcao','Generic.OrdemAtual3_tonalidade','Generic.OrdemAtual3_var1','Generic.OrdemAtual3_var2','Generic.OrdemAtual3_var3','Generic.OrdemAtual3_var4','Generic.OrdemAtual4_artigo','Generic.OrdemAtual4_componente_principal','Generic.OrdemAtual4_descricao','Generic.OrdemAtual4_lote','Generic.OrdemAtual4_lote_componente_principal','Generic.OrdemAtual4_ordem','Generic.OrdemAtual4_sentido_torcao','Generic.OrdemAtual4_tonalidade','Generic.OrdemAtual4_var1','Generic.OrdemAtual4_var2','Generic.OrdemAtual4_var3','Generic.OrdemAtual4_var4']

//não existe no VSB

array_nodes_real32=['Generic.Eventos_Var1','Generic.Eventos_Var2','Generic.Eventos_Var3','Generic.Ordem1_horas_motor_principal','Generic.Ordem1_ne_final','Generic.Ordem1_ne_real','Generic.Ordem1_Potência Instantânea','Generic.Ordem1_quantidade_jogo','Generic.Ordem1_quantidade_ordem','Generic.Ordem1_torcao','Generic.Ordem1_var10','Generic.Ordem1_var11','Generic.Ordem1_var9','Generic.Ordem2_horas_motor_principal','Generic.Ordem2_ne_final','Generic.Ordem2_ne_real','Generic.Ordem2_Potência Instantânea','Generic.Ordem2_quantidade_jogo','Generic.Ordem2_quantidade_ordem','Generic.Ordem2_torcao','Generic.Ordem2_var10','Generic.Ordem2_var11','Generic.Ordem2_var9','Generic.Ordem3_horas_motor_principal','Generic.Ordem3_ne_final','Generic.Ordem3_ne_real','Generic.Ordem3_Potência Instantânea','Generic.Ordem3_quantidade_jogo','Generic.Ordem3_quantidade_ordem','Generic.Ordem3_torcao','Generic.Ordem3_var10','Generic.Ordem3_var11','Generic.Ordem3_var9','Generic.Ordem4_horas_motor_principal','Generic.Ordem4_ne_final','Generic.Ordem4_ne_real','Generic.Ordem4_Potência Instantânea','Generic.Ordem4_quantidade_jogo','Generic.Ordem4_quantidade_ordem','Generic.Ordem4_torcao','Generic.Ordem4_var10','Generic.Ordem4_var11','Generic.Ordem4_var9','Generic.Ordem5_horas_motor_principal','Generic.Ordem5_ne_final','Generic.Ordem5_ne_real','Generic.Ordem5_Potência Instantânea','Generic.Ordem5_quantidade_jogo','Generic.Ordem5_quantidade_ordem','Generic.Ordem5_torcao','Generic.Ordem5_var10','Generic.Ordem5_var11','Generic.Ordem5_var9','Generic.Ordem6_horas_motor_principal','Generic.Ordem6_ne_final','Generic.Ordem6_ne_real','Generic.Ordem6_Potência Instantânea','Generic.Ordem6_quantidade_jogo','Generic.Ordem6_quantidade_ordem','Generic.Ordem6_torcao','Generic.Ordem6_var10','Generic.Ordem6_var11','Generic.Ordem6_var9','Generic.OrdemAtual1_horas_motor_principal','Generic.OrdemAtual1_ne_final','Generic.OrdemAtual1_ne_real','Generic.OrdemAtual1_Potência Instantânea','Generic.OrdemAtual1_quantidade_jogo','Generic.OrdemAtual1_quantidade_ordem','Generic.OrdemAtual1_torcao','Generic.OrdemAtual1_var10','Generic.OrdemAtual1_var11','Generic.OrdemAtual1_var9','Generic.OrdemAtual2_horas_motor_principal','Generic.OrdemAtual2_ne_final','Generic.OrdemAtual2_ne_real','Generic.OrdemAtual2_Potência Instantânea','Generic.OrdemAtual2_quantidade_jogo','Generic.OrdemAtual2_quantidade_ordem','Generic.OrdemAtual2_torcao','Generic.OrdemAtual2_var10','Generic.OrdemAtual2_var11','Generic.OrdemAtual2_var9','Generic.OrdemAtual3_horas_motor_principal','Generic.OrdemAtual3_ne_final','Generic.OrdemAtual3_ne_real','Generic.OrdemAtual3_Potência Instantânea','Generic.OrdemAtual3_quantidade_jogo','Generic.OrdemAtual3_quantidade_ordem','Generic.OrdemAtual3_torcao','Generic.OrdemAtual3_var10','Generic.OrdemAtual3_var11','Generic.OrdemAtual3_var9','Generic.OrdemAtual4_horas_motor_principal','Generic.OrdemAtual4_ne_final','Generic.OrdemAtual4_ne_real','Generic.OrdemAtual4_Potência Instantânea','Generic.OrdemAtual4_quantidade_jogo','Generic.OrdemAtual4_quantidade_ordem','Generic.OrdemAtual4_torcao','Generic.OrdemAtual4_var10','Generic.OrdemAtual4_var11','Generic.OrdemAtual4_var9','Generic.Variaveis_Torcao','Generic.Variaveis_VelFusos','Generic.Variaveis_VelSaida']

/*
function SetEvento(callback) {
    let stack = [];
    let node_ID = ''; 
    let node_ID_obj = null; 
    array_nodes.forEach(element => { 
        stack.push((callback) => {
            node_ID = inicio_node + element
           
            node_ID_obj =  {
                nodeId: node_ID
            }; 

            session.read(node_ID_obj).then((dataValue) => {
                data_obj = {
                    nodeId: node_ID_obj.nodeId,
                    value: dataValue.value.value, 
                    
                }
                valores_obtidos.push(data_obj)
                //console.log(valores_obtidos);
                return callback(); 
            }).catch((error) => {
                return callback(); 
            })
        })
    })

    async.waterfall(stack, () => {
        return callback(); 
    })
}

exports.Ler_eventos = function (callback) {
    connect().then(() => {
        ReadEvento((res) => {
              return callback (valores_obtidos)
        })
    });
}

*/