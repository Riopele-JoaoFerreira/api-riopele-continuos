
var express = require('express')
var router = express.Router()
var controller = require('../controllers/opcua')

// Read Eventos
router.get('/', function (req, res) {
    controller.ler_Eventos(req, res);
})

// Set Eventos
router.get('/s', function (req, res) {
    controller.set_eventos(req, res);
})

// Cycle Eventos 
router.get('/c', function (req, res) {
    controller.cycle_eventos(req, res);
})

// Set Table Ordem (set ordens no painel)
router.get('/st', function (req, res) {
    controller.set_table_ordem(req, res);
})

// Set Ordem (recebe 3 e escreve na 3ª ordem)
router.get('/so', function (req, res) {
    controller.set_ordem(req, res);
})

// Data e hora de último evento (selecionado)
router.get('/dh', function (req, res) {
    controller.data_hora(req, res);
})


router.get('/z', function (req, res) {
    controller.cycle2(req, res);
})


module.exports = router