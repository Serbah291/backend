const mongoose = require('mongoose')

const promoCodeSchema = new mongoose.Schema(
  {
    nameOfCoupon: {
      type: String,
      required: true,
      unique: true,
    },
    expirationDateCoupon: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

const PromoCode = mongoose.model('PromoCode', promoCodeSchema)

module.exports = PromoCode
