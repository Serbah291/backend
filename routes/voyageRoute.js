const express = require('express')
const {
  createVoyage,
  getAllVoyages,
  getVoyageById,
  updateVoyage,
  deleteVoyage,
  getPopularVoyages,
  getSpecialOffers,
} = require('../services/voyageService')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()

//  Routes pour la Landing Page
router.get('/filters/popular', getPopularVoyages);//obtenir les voyage populaires 
router.get('/filters/special-offers', getSpecialOffers);// obtenir les offres spéciales 


//  CRUD des voyages
// Route pour créer un voyage
router.post('/', protect, createVoyage)
// Route pour récupérer tous les voyages (GET)
router.get('/', getAllVoyages)
// Route pour récupérer un voyage par ID (GET)
router.get('/:id', getVoyageById)
// Route pour mettre à jour un voyage (PUT)
router.put('/:id', protect, updateVoyage)
// Route pour supprimer un voyage (DELETE)
router.delete('/:id', protect, deleteVoyage)

module.exports = router
