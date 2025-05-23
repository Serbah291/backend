const UserCoupon = require('../models/userCouponModel')
const User = require('../models/UserModel')
const PromoCode = require('../models/CodePromo')

// Assign a coupon to a user
const assignCouponToUser = async (userId, couponId) => {
  try {
    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found.')
    }

    // Check if coupon exists
    const coupon = await PromoCode.findById(couponId)
    if (!coupon) {
      throw new Error('Coupon not found.')
    }

    // Check if coupon is still valid
    if (new Date() > coupon.expirationDateCoupon) {
      throw new Error('Coupon has expired.')
    }

    // Check if user already has this coupon
    const existingUserCoupon = await UserCoupon.findOne({ userId, couponId })
    if (existingUserCoupon) {
      throw new Error('User already has this coupon.')
    }

    // Create new user coupon
    const newUserCoupon = new UserCoupon({
      userId,
      couponId,
    })

    await newUserCoupon.save()

    // Populate the coupon details
    await newUserCoupon.populate('couponId')

    return {
      message: 'Coupon assigned successfully.',
      userCoupon: newUserCoupon,
    }
  } catch (error) {
    throw error
  }
}

// Get all coupons for a specific user
const getUserCoupons = async (userId) => {
  try {
    const userCoupons = await UserCoupon.find({ userId })
      .populate('couponId')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })

    return userCoupons
  } catch (error) {
    throw error
  }
}

// Get all users with their assigned coupons
const getAllUsersWithCoupons = async () => {
  try {
    const usersWithCoupons = await UserCoupon.aggregate([
      {
        $group: {
          _id: '$userId',
          totalCoupons: { $sum: 1 },
          usedCoupons: {
            $sum: { $cond: ['$isUsed', 1, 0] }
          },
          availableCoupons: {
            $sum: { $cond: ['$isUsed', 0, 1] }
          },
          coupons: {
            $push: {
              couponId: '$couponId',
              isUsed: '$isUsed',
              usedAt: '$usedAt',
              assignedAt: '$assignedAt'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userId: '$_id',
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          email: '$userInfo.email',
          totalCoupons: 1,
          usedCoupons: 1,
          availableCoupons: 1,
          coupons: 1
        }
      }
    ])

    return usersWithCoupons
  } catch (error) {
    throw error
  }
}

// Mark a coupon as used
const useCoupon = async (userId, couponId) => {
  try {
    const userCoupon = await UserCoupon.findOne({ 
      userId, 
      couponId,
      isUsed: false 
    })

    if (!userCoupon) {
      throw new Error('Valid coupon not found for this user.')
    }

    userCoupon.isUsed = true
    userCoupon.usedAt = new Date()
    await userCoupon.save()

    return {
      message: 'Coupon used successfully.',
      userCoupon,
    }
  } catch (error) {
    throw error
  }
}

// Remove a coupon from a user
const removeCouponFromUser = async (userId, couponId) => {
  try {
    const deletedUserCoupon = await UserCoupon.findOneAndDelete({
      userId,
      couponId,
    })

    if (!deletedUserCoupon) {
      throw new Error('User coupon not found.')
    }

    return {
      message: 'Coupon removed from user successfully.',
    }
  } catch (error) {
    throw error
  }
}

// Get available coupons for a user (not expired, not used)
const getAvailableUserCoupons = async (userId) => {
  try {
    const userCoupons = await UserCoupon.find({ 
      userId,
      isUsed: false 
    })
      .populate({
        path: 'couponId',
        match: { expirationDateCoupon: { $gt: new Date() } }
      })
      .exec()

    // Filter out null couponId (expired coupons)
    const validCoupons = userCoupons.filter(uc => uc.couponId !== null)

    return validCoupons
  } catch (error) {
    throw error
  }
}

module.exports = {
  assignCouponToUser,
  getUserCoupons,
  getAllUsersWithCoupons,
  useCoupon,
  removeCouponFromUser,
  getAvailableUserCoupons,
}