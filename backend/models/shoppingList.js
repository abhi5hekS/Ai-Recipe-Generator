const mongoose = require("mongoose");

const shoppingListItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ingredient_name: {
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
  },
  category: {
    type: String
  },
  is_checked: {
    type: Boolean,
    default: false
  },
  from_meal_plan: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

shoppingListItemSchema.index({ user_id: 1 });

module.exports = mongoose.model("ShoppingListItem", shoppingListItemSchema);