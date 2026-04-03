const express = require('express');
const {addToMealPlan, getWeeklyMealPlan, getUpcomingMeals, deleteMealPlan, getMealPlanStats} = require('../controllers/mealPlan.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/weekly', getWeeklyMealPlan);
router.get('/upcoming', getUpcomingMeals);
router.get('/stats', getMealPlanStats);
router.post('/', addToMealPlan);
router.delete('/:id', deleteMealPlan);

module.exports = router;