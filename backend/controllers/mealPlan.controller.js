const MealPlan = require('../models/mealPlan');
const mongoose = require('mongoose');

const addToMealPlan = async (req, res, next) => {
  try {
    const { recipe_id, meal_date, meal_type } = req.body;

    const mealPlan = await MealPlan.findOneAndUpdate(
      {
        user_id: req.user.id,
        meal_date,
        meal_type
      },
      {
        $set: {
          recipe_id
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json({
      success: true,
      message: "Recipe added to meal plan",
      data: { mealPlan }
    });

  } catch (error) {
    console.error("Add to meal plan error:", error.message);
    next(error);
  }
};


const getWeeklyMealPlan = async (req, res, next) => {
  try {
    const { start_date, weekStartDate } = req.query;

    const startDate = start_date || weekStartDate;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide start_date or weekStartDate"
      });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const mealPlans = await MealPlan.find({
      user_id: req.user.id,
      meal_date: {
        $gte: start,
        $lte: end
      }
    })
      .populate("recipe_id")
      .sort({ meal_date: 1 });

    res.json({
      success: true,
      data: { mealPlans }
    });

  } catch (error) {
    console.error("Get weekly meal plan error:", error.message);
    next(error);
  }
};


const getUpcomingMeals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const meals = await MealPlan.find({
      user_id: req.user.id,
      meal_date: { $gte: new Date() }
    })
      .populate("recipe_id")
      .sort({ meal_date: 1 })
      .limit(limit);

    res.json({
      success: true,
      data: { meals }
    });

  } catch (error) {
    console.error("Get upcoming meals error:", error.message);
    next(error);
  }
};


const deleteMealPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findOneAndDelete({
      _id: id,
      user_id: req.user.id
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan entry not found"
      });
    }

    res.json({
      success: true,
      message: "Meal plan entry deleted",
      data: { mealPlan }
    });

  } catch (error) {
    console.error("Delete meal plan error:", error.message);
    next(error);
  }
};


const getMealPlanStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const stats = await MealPlan.aggregate([
      {
        $match: { user_id: userId }
      },
      {
        $group: {
          _id: null,
          total_planned_meals: { $sum: 1 },
          this_week_count: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$meal_date", today] },
                    { $lte: ["$meal_date", nextWeek] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total_planned_meals: 1,
          this_week_count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        total_planned_meals: 0,
        this_week_count: 0
      }
    });

  } catch (error) {
    console.error("Meal plan stats error:", error.message);
    next(error);
  }
};


module.exports = {
    addToMealPlan,
    getWeeklyMealPlan,
    getUpcomingMeals,
    deleteMealPlan,
    getMealPlanStats
}