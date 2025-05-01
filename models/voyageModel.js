const mongoose = require('mongoose')

const voyageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for this voyage'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Référence au modèle CategoryModel
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],

    },
    description:{  
      type: String, 
      trim : true,
     },

    
    agence: {
      type: String,
      trim: true,
    },
    placesDisponibles: {
      type: Number,
      required: [true, 'Please provide available places'],
    },
    dateDepart: {
      type: Date,
      required: [true, 'Please provide a departure date'],
    },
    photo: {
      type: String,
      default: '', // Tu peux stocker une URL d'image ou le nom du fichier
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isSpecialOffer: {
      type: Boolean,
      default: false,
    },
     // Champs utiles pour la section Special Offers
     rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    smallDescription: {
      type: String,
      trim: true,
    },

    // Champs utiles pour Popular Destinations
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },

  },
  
  {
    timestamps: true,
  }
)

//const VoyageModel = mongoose.model('Voyage', voyageSchema)
// Utilisation de mongoose.models pour éviter la redéfinition du modèle
const VoyageModel = mongoose.models.Voyage || mongoose.model('Voyage', voyageSchema);


module.exports = VoyageModel
