
var express = require('express')
var router = express.Router()
var controller = require('../controllers/riopele40_maquinas')

router.get('/', function (req, res) {
    controller.list(req, res);
})

module.exports = router