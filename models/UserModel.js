const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    role: {
      type: String,
      enum: ['manager', 'user', 'admin'],
      default: 'user',
    },
    // Ajout pour l'activation du compte
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
      default: null,
    },

    // Ajouté précédemment pour le mot de passe oublié
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
)

// Vérifie si le modèle existe déjà pour éviter l'erreur OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', UserSchema)

module.exports = User
