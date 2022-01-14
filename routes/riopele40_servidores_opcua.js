
var express = require('express')
var router = express.Router()
var controller = require('../controllers/riopele40_servidores_opcua')
const middlewares = require('../utilities/middlewares')

var validation = function(req, res, next) {
    middlewares.verifyIP(req, res, next)
}

router.get('/', [validation], function (req, res) {
    controller.list(req, res);
})

router.get('/raw', [validation], function (req, res) {
    controller.listRaw(req, res);
})

module.exports = router