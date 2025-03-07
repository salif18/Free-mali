const express = require('express')
const router = express.Router()
const stripeController = require('../controllers/stripe')

router.post('/abonnement',stripeController)

module.exports= router