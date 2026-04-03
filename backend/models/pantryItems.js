const mongoose = require("mongoose");

const pantryItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
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
    type: String,
    required: true
  },
  expiry_date: {
    type: Date
  },
  is_running_low: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

pantryItemSchema.index({ user_id: 1 });

module.exports = mongoose.model("PantryItem", pantryItemSchema);