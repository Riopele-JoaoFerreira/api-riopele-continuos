
var express = require('express')
var router = express.Router()
var controller = require('../controllers/status')

router.get('/:section/',
  function (req, res) {
    controller.getAllStatus(req, res);
})

router.get('/:section/:id',
  function (req, res) {
    controller.getAllStatus(req, res);
})

module.exports = router