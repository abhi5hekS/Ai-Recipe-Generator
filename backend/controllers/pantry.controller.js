const mongoose = require('mongoose');
const PantryItem = require('../models/pantryItems')

const getPantryItems = async (req, res, next) => {
  try {
    const { category, is_running_low, search } = req.query;

    const query = {
      user_id: req.user.id
    };

    if (category) {
      query.category = category;
    }

    if (is_running_low !== undefined) {
      query.is_running_low = is_running_low === "true";
    }

    if (search) {
      query.name = {
        $regex: search,
        $options: "i"
      };
    }

    const items = await PantryItem.find(query).sort({ created_at: -1 });

    res.json({
      success: true,
      data: { items }
    });

  } catch (error) {
    next(error);
  }
};


const getPantryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await PantryItem.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: null,
          total_items: { $sum: 1 },
          total_categories: { $addToSet: "$category" },
          running_low_count: {
            $sum: {
              $cond: ["$is_running_low", 1, 0]
            }
          },
          expiring_soon_count: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lte: ["$expiry_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                    { $gte: ["$expiry_date", new Date()] }
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
          total_items: 1,
          total_categories: { $size: "$total_categories" },
          running_low_count: 1,
          expiring_soon_count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        total_items: 0,
        total_categories: 0,
        running_low_count: 0,
        expiring_soon_count: 0
      }
    });

  } catch (error) {
    next(error);
  }
};

const getExpiringSoon = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Calculate date range
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    // Query
    const items = await PantryItem.find({
      user_id: userId,
      expiry_date: {
        $gte: today,
        $lte: futureDate
      }
    }).sort({ expiry_date: 1 });

    res.json({
      success: true,
      data: { items }
    });

  } catch (error) {
    next(error);
  }
};

const addPantryItem = async (req, res, next) => {
  try {
    const { name, quantity, unit, category, expiry_date, is_running_low } = req.body;

    const item = await PantryItem.create({
      user_id: req.user.id,
      name,
      quantity,
      unit,
      category,
      expiry_date,
      is_running_low: is_running_low || false
    });

    res.status(201).json({
      success: true,
      message: "Item added to pantry",
      data: { item }
    });

  } catch (error) {
    next(error);
  }
};


const updatePantryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await PantryItem.findOneAndUpdate({
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
        message: "Pantry item not found"
      });
    }

    res.json({
      success: true,
      message: "Pantry item updated",
      data: { item }
    });

  } catch (error) {
    next(error);
  }
};


const deletePantryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await PantryItem.findOneAndDelete({
      _id: id,
      user_id: req.user.id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found"
      });
    }

    res.json({
      success: true,
      message: "Pantry item deleted",
      data: { item }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
    getPantryItems, getPantryStats, getExpiringSoon, addPantryItem, updatePantryItem, deletePantryItem
}