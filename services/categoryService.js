const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const CategoryModel = require('../models/categoryModel')
const VoyageModel = require('../models/voyageModel') // Import du modèle Voyage

exports.createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name
  const category = await CategoryModel.create({
    // create a new category document in the database using the CategoryModel schema and the data provided in the request body
    name: name,
    slug: slugify(name),
  })

  res.status(201).json({ data: category }) // send the newly created category document as a response
})
// Fonction pour récupérer toutes les catégories
exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryModel.find() // Récupère toutes les catégories depuis MongoDB
  res.status(200).json({ success: true, data: categories }) // Retourne les catégories sous format JSON
})

//  Fonction pour récupérer les voyages d'une catégorie spécifique par le id de category
exports.getVoyagesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params

  // Vérifier si la catégorie existe par son id
  const category = await CategoryModel.findById(categoryId)
  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: 'Catégorie non trouvée' })
  }

  // Récupérer les voyages de cette catégorie
  const voyages = await VoyageModel.find({ category: categoryId }).populate(
    'category'
  )

  res.status(200).json({
    success: true,
    count: voyages.length,
    data: voyages,
  })
})
// Fonction pour récupérer les voyages selon le **nom** de la catégorie
exports.getVoyagesByCategoryName = asyncHandler(async (req, res) => {
  const { categoryName } = req.params

  // Trouver la catégorie par son nom (insensible à la casse)
  const category = await CategoryModel.findOne({
    name: { $regex: new RegExp('^' + categoryName + '$', 'i') },
  })

  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: 'Catégorie non trouvée' })
  }

  // Récupérer les voyages de cette catégorie
  const voyages = await VoyageModel.find({ category: category._id }).populate(
    'category'
  )

  res.status(200).json({
    success: true,
    count: voyages.length,
    data: voyages,
  })
})
// Supprimer une catégorie par son nom
exports.deleteCategoryByName = asyncHandler(async (req, res) => {
  const { categoryName } = req.params

  // Vérifier si la catégorie existe (insensible à la casse)
  const category = await CategoryModel.findOne({
    name: { $regex: new RegExp('^' + categoryName + '$', 'i') },
  })

  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: 'Catégorie non trouvée' })
  }

  // Supprimer la catégorie
  await CategoryModel.deleteOne({ _id: category._id })

  res.status(200).json({
    success: true,
    message: `Catégorie '${categoryName}' supprimée avec succès`,
  })
})
