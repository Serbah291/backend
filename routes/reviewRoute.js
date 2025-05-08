const express = require('express')
const { createReview, getReviewsByVoyageId } = require('../services/reviewService')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// Route pour créer un voyage
router.post('/', createReview)
router.get('/:voyageId', protect, getReviewsByVoyageId)

module.exports = router
