const Review = require('../models/ReviewModel') // Adjust the path to your Review model
const asyncHandler = require('express-async-handler')

exports.createReview = asyncHandler(async (req, res) => {
  const userId = req.body.userId
  const { voyageId, reviewMessage, rating } = req.body

  if (!voyageId || !reviewMessage || rating === undefined) {
    return res
      .status(400)
      .json({ message: 'Please provide voyageId, reviewMessage, and rating' })
  }

  // Validate rating (assuming a 1-5 scale)
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: 'Rating must be a number between 1 and 5' })
  }
  const newReview = new Review({
    user: userId,
    voyage: voyageId,
    reviewMessage,
    rating,
  })

  const savedReview = await newReview.save()

  res.status(201).json(savedReview)
})
exports.getReviewsByVoyageId = asyncHandler(async (req, res) => {
  const { voyageId } = req.params

  if (!voyageId) {
    return res.status(400).json({ message: 'Voyage ID is required' })
  }

  const reviews = await Review.find({ voyage: voyageId }).populate('user', [
    'firstName',
    'lastName',
  ])

  if (!reviews || reviews.length === 0) {
    return res.status(404).json({ message: 'No reviews found for this voyage' })
  }

  res.status(200).json({reviews,success:true})
})

