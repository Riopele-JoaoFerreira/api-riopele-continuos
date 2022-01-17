
var express = require('express')
var router = express.Router()
var controller = require('../controllers/opcua')

router.get('/', function (req, res) {
    controller.lerEventos(req, res);
})

module.exports = router