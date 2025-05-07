const express = require('express')
const router = express.Router()
const {

  getReservationHistory,

} = require('../services/reservationService')
const { protect } = require('../middleware/authMiddleware')
router.get('/history', protect,getReservationHistory)
module.exports = router
