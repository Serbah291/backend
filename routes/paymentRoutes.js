const express = require('express')

const { createPaymentIntent } = require('../services/paymentService') // Import de la nouvelle fonction

const router = express.Router() // create a new router  object

//router.post('/create-payment-intent', createPaymentIntent);

module.exports = router // export the router object
