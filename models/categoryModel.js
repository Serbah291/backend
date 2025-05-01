const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for this category'],
      unique: true, // this will ensure that the name of the category is unique
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [32, 'Name cannot be more than 32 characters long'],
    },

    // slug is a URL friendly version of the name ex : "Web Development" => "web-development"
    slug: {
      type: String,
      lowercase: true,
    },

    image: String,
  },
  {
    timestamps: true, // this will automatically add the createdAt and updatedAt fields
  }
)

const CategoryModel = mongoose.model('Category', categorySchema)

module.exports = CategoryModel
