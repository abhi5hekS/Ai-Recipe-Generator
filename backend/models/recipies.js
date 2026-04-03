const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  cuisine_type: {
    type: String
  },
  difficulty: {
    type: String,
    default: "medium"
  },
  prep_time: {
    type: Number
  },
  cook_time: {
    type: Number
  },
  servings: {
    type: Number,
    default: 4
  },
  instructions: {
    type: mongoose.Schema.Types.Mixed, // for JSONB
    required: true
  },
  dietary_tags: {
    type: [String],
    default: []
  },
  user_notes: {
    type: String
  },
  image_url: {
    type: String
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

recipeSchema.index({ user_id: 1 });
recipeSchema.index({ cuisine_type: 1 });


module.exports = mongoose.model("Recipe", recipeSchema);