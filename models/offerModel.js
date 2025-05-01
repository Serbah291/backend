const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: true,
    },
    // destinationLattitude: {
    //   type: Number,
    //   required: true,
    // },
    // destinationLongitude: {
    //   type: Number,
    //   required: true,
    // },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.2,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
)

const Offer = mongoose.model('Offer', offerSchema)

module.exports = Offer
