const User = require('../models/UserModel')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
require('dotenv').config()
const crypto = require('crypto')
const generateToken = require('../middleware/jwtMiddleware')
const transporter = require('./emailService') // si c'est dans le même dossier (services/)
const Reservation = require('../models/reservationModel')
// Création d'un utilisateur
const createUser = async (userData) => {
  try {
    const { firstName, lastName, email, password, profilePicture } = userData

    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new Error('Email already in use.')
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Générer un token d’activation
    const activationToken = crypto.randomBytes(32).toString('hex')

    // Créer l'utilisateur
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePicture,
      role: 'user',
      activationToken,
    })

    //  Sauvegarder l'utilisateur avec le token
    await newUser.save()

    //  Envoyer l'email avec le lien d’activation
    const activationLink = `${process.env.CLIENT_URL}/api/v1/users/activate-account/${activationToken}`
    await transporter.sendMail({
      to: newUser.email,
      from: process.env.EMAIL_USER,
      subject: 'Activate Your Account',
      text: `Hello ${newUser.firstName}.Click this link to activate your account: ${activationLink}`,
    })

    return {
      message: 'User created successfully.Activation link sent to email.',
      email: newUser.email,
    }
  } catch (error) {
    throw error
  }
}

const activateAccount = async (token) => {
  try {
    const user = await User.findOne({ activationToken: token })

    if (!user) {
      throw new Error('Invalid or expired activation token.')
    }

    // Activer le compte
    user.isActive = true
    user.activationToken = null // Supprimer le token pour sécurité

    await user.save()

    return { message: 'Account successfully activated.' }
  } catch (error) {
    throw error
  }
}

const deactivateUser = async (userId) => {
  try {
    const user = await User.findById(userId)

    if (!user) {
      throw new Error('User not found.')
    }

    user.isActive = false
    await user.save()

    return { message: 'Account deactivated successfully.' }
  } catch (error) {
    throw error
  }
}

//Login User
const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('User not found.')
    }

    if (!user.isActive) {
      throw new Error('Please activate your account first.')
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Invalid password.')
    }
    const token = generateToken(user._id, user.role)

    // Ne pas renvoyer le mot de passe
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      role: user.role,
      token,
    }
  } catch (error) {
    throw error
  }
}

//Get me
const getUserInfo = async (id) => {
  try {
    const user = await User.findById(id)
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      role: user.role,
    }
  } catch (error) {
    throw error
  }
}

// Mise à jour du compte utilisateur
const updateUser = async (id, userData) => {
  try {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10)
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...userData },
      { new: true }
    )
    return { updatedUser }
  } catch (error) {
    throw error
  }
}

// Suppression du compte utilisateur
const deleteUser = async (email, password) => {
  try {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('User not found.')
    }

    // Vérifier le mot de passe avant suppression
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Invalid password.')
    }

    await User.deleteOne({ email })
    return { message: 'User deleted successfully' }
  } catch (error) {
    throw error
  }
}
// Changer le mot de passe d'un utilisateur
const changePassword = async (email, oldPassword, newPassword) => {
  try {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('User not found.')
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      throw new Error('Invalid old password.')
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe
    user.password = hashedPassword
    await user.save()

    return { message: 'Password changed successfully.' }
  } catch (error) {
    throw error
  }
}

// Request password reset
const requestPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('User not found.')
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour expiration

    await user.save()

    // Send email
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `Click this link to reset your password: ${resetLink}`,
    })

    return { message: 'Password reset link sent to email' }
  } catch (error) {
    throw error
  }
}

// Reset password with token
const resetPassword = async (token, newPassword) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      throw new Error('Invalid or expired token.')
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)

    // Clear reset token
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    return { message: 'Password reset successful' }
  } catch (error) {
    throw error
  }
}

const createManager = async (userData) => {
  try {
    const { firstName, lastName, email, password, profilePicture } = userData
    if (!firstName || !lastName || !email || !password) {
      return { message: 'All fields are required.' }
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new Error('Email already in use.')
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePicture,
      role: 'manager',
      isActive: true,
    })

    // Sauvegarder l'utilisateur
    await newUser.save()

    return {
      message: 'Manager created successfully.',
      email: newUser.email,
    }
  } catch (error) {
    throw error
  }
}

const getAllManagers = async () => {
  try {
    const managers = await User.find({ role: 'manager' }).select('-password')
    return managers
  } catch (error) {
    throw error
  }
}

const getManagerById = async (id) => {
  try {
    const manager = await User.findById(id).select('-password')
    if (!manager || manager.role !== 'manager') {
      throw new Error('Manager not found.')
    }
    return manager
  } catch (error) {
    throw error
  }
}

const updateManager = async (id, userData) => {
  try {
    const updatedManager = await User.findByIdAndUpdate(
      id,
      { ...userData },
      { new: true }
    ).select('-password')
    return { updatedManager }
  } catch (error) {
    throw error
  }
}

const deleteManager = async (id) => {
  try {
    const deletedManager = await User.findByIdAndDelete(id)
    if (!deletedManager || deletedManager.role !== 'manager') {
      throw new Error('Manager not found.')
    }
    return { message: 'Manager deleted successfully.' }
  } catch (error) {
    throw error
  }
}

const getAllUsers = async () => {
  try {
    const users = await User.find({ role: 'user' }).select('-password')
    return users
  } catch (error) {
    throw error
  }
}

const getUserReservations = async (userId) => {
  try {
    const reservations = await Reservation.find({ client: userId }).sort({
      createdAt: -1,
    })
    return reservations
  } catch (error) {
    throw error
  }
}
const getAllUsersWithReservationCount = async (req, res) => {
  try {
    // Step 1: Count reservations per user
    const reservationStats = await Reservation.aggregate([
      {
        $group: {
          _id: '$client',
          reservationCount: { $sum: 1 },
        },
      },
    ])

    // Step 2: Convert to map { userId: count }
    const countMap = {}
    reservationStats.forEach(stat => {
      countMap[stat._id.toString()] = stat.reservationCount
    })

    // Step 3: Get all users (without passwords)
    const users = await User.find().select('-password')

    // Step 4: Merge reservationCount into each user
    const usersWithCount = users.map(user => {
      return {
        ...user.toObject(),
        reservationCount: countMap[user._id.toString()] || 0,
        message: 'User fetched successfully',
        success: true,
      }
    })
    console.log('liuheqroygwfq',usersWithCount)
    res.status(200).json(usersWithCount)
  } catch (error) {
    console.error('Error fetching users with reservation count:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
module.exports = {
  createUser,
  getUserInfo,
  updateUser,
  deleteUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  loginUser,
  activateAccount,
  deactivateUser,
  createManager,
  getAllManagers,
  getManagerById,
  updateManager,
  deleteManager,
  getAllUsers,
  getUserReservations,
  getAllUsersWithReservationCount,
}
