const ShoppingList = require('../models/shoppingList');
const PantryItem = require('../models/pantryItems');
const MealPlan = require('../models/mealPlan');



const generateFromMealPlan = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide startDate and endDate"
      });
    }

    const userId = req.user.id;

    const mealPlans = await MealPlan.find({
      user_id: userId,
      meal_date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate("recipe_id");

    const ingredientMap = {};

    mealPlans.forEach(meal => {
      const ingredients = meal.recipe_id?.ingredients || [];

      ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}_${ing.unit}`;

        ingredientMap[key] =
          (ingredientMap[key] || 0) + ing.quantity;
      });
    });

    const pantryItems = await PantryItem.find({ user_id: userId });

    const pantryMap = {};
    pantryItems.forEach(item => {
      const key = `${item.name.toLowerCase()}_${item.unit}`;
      pantryMap[key] = item.quantity;
    });

    const shoppingItems = [];

    for (const key in ingredientMap) {
      const [name, unit] = key.split("_");

      const requiredQty = ingredientMap[key];
      const pantryQty = pantryMap[key] || 0;

      const neededQty = Math.max(0, requiredQty - pantryQty);

      if (neededQty > 0) {
        shoppingItems.push({
          user_id: userId,
          ingredient_name: name,
          quantity: neededQty,
          unit,
          category: "Uncategorized",
          from_meal_plan: true
        });
      }
    }

    await ShoppingList.deleteMany({
      user_id: userId,
      from_meal_plan: true
    });

    const items = await ShoppingList.insertMany(shoppingItems);

    res.json({
      success: true,
      message: "Shopping list generated from meal plan",
      data: { items }
    });

  } catch (error) {
    console.error("Generate shopping list error:", error.message);
    next(error);
  }
};


const getShoppingList = async (req, res, next) => {
  try {
    const grouped = req.query.grouped === "true";
    const userId = req.user.id;

    let items;

    if (grouped) {
      items = await ShoppingList.aggregate([
        {
          $match: { user_id: userId }
        },
        {
          $group: {
            _id: "$category",
            items: {
              $push: {
                _id: "$_id",
                ingredient_name: "$ingredient_name",
                quantity: "$quantity",
                unit: "$unit",
                is_checked: "$is_checked",
                from_meal_plan: "$from_meal_plan"
              }
            }
          }
        },
        {
          $project: {
            category: "$_id",
            items: 1,
            _id: 0
          }
        },
        {
          $sort: { category: 1 }
        }
      ]);
    } else {
      items = await ShoppingList.find({
        user_id: userId
      }).sort({ category: 1, ingredient_name: 1 });
    }

    res.json({
      success: true,
      data: { items }
    });

  } catch (error) {
    console.error("Get shopping list error:", error.message);
    next(error);
  }
};


const addItem = async (req, res, next) => {
  try {
    const {
      ingredient_name,
      quantity,
      unit,
      category = "Uncategorized"
    } = req.body;

    const item = await ShoppingList.create({
      user_id: req.user.id,
      ingredient_name,
      quantity,
      unit,
      category,
      from_meal_plan: false,
      is_checked: false
    });

    res.status(201).json({
      success: true,
      message: "Item added to shopping list",
      data: { item }
    });

  } catch (error) {
    console.error("Add shopping item error:", error.message);
    next(error);
  }
};


const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await ShoppingList.findOneAndUpdate(
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

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found"
      });
    }

    res.json({
      success: true,
      message: "Item updated",
      data: { item }
    });

  } catch (error) {
    console.error("Update shopping item error:", error.message);
    next(error);
  }
};


const toggleChecked = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await ShoppingList.findOne({
      _id: id,
      user_id: req.user.id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found"
      });
    }

    item.is_checked = !item.is_checked;
    await item.save();

    res.json({
      success: true,
      data: { item }
    });

  } catch (error) {
    console.error("Toggle item error:", error.message);
    next(error);
  }
};


const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await ShoppingList.findOneAndDelete({
      _id: id,
      user_id: req.user.id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found"
      });
    }

    res.json({
      success: true,
      message: "Item deleted",
      data: { item }
    });

  } catch (error) {
    console.error("Delete shopping item error:", error.message);
    next(error);
  }
};


const clearChecked = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = await ShoppingList.find({
      user_id: userId,
      is_checked: true
    });

    await ShoppingList.deleteMany({
      user_id: userId,
      is_checked: true
    });

    res.json({
      success: true,
      message: "Checked items cleared",
      data: { items }
    });

  } catch (error) {
    console.error("Clear checked items error:", error.message);
    next(error);
  }
};


const clearAll = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = await ShoppingList.find({
      user_id: userId
    });

    await ShoppingList.deleteMany({
      user_id: userId
    });

    res.json({
      success: true,
      message: "Shopping list cleared",
      data: { items }
    });

  } catch (error) {
    console.error("Clear all items error:", error.message);
    next(error);
  }
};


const addCheckedToPantry = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const checkedItems = await ShoppingList.find({
      user_id: userId,
      is_checked: true
    });

    if (checkedItems.length === 0) {
      return res.json({
        success: true,
        message: "No checked items to add",
        data: { items: [] }
      });
    }

    const pantryItems = [];

    for (const item of checkedItems) {
      const existing = await PantryItem.findOne({
        user_id: userId,
        name: item.ingredient_name,
        unit: item.unit
      });

      if (existing) {
        existing.quantity += item.quantity;
        await existing.save();
        pantryItems.push(existing);
      } else {
        const newItem = await PantryItem.create({
          user_id: userId,
          name: item.ingredient_name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category
        });
        pantryItems.push(newItem);
      }
    }

    await ShoppingList.deleteMany({
      user_id: userId,
      is_checked: true
    });

    res.json({
      success: true,
      message: "Checked items added to pantry",
      data: { items: pantryItems }
    });

  } catch (error) {
    console.error("Add to pantry error:", error.message);
    next(error);
  }
};


module.exports = {
    generateFromMealPlan,
    getShoppingList,
    addItem,
    updateItem,
    toggleChecked,
    deleteItem,
    clearChecked,
    clearAll,
    addCheckedToPantry
}