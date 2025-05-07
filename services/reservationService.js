const mongoose = require('mongoose')
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('express-async-handler')
const Reservation = require('../models/reservationModel')
const User = require('../models/UserModel')

exports.createReservation = asyncHandler(async (req, res) => {
  try {
    const {
      voyage,
      paymentMethodType,
      adults,
      jeunes,
      nourrissons,
      prixTotal,
    } = req.body

    // Vérification des champs obligatoires
    if (
      !voyage ||
      !paymentMethodType ||
      adults == null ||
      jeunes == null ||
      nourrissons == null ||
      prixTotal == null
    ) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires',
      })
    }

    // Création d'un PaymentIntent avec Stripe
    //  const paymentIntent = await stripe.paymentIntents.create({
    //      amount: prixTotal, // Montant en centimes
    //     currency: 'usd',
    //     payment_method_types: [paymentMethodType],
    // });

    // Création de la réservation sans dateRéservation (elle sera définie automatiquement)
    const newReservation = await Reservation.create({
      client: req.user.id,
      voyage,
      paymentMethodType,
      adults,
      jeunes,
      nourrissons,
      prixTotal,
      //  paymentIntentId: paymentIntent.id, // Stockage de l'ID du PaymentIntent
    })

    res.status(201).json({
      success: true,
      data: newReservation,
      //  clientSecret: paymentIntent.client_secret, // Envoi du clientSecret au client
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Fonction pour récupérer toutes les réservations (accessible par l'admin)
//Invoke-RestMethod -Uri "http://localhost:9000/api/v1/reservations" -Method Get | ConvertTo-Json -Depth 10
exports.getReservationById = asyncHandler(async (req, res) => {
  const { reservationId } = req.params
  // Vérifier si l'ID est valide
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return res
      .status(400)
      .json({ success: false, message: 'ID de réservation invalide' })
  }
  // Vérifier si la réservation existe
  const reservation = await Reservation.findById(
    reservationId
  )
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: 'Réservation non trouvée' })
  }
  // Vérifier que l'utilisateur est bien celui qui a effectué la réservation
  // (Si l'utilisateur est stocké dans `req.user` après authentification)
  if (req.user && reservation.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Vous n'avez pas le droit de voir cette réservation",
    })
  }
  // Récupérer les détails de la réservation
  const reservationDetails = await Reservation.findById(reservation
    ._id)
    .populate({ path: 'client', select: 'firstName lastName email' }) // Afficher les infos du client
    .populate({ path: 'voyage', select: 'name category price' }) // Afficher les infos du voyage
    .lean() // Permet d'obtenir des objets JSON purs
  console.log(
    'Réservation avec populate :',
    JSON.stringify(reservationDetails, null, 2)
  ) // Affichage propre
  res.status(200).json({
    success: true,
    data: reservationDetails,
  })
  // res.status(200).json({ success: true, data: reservation })
})
// Récupérer toutes les réservations



exports.getAllReservations = asyncHandler(async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate({ path: 'client', select: 'firstName lastName email' }) // Afficher les infos du client
      .populate({ path: 'voyage', select: 'name category price' }) // Afficher les infos du voyage
      .lean() // Permet d'obtenir des objets JSON purs

    console.log(
      'Réservations avec populate :',
      JSON.stringify(reservations, null, 2)
    ) // Affichage propre

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    })
  } catch (error) {
    console.error('Erreur API:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

exports.getReservationCountByPeriod = asyncHandler(async (req, res) => {
  // Récupération des dates depuis la requête (query params)
  // Invoke-RestMethod -Uri "http://localhost:9000/api/v1/reservations/stats/reservations?startDate=2025-01-01&endDate=2025-04-30" -Method Get | ConvertTo-Json -Depth 10
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir startDate et endDate',
    })
  }

  // Convertir les chaînes en objets Date
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) {
    return res
      .status(400)
      .json({ success: false, message: 'startDate doit être avant endDate' })
  }

  // Rechercher le nombre de réservations entre ces deux dates
  const count = await Reservation.countDocuments({
    dateRéservation: { $gte: start, $lte: end },
  })

  res.status(200).json({
    success: true,
    totalReservations: count,
  })
})
// b. Retourne les destinations les plus réservées
exports.getPopularDestinations = asyncHandler(async (req, res) => {
  const popular = await Reservation.aggregate([
    // Grouper par l'identifiant du voyage et compter le nombre de réservations
    { $group: { _id: '$voyage', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    // Effectuer une jointure avec la collection "voyages" pour obtenir le nom du voyage (la destination)
    {
      $lookup: {
        from: 'voyages', // Nom de la collection (en minuscule et pluriel par défaut)
        localField: '_id',
        foreignField: '_id',
        as: 'voyage',
      },
    },
    { $unwind: '$voyage' },
    {
      $project: {
        _id: 0,
        voyageId: '$voyage._id',
        voyageName: '$voyage.name',
        reservations: '$count',
      },
    },
  ])
  res.status(200).json({ success: true, data: popular })
})

//  Récupérer le nombre total de clients ayant un compte
exports.getTotalClientsByPeriod = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir startDate et endDate',
    })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) {
    return res
      .status(400)
      .json({ success: false, message: 'startDate doit être avant endDate' })
  }

  // Vérifier combien de ces clients ont un compte User
  const totalClients = await User.countDocuments({
    createdAt: { $gte: start, $lte: end },
  })
  res.status(200).json({
    success: true,
    totalClients,
  })
})

