const mongoose = require("mongoose");

const recipeIngredientSchema = new mongoose.Schema({
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true
  },
  ingredient: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: false // since only created_at exists in SQL
  }
});

module.exports = mongoose.model("RecipeIngredient", recipeIngredientSchema);