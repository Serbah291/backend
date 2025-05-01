const express = require('express')

const {
  createCategory,
  getVoyagesByCategory,
  getAllCategories,
  getVoyagesByCategoryName,
  deleteCategoryByName,
} = require('../services/categoryService') // Import de la nouvelle fonction

const router = express.Router() // create a new router  object

router
  .route('/')
  .post(createCategory) // create a new category using the createCategory function when a POST request is made to the / route
  .get(getAllCategories) // <-- Ajout de la route GET pour récupérer toutes les catégories
//  Route pour récupérer les voyages d'une catégorie par **ID** spécifique
router.get('/:categoryId/voyages', getVoyagesByCategory)

// Route pour récupérer les voyages par **Nom** de catégorie (nouvelle méthode)
router.get('/voyages/:categoryName', getVoyagesByCategoryName)

// Supprimer une catégorie par son **Nom**
router.delete('/delete/:categoryName', deleteCategoryByName)

module.exports = router // export the router object
