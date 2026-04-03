const mongoose = require("mongoose");

const userPreferencesSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  dietary_restrictions: {
    type: [String],
    default: []
  },
  allergies: {
    type: [String],
    default: []
  },
  preferred_cuisines: {
    type: [String],
    default: []
  },
  default_servings: {
    type: Number,
    default: 4
  },
  measurement_unit: {
    type: String,
    default: "metric"
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

module.exports = mongoose.model("UserPreferences", userPreferencesSchema);