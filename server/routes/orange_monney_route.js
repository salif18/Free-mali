const express = require('express')
const router = express.Router()
const orangeController = require('../controllers/orange_monney_controller')

router.post('/abonnement',orangeController.PayeOrange)

module.exports= router