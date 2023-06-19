const soap_config = require('../config/soap').soap
const config = require('../config/config').config
const soap = require("soap");
const Parametro = require("../models/parametros");
const Motivos_Paragem = require('../models/riopele40_motivos_paragem');
const { Op } = require('sequelize');

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
