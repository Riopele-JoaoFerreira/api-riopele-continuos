
var express = require('express')
var router = express.Router()
const { body, validationResult } = require('express-validator');
var controller = require('../controllers/riopele40_ordens')

router.post('/',
  body('id').notEmpty().isNumeric(), 
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    controller.updateTable(req, res);
})

router.post('/running',
  body('id').notEmpty().isNumeric(), 
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    controller.updateRunningTable(req, res);
})

module.exports = router