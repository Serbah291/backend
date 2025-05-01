const express = require('express')
const { createReview } = require('../services/reviewService')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// Route pour créer un voyage
router.post('/', createReview)

module.exports = router