//  Récupérer le revenu total pendant une période donnée
exports.getTotalRevenueByPeriod = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir startDate et endDate',
    })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) {
    return res
      .status(400)
      .json({ success: false, message: 'startDate doit être avant endDate' })
  }

  // Agrégation pour calculer le revenu total pendant cette période
  const revenueResult = await Reservation.aggregate([
    {
      $match: {
        dateRéservation: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$prixTotal' },
      },
    },
  ])

  res.status(200).json({
    success: true,
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
  })
})

exports.getTotalBalance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir startDate et endDate',
    })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  const balanceResult = await Reservation.aggregate([
    {
      $match: {
        dateRéservation: { $gte: start, $lte: end },
        status: 'paid', // 🔥 Ne prendre que les réservations payées
      },
    },
    {
      $group: {
        _id: null,
        totalBalance: { $sum: '$prixTotal' },
      },
    },
  ])

  res
    .status(200)
    .json({ success: true, totalBalance: balanceResult[0]?.totalBalance || 0 })
})
//Invoke-RestMethod -Uri "http://localhost:9000/api/v1/reservations/total-balance?startDate=2025-03-01&endDate=2025-03-30" -Method Get | ConvertTo-Json -Depth 10

// Supprimer une réservation
exports.deleteReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params
  // Vérifier si l'ID est valide
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return res
      .status(400)
      .json({ success: false, message: 'ID de réservation invalide' })
  }

  // Vérifier si la réservation existe
  const reservation = await Reservation.findById(reservationId)

  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: 'Réservation non trouvée' })
  }

  // Vérifier que l'utilisateur est bien celui qui a effectué la réservation
  // (Si l'utilisateur est stocké dans `req.user` après authentification)
  if (req.user && reservation.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Vous n'avez pas le droit de supprimer cette réservation",
    })
  }

  // Supprimer la réservation
  await Reservation.findByIdAndDelete(reservationId)

  res
    .status(200)
    .json({ success: true, message: 'Réservation supprimée avec succès' })
})

exports.confirmReservationStatus = asyncHandler(async (req, res) => {
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ success: false, message: 'Unothorized' })
  // }
  const { reservationId } = req.body
  if (!reservationId) {
    return res
      .status(400)
      .json({ success: false, message: 'Veuillez fournir id de reservation' })
  }

  try {
    const reservation = await Reservation.findById(reservationId)
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: 'Reservation not found' })
    }

    reservation.status = 'confirmed'
    await reservation.save()

    res.status(200).json({ success: true, message: 'Reservation confirmed' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

exports.cancelReservationStatus = asyncHandler(async (req, res) => {
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ success: false, message: 'Unothorized' })
  // }
  const { reservationId } = req.body
  if (!reservationId) {
    return res
      .status(400)
      .json({ success: false, message: 'Veuillez fournir id de reservation' })
  }

  try {
    const reservation = await Reservation.findById(reservationId)
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: 'Reservation not found' })
    }

    reservation.status = 'cancelled'
    await reservation.save()

    res.status(200).json({ success: true, message: 'Reservation confirmed' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

exports.getReservationHistory = asyncHandler(async (req, res) => {
  try {
    // if (req.user.role !== 'manager') {
    //   return res.status(403).json({ success: false, message: 'Unothorized' })
    // }
    const { startDate, endDate } = req.query
    console.log(startDate, endDate)
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir startDate et endDate',
      })
    }
    const reservations = await Reservation.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate({ path: 'client', select: 'firstName lastName email' })
      .populate({ path: 'voyage', select: 'name category price' })
      .sort({ createdAt: -1 })
    console.log(reservations)
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    })
  } catch (error) {
    console.error('Erreur API:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})
