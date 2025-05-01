const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
  {
    reviewMessage: {
      type: String,
      required: [true, 'Review message cannot be empty.'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating must be at most 5.'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    voyage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voyage',
      required: [true, 'Review must belong to a voyage.'],
    },
  },
  { timestamps: true }
)

// Avoid OverwriteModelError
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema)

module.exports = Review
