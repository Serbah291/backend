const mongoose = require('mongoose')

const userCouponSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode',
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Ensure a user can't have the same coupon multiple times
userCouponSchema.index({ userId: 1, couponId: 1 }, { unique: true })

const UserCoupon = mongoose.model('UserCoupon', userCouponSchema)

module.exports = UserCoupon