const OfferModel = require('../models/offerModel')
const asyncHandler = require('express-async-handler')

exports.createOffer = asyncHandler(async (req, res) => {
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ success: false, message: 'Unauthorized' })
  // }
  const offer = await OfferModel.create({
    ...req.body,
  })

  res.status(201).json({ data: offer })
})

exports.getAllOffers = asyncHandler(async (req, res) => {
  const offers = await OfferModel.find().sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: offers })
})

exports.getOfferById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const offer = await OfferModel.findById(id)
  if (!offer) {
    return res.status(404).json({ success: false, message: 'Offer not found' })
  }
  res.status(200).json({ success: true, data: offer })
})

exports.updateOffer = asyncHandler(async (req, res) => {
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ success: false, message: 'Unauthorized' })
  // }
  const { id } = req.params
  const offer = await OfferModel.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true } // runValidators: true ensures that the updated data is validated against the schema
  )
  if (!offer) {
    return res.status(404).json({ success: false, message: 'Offer not found' })
  }
  res.status(200).json({ success: true, data: offer }) // send the updated offer as a response
})

exports.deleteOffer = asyncHandler(async (req, res) => {
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ success: false, message: 'Unauthorized' })
  // }
  const { id } = req.params
  const offer = await OfferModel.findByIdAndDelete(id)
  if (!offer) {
    return res.status(404).json({ success: false, message: 'Offer not found' })
  }
  res.status(200).json({ success: true, message: 'Offer deleted successfully' })
})
