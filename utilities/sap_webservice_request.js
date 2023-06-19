const soap_config = require('../config/soap').soap
const config = require('../config/config').config
const soap = require("soap");
const Parametro = require("../models/parametros");
const Motivos_Paragem = require('../models/riopele40_motivos_paragem');
const { Op } = require('sequelize');
const connection = require('../utilities/connection').connection
const Eventos = require('../models/riopele40_eventos')

exports.sapSecurity = () => {
    return 'Basic ' + new Buffer.from(soap_config.username + ':' + soap_config.password).toString('base64');
}

exports.enviar_lista_eventos = (callback) => {
    Parametro.findOne({
        where: {
            parametro: 'webservice_riopele40_fiacao_ordens'
        }
    }).then((res) => {
        let url = res.valor;
        let sapSecurity = this.sapSecurity()
        soap
        .createClientAsync(url, { wsdl_headers: { Authorization: sapSecurity } })
            .then(async (client) => {
                client.setSecurity(
                    new soap.BasicAuthSecurity(
                        soap_config.username,
                        soap_config.password
                    )
                );

                let motivos_paragem_fiacao_b = await Motivos_Paragem.findAll({
                    where: {
                        [Op.and]:  {
                            id_seccao: config.seccao_fiacao_b, 
                            tipo: "EV"
                        }
                    },
                    attributes: ['cod_evento', 'designacao']
                })

                let lista = []

                motivos_paragem_fiacao_b.forEach(motivo => {
                    lista.push(
                        {
                            Mandt: '',
                            Interface: 'F',
                            Codigo: motivo.cod_evento,
                            Descricao: motivo.designacao,
                            Tipo: ''
                        }
                    )
                });

                client.ZPpMonitListaEventos(
                    {
                      Interface: "F",
                      TabEventos: { item: lista },
                    },
                    (err, result) => {}
                )

                let motivos_paragem_olifil = await Motivos_Paragem.findAll({
                    where: {
                        [Op.and]:  {
                            id_seccao: config.seccao_olifil, 
                            tipo: "EV"
                        }
                    },
                    attributes: ['cod_evento', 'designacao']
                })

                let lista_olifil = []

                motivos_paragem_olifil.forEach(motivo => {
                    lista_olifil.push(
                        {
                            Mandt: '',
                            Interface: 'O',
                            Codigo: motivo.cod_evento,
                            Descricao: motivo.designacao,
                            Tipo: ''
                        }
                    )
                });

                client.ZPpMonitListaEventos(
                    {
                      Interface: "O",
                      TabEventos: { item: lista_olifil },
                    },
                    (err, result) => {}
                )
        }).catch((err) => {
            console.log(err);
        })
    }).catch((err) => {
        console.log(err);
    })
}

exports.enviar_evento = (callback) => {
    Parametro.findOne({
        where: {
            parametro: 'webservice_riopele40_fiacao_ordens'
        }
    }).then((res) => {
        let url = res.valor;
        let sapSecurity = this.sapSecurity()
        soap
        .createClientAsync(url, { wsdl_headers: { Authorization: sapSecurity } })
            .then(async (client) => {
                client.setSecurity(
                    new soap.BasicAuthSecurity(
                        soap_config.username,
                        soap_config.password
                    )
                );

                Eventos.findAll({
                    where: {
                        [Op.and] : {
                            id_seccao: config.seccao_fiacao_b, 
                            data_fim: {
                                [Op.ne]: null
                            },
                            enviou_para_sap: 'N'
                        }
                    }
                }).then((list) => {
                    let lista_eventos_enviar = []
                    list.forEach(async (evento) => {

                        let info_motivo = await Motivos_Paragem.findOne({
                            where: {
                                [Op.and]: {
                                    id_seccao: info_evento.id_seccao, 
                                    cod_paragem: info_evento.cod_estado
                                }
                            },
                            attributes: ['e_paragem']
                        })

                        data_inicio_sap = evento.data_inicio.substr(0, 10);
                        hora_inicio_sap = evento.data_inicio.substr(11);
                        data_fim_sap = evento.data_fim.substr(0, 10);
                        hora_fim_sap = evento.data_fim.substr(11);

                        let info_ordem = await connection.query("select top 1 ordem from riopele40_ordem_maquinas where id in (select id_ordem_maquina from riopele40_ordens_planeadas where estado > 0 and data_inicio is not null and data_fim is null) and id_maquina in (select id from riopele40_maquinas where cod_maquina_fabricante = '"+info_evento.cod_maquina_fabricante+"')")

                        lista_eventos_enviar.push(
                            {
                                IdExt: evento.id,
                                Machine: evento.cod_maquina_fabricante,
                                Arbpl: evento.cod_sap,
                                Codigo: evento.cod_evento,
                                Estado: evento.cod_estado,
                                Paragem: info_motivo['e_paragem'],
                                DataIni: data_inicio_sap,
                                HoraIni: hora_inicio_sap, 
                                DataFim: data_fim_sap,
                                HoraFim: hora_fim_sap,
                                Aufnr: info_ordem[0][0]['ordem']
                            }
                        )
                    });
                })

               
        

                
              

                /*if(info_evento.id_seccao == config.seccao_fiacao_b) {
                    client.ZPpMonitRecebeEventos(
                        {
                            IWerks: 1000, 
                            Interface: "F",
                            TabEventos: { item: lista },
                        },
                        (err, result) => {
                            console.log(result);
                        }
                    )
                }

                if(info_evento.id_seccao == config.seccao_olifil) {
                    client.ZPpMonitRecebeEventos(
                        {
                            IWerks: 1000, 
                            Interface: "O",
                            TabEventos: { item: lista },
                        },
                        (err, result) => {
                            console.log(result);
                        }
                    )
                }*/

                console.log(lista_eventos_enviar);
        }).catch((err) => {
            console.log(err);
        })
    }).catch((err) => {
        console.log(err);
    })
}
