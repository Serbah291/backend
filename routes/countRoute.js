const express = require('express')
const {

  getAllUsersWithReservationCount,
} = require('../services/userService')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()


router.get('/', getAllUsersWithReservationCount)


module.exports = router
