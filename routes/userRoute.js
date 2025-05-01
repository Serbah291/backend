const User = require('../models/UserModel') // Assure-toi que le chemin est correct

const express = require('express')
const {
  createUser,
  getUserInfo,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
  requestPasswordReset,
  loginUser,
  activateAccount,
  createManager,
  getAllManagers,
  getManagerById,
  updateManager,
  deleteManager,
  deactivateUser,
  getAllUsers,
  getUserReservations,
} = require('../services/userService')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()

// Route to get user reservations
router.get('/reservations', protect, async (req, res) => {
  try {
    const userId = req.user.id
    const reservations = await getUserReservations(userId)
    res.status(200).json(reservations)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route pour créer un compte
router.post('/register', async (req, res) => {
  try {
    const user = await createUser(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get('/activate-account/:token', async (req, res) => {
  try {
    const { token } = req.params
    const result = await activateAccount(token)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Login Route
router.post('/login', async (req, res) => {
  try {
    const user = await loginUser(req.body.email, req.body.password)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route pour récupérer les informations du compte (avec email + password)
router.get('/me', protect, async (req, res) => {
  try {
    const userId = req.user.id
    const userInfo = await getUserInfo(userId)
    res.status(200).json(userInfo)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route pour mettre à jour le compte (avec email + password)
router.put('/me', protect, async (req, res) => {
  try {
    let userData = {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
    }
    const result = await updateUser(req.user.id, userData)
    res.status(200).json(result)
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message })
  }
})

// Route pour supprimer le compte (avec email + password)
router.delete('/me', protect, async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await deleteUser(email, password)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route pour désactiver le compte (avec mot de passe)
router.put('/me/deactivate', protect, async (req, res) => {
  try {
    const result = await deactivateUser(req.user.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// get all users for admin
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      '-password'
    )
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
})

// Route to get all Users
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const managers = await getAllUsers()
    res.status(200).json(managers)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route to get all managers
router.get('/managers', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const managers = await getAllManagers()
    res.status(200).json(managers)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route to get a manager by ID

router.get('/managers/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const manager = await getManagerById(req.params.id)
    res.status(200).json(manager)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route to update a manager
router.put('/managers/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const updatedManager = await updateManager(req.params.id, req.body)
    res.status(200).json(updatedManager)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})
// Route to delete a manager
router.delete('/managers/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const result = await deleteManager(req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// update user by id ( admin )
router.get('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const user = await User.findById(req.params.id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
})

// delete user by id ( admin )
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const user = await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'utilisateur supprimé avec success' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
})

// Route pour changer le mot de passe
router.put('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body
    const result = await changePassword(email, oldPassword, newPassword)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route to request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const result = await requestPasswordReset(email)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route to reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    const result = await resetPassword(token, newPassword)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Route to create a manager
router.post('/create-manager', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unothorized' })
    }
    const result = await createManager(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router
