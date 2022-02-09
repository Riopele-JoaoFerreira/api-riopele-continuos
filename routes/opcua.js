
var express = require('express')
var router = express.Router()
var controller = require('../controllers/opcua')

router.get('/', function (req, res) {
    controller.ler_Eventos(req, res);
})

router.get('/s', function (req, res) {
    controller.set_eventos(req, res);
})

router.get('/c', function (req, res) {
    controller.cycle_eventos(req, res);
})

module.exports = router