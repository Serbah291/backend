const express = require('express')
const router = express.Router()
const {
  createReservation,
  getAllReservations,
  getReservationCountByPeriod,
  getPopularDestinations,
  getTotalClientsByPeriod,
  getTotalRevenueByPeriod,
  getTotalBalance,
  deleteReservation,
  confirmReservationStatus,
  cancelReservationStatus,
  getReservationHistory,
  getReservationById,
} = require('../services/reservationService')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, createReservation) // Route pour ajouter une réservation
router.get('/:reservationId', protect, getReservationById) // Route pour récupérer une réservation par ID
// Route pour récupérer toutes les réservations (GET)
router.get('/', getAllReservations)

// Route pour obtenir le nombre de réservations sur une période donnée
// Exemple : GET /api/v1/reservations/stats/reservations?startDate=2025-01-01&endDate=2025-03-01
router.get('/stats/reservations', getReservationCountByPeriod)

// Route pour obtenir les destinations les plus réservées
router.get('/stats/popular-destinations', getPopularDestinations)

router.get('/stats/totalClientsByPeriod', getTotalClientsByPeriod) //Invoke-RestMethod -Uri "http://localhost:9000/api/v1/reservations/stats/totalClientsByPeriod?startDate=2025-01-01&endDate=2025-03-30" -Method Get | ConvertTo-Json -Depth 10

router.get('/stats/totalRevenueByPeriod', getTotalRevenueByPeriod)
//Invoke-RestMethod -Uri "http://localhost:9000/api/v1/reservations/stats/totalRevenueByPeriod?startDate=2025-01-01&endDate=2025-03-30" -Method Get | ConvertTo-Json -Depth 10

router.get('/stats/total-balance', getTotalBalance)
router.delete('/:reservationId', deleteReservation)
router.post('/confirm', protect, confirmReservationStatus)
router.post('/cancel', protect, cancelReservationStatus)
router.get('/history', protect, getReservationHistory)


module.exports = router
