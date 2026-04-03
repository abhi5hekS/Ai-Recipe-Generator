const PantryItem = require("../models/pantryItems");
const Recipe = require('../models/recipies.js');
const { generateRecipeAI } = require("../utils/gemini.js");
const mongoose = require("mongoose");
const { generatePantrySuggestionsAI } = require("../utils/gemini.js");

const generateRecipe = async (req, res, next) => {
  try {
    const {
      ingredients = [],
      usePantryIngredients = false,
      dietaryRestrictions = [],
      cuisineType = "any",
      servings = 4,
      cookingTime = "medium"
    } = req.body;

    let finalIngredients = [...ingredients];

    if (usePantryIngredients) {
      const pantryItems = await PantryItem.find({
        user_id: req.user.id
      });

      const pantryIngredientNames = pantryItems.map(item => item.name);

      finalIngredients = [
        ...new Set([...finalIngredients, ...pantryIngredientNames])
      ];
    }

    if (finalIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient"
      });
    }

    const recipe = await generateRecipeAI({
      ingredients: finalIngredients,
      dietaryRestrictions,
      cuisineType,
      servings,
      cookingTime
    });

    res.json({
      success: true,
      message: "Recipe generated successfully",
      data: { recipe }
    });

  } catch (error) {
    console.error("Generate recipe error:", error.message);
    next(error);
  }
};


const getPantrySuggestions = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const pantryItems = await PantryItem.find({
      user_id: userId
    });

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 7);

    const expiringItems = await PantryItem.find({
      user_id: userId,
      expiry_date: {
        $gte: today,
        $lte: futureDate
      }
    });

    const pantryNames = pantryItems.map(item => item.name);
    const expiringNames = expiringItems.map(item => item.name);

    const suggestions = await generatePantrySuggestionsAI(
      pantryNames,
      expiringNames
    );

    res.json({
      success: true,
      data: { suggestions }
    });

  } catch (error) {
    console.error("Pantry suggestions error:", error.message);
    next(error);
  }
};


const saveRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.create({
      user_id: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: "Recipe saved successfully",
      data: { recipe }
    });

  } catch (error) {
    console.error("Save recipe error:", error.message);
    next(error);
  }
};


const getRecipes = async (req, res, next) => {
  try {
    const { search, cuisine_type, difficulty, dietary_tag, max_cook_time, sort_by = "created_at", sort_order = "desc", limit = 10, offset = 0 } = req.query;

    const query = {
      user_id: req.user.id
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (cuisine_type) query.cuisine_type = cuisine_type;
    if (difficulty) query.difficulty = difficulty;

    if (dietary_tag) {
      query.dietary_tags = dietary_tag; 
    }

    if (max_cook_time) {
      query.cook_time = { $lte: parseInt(max_cook_time) };
    }

    const sortOptions = {
      [sort_by]: sort_order === "asc" ? 1 : -1
    };

    const recipes = await Recipe.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      data: { recipes }
    });

  } catch (error) {
    console.error("Get recipes error:", error.message);
    next(error);
  }
};


const getRecentRecipes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get latest recipes
    const recipes = await Recipe.find({
      user_id: req.user.id
    })
      .sort({ created_at: -1 }) // newest first
      .limit(limit);

    res.json({
      success: true,
      data: { recipes }
    });

  } catch (error) {
    console.error("Get recent recipes error:", error.message);
    next(error);
  }
};


const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findOne({
      _id: id,
      user_id: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found"
      });
    }

    res.json({
      success: true,
      data: { recipe }
    });

  } catch (error) {
    console.error("Get recipe by ID error:", error.message);
    next(error);
  }
};


const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findOneAndUpdate(
      {
        _id: id,
        user_id: req.user.id
      },
      {
        $set: req.body
      },
      {
        new: true
      }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found"
      });
    }

    res.json({
      success: true,
      message: "Recipe updated successfully",
      data: { recipe }
    });

  } catch (error) {
    console.error("Update recipe error:", error.message);
    next(error);
  }
};


const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findOneAndDelete({
      _id: id,
      user_id: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found"
      });
    }

    res.json({
      success: true,
      message: "Recipe deleted successfully",
      data: { recipe }
    });

  } catch (error) {
    console.error("Delete recipe error:", error.message);
    next(error);
  }
};


const getRecipeStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await Recipe.aggregate([
      {
        $match: { user_id: userId }
      },
      {
        $group: {
          _id: null,
          total_recipes: { $sum: 1 },
          cuisine_types: { $addToSet: "$cuisine_type" },
          avg_cook_time: { $avg: "$cook_time" }
        }
      },
      {
        $project: {
          _id: 0,
          total_recipes: 1,
          cuisine_types_count: { $size: "$cuisine_types" },
          avg_cook_time: { $round: ["$avg_cook_time", 2] }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        total_recipes: 0,
        cuisine_types_count: 0,
        avg_cook_time: 0
      }
    });

  } catch (error) {
    console.error("Get recipe stats error:", error.message);
    next(error);
  }
};

module.exports = {
    generateRecipe,
    getPantrySuggestions,
    saveRecipe,
    getRecipes,
    getRecentRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    getRecipeStats
}