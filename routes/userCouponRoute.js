const express = require('express')
const router = express.Router()
const userCouponController = require('../services/userCouponController')
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware') // Adjust path as needed

// ➤ Assign a coupon to a user (Admin/Manager only)
router.post('/assign', 
  userCouponController.assignCoupon
)

// ➤ Get all coupons for a specific user
router.get('/user/:userId',   userCouponController.getUserCoupons
)

// ➤ Get available coupons for a specific user
router.get('/user/:userId/available',   userCouponController.getAvailableUserCoupons
)

// ➤ Get all users with their coupon statistics (Admin/Manager only)
router.get('/users-with-coupons', 
  userCouponController.getAllUsersWithCoupons
)

// ➤ Mark a coupon as used
router.patch('/use',   userCouponController.useCoupon
)

// ➤ Remove a coupon from a user (Admin/Manager only)
router.delete('/remove', 
  userCouponController.removeCouponFromUser
)

module.exports = router