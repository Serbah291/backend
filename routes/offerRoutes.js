const express = require('express')
const router = express.Router()

const {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
} = require('../services/offerService')
const { protect } = require('../middleware/authMiddleware')

router.post('/',  createOffer)
router.get('/', getAllOffers)
router.get('/:id', getOfferById)
router.put('/:id', updateOffer)
router.delete('/:id', deleteOffer)

module.exports = router // export the router object
