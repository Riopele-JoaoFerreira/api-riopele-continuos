
var express = require('express')
var router = express.Router()
var controller = require('../controllers/riopele40_servidores_opcua')
const middlewares = require('../utilities/middlewares')
const { validationResult, body } = require('express-validator')

var validation = function(req, res, next) {
    middlewares.verifyIP(req, res, next)
}

router.get('/', [validation], function (req, res) {
    controller.list(req, res);
})

router.get('/raw', [validation], function (req, res) {
    controller.listRaw(req, res);
})

router.get('/read', [validation], function (req, res) {
    controller.readOPCUA(req, res);
})

router.get('/write', [validation], function (req, res) {
    controller.writeOPCUA(req, res);
})

// POST EXAMPLE
/*router.post('/', [
    body('field').notEmpty().isBoolean().isEmail().isNumeric().isString().isArray().optional() // Validations Examples
], [validation], function (req, res) {
    const errors = validationResult(req); 
    if (errors.isEmpty()) {
        // Continue
    } else {
        res.status(400).json({errors: errors.array()})
    }
})*/

module.exports = router