const asyncHandler = require('express-async-handler')
const VoyageModel = require('../models/voyageModel') // Vérifie bien que le fichier existe
const ReviewModel = require('../models/ReviewModel') // Vérifie bien que le fichier existe

// Fonction pour créer un voyage
exports.createVoyage = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès refusé' })
  }

  const {
    name,
    category,
    price,
    description,
    agence,
    placesDisponibles,
    dateDepart,
    photo,
    isPopular,
    isSpecialOffer,
    rating,
    smallDescription,
    city,
    country,
  } = req.body

  if (
    name === undefined || name === '' || 
    category === undefined || name === '' || 
    price === undefined ||
    description === undefined ||  description === '' ||
    agence === undefined || agence === '' ||
    placesDisponibles === undefined ||
    dateDepart === undefined ||
    photo === undefined || photo === '' ||
    isPopular === undefined ||
    !isSpecialOffer === undefined ||
    rating === undefined ||
    smallDescription === undefined || smallDescription === '' ||
    city === undefined || city === '' ||
    country === undefined || country === ''
  ) {
    return res
      .status(400)
      .json({ success: false, message: 'Tous les champs sont requis' });
  }
 // Validation du rating si présent
 if (rating && (rating < 0 || rating > 5)) {
  return res.status(400).json({ success: false, message: 'Le rating doit être entre 0 et 5' });
}
  const voyage = await VoyageModel.create({
    name,
    category,
    price,
    description,
    agence,
    placesDisponibles,
    dateDepart,
    photo,
    isPopular,
    isSpecialOffer,
    rating,
    smallDescription,
    city,
    country,
  })

  res.status(201).json({ success: true, data: voyage })
})
exports.getAllVoyages = asyncHandler(async (req, res) => {
  const { startDate, endDate, rating } = req.query

  const filter = {}

  // Date filtering
  if (startDate || endDate) {
    filter.dateDepart = {}
    if (startDate) filter.dateDepart.$gte = new Date(startDate)
    if (endDate) filter.dateDepart.$lte = new Date(endDate)
  }

  // Fetch voyages with category populated
  let voyages = await VoyageModel.find(filter)
    .populate('category')
    .sort('-placesDisponibles')

  // Get all reviews for current voyages
  const voyageIds = voyages.map((v) => v._id)
  const reviews = await ReviewModel.find({ voyage: { $in: voyageIds } })

  // Calculate average ratings per voyage
  const ratingMap = {}
  reviews.forEach((review) => {
    const id = review.voyage.toString()
    if (!ratingMap[id]) ratingMap[id] = []
    ratingMap[id].push(review.rating)
  })

  // Attach average rating to each voyage
  voyages = voyages.map((voyage) => {
    const ratings = ratingMap[voyage._id.toString()] || []
    const avg =
      ratings.length > 0
        ? Number(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          )
        : null
    return {
      ...voyage._doc,
      averageRating: avg,
    }
  })

  // Filter by rating if needed
  if (rating) {
    voyages = voyages.filter(
      (v) =>
        v.averageRating !== null &&
        v.averageRating >= Number(rating) &&
        v.averageRating < Number(rating) + 1
    )
  }

  res.status(200).json({ success: true, count: voyages.length, data: voyages })
})

exports.getVoyageById = asyncHandler(async (req, res) => {
  const voyage = await VoyageModel.findById(req.params.id).populate('category')

  if (!voyage) {
    return res
      .status(404)
      .json({ success: false, message: 'Voyage non trouvé' })
  }

  // Get all reviews for the current voyage
  const reviews = await ReviewModel.find({ voyage: req.params.id })

  // Calculate average rating
  const ratings = reviews.map((review) => review.rating)
  const avg =
    ratings.length > 0
      ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : null

  res.status(200).json({
    success: true,
    data: { ...voyage._doc, reviews, averageRating: avg },
  })
})
exports.updateVoyage = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès refusé' })
  }

  const voyage = await VoyageModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!voyage) {
    return res
      .status(404)
      .json({ success: false, message: 'Voyage non trouvé' })
  }
  res.status(200).json({ success: true, data: voyage })
})
exports.deleteVoyage = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès refusé' })
  }

  const voyage = await VoyageModel.findByIdAndDelete(req.params.id)
  if (!voyage) {
    return res
      .status(404)
      .json({ success: false, message: 'Voyage non trouvé' })
  }
  res.status(200).json({ success: true, data: {} })
})

// Obtenir les voyages populaires
exports.getPopularVoyages = asyncHandler(async (req, res) => {
   // Filtrer uniquement par voyages populaires
 
   const voyages = await VoyageModel.find({ isPopular: true }).populate('category');
  
  

  res.status(200).json({ success: true, count: voyages.length, data: voyages });
});

// Obtenir les offres spéciales
exports.getSpecialOffers = asyncHandler(async (req, res) => {
  
 // Filtrer uniquement par offres spéciales
 const voyages = await VoyageModel.find({ isSpecialOffer: true }).populate('category');
  res.status(200).json({ success: true, count: voyages.length, data: voyages });
});
