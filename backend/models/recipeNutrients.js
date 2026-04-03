const mongoose = require("mongoose");

const recipeNutritionSchema = new mongoose.Schema({
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
    unique: true // equivalent to UNIQUE(recipe_id)
  },
  calories: {
    type: Number
  },
  protein: {
    type: Number
  },
  carbs: {
    type: Number
  },
  fats: {
    type: Number
  },
  fiber: {
    type: Number
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: false
  }
});

module.exports = mongoose.model("RecipeNutrition", recipeNutritionSchema);