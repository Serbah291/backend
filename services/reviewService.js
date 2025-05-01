const Review = require('../models/ReviewModel') // Adjust the path to your Review model
const asyncHandler = require('express-async-handler')

exports.createReview = asyncHandler(async (req, res) => {
  const userId = req.user.id
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
