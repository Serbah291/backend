const userCouponService = require('../services/userCouponService')

// ➤ Assign a coupon to a user
exports.assignCoupon = async (req, res) => {
  try {
    const { userId, couponId } = req.body

    if (!userId || !couponId) {
      return res.status(400).json({ 
        message: 'User ID and Coupon ID are required' 
      })
    }

    const result = await userCouponService.assignCouponToUser(userId, couponId)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ 
      message: 'Error assigning coupon to user', 
      error: error.message 
    })
  }
}

// ➤ Get all coupons for a specific user
exports.getUserCoupons = async (req, res) => {
  try {
    const { userId } = req.params
    const userCoupons = await userCouponService.getUserCoupons(userId)
    res.status(200).json(userCoupons)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user coupons', 
      error: error.message 
    })
  }
}

// ➤ Get all users with their coupon statistics
exports.getAllUsersWithCoupons = async (req, res) => {
  try {
    const usersWithCoupons = await userCouponService.getAllUsersWithCoupons()
    res.status(200).json(usersWithCoupons)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching users with coupons', 
      error: error.message 
    })
  }
}

// ➤ Mark a coupon as used
exports.useCoupon = async (req, res) => {
  try {
    const { userId, couponId } = req.body

    if (!userId || !couponId) {
      return res.status(400).json({ 
        message: 'User ID and Coupon ID are required' 
      })
    }

    const result = await userCouponService.useCoupon(userId, couponId)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ 
      message: 'Error using coupon', 
      error: error.message 
    })
  }
}

// ➤ Remove a coupon from a user
exports.removeCouponFromUser = async (req, res) => {
  try {
    const { userId, couponId } = req.body

    if (!userId || !couponId) {
      return res.status(400).json({ 
        message: 'User ID and Coupon ID are required' 
      })
    }

    const result = await userCouponService.removeCouponFromUser(userId, couponId)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ 
      message: 'Error removing coupon from user', 
      error: error.message 
    })
  }
}

// ➤ Get available coupons for a user
exports.getAvailableUserCoupons = async (req, res) => {
  try {
    const { userId } = req.params
    const availableCoupons = await userCouponService.getAvailableUserCoupons(userId)
    res.status(200).json(availableCoupons)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching available user coupons', 
      error: error.message 
    })
  }
}