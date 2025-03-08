const express = require('express')
const router = express.Router()
const orangeController = require('../controllers/orange_monney_controller')

router.post('/abonnement',orangeController.abonnePaiementMarchand)
router.post("/transfere",orangeController.TransfertAvecCommission)

module.exports= router