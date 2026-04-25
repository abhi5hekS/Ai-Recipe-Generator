const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true
  },
  meal_name:{
    type: String,
    required: true
  },
  meal_date: {
    type: Date,
    required: true
  },
  meal_type: {
    type: String,
    enum: ["breakfast", "lunch", "dinner"],
    required: true
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

mealPlanSchema.index(
  { user_id: 1, meal_date: 1, meal_type: 1 },
  { unique: true }
);


module.exports = mongoose.model("MealPlan", mealPlanSchema);