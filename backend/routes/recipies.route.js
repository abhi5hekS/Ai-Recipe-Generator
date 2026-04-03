const express = require('express');
const authMiddleware = require('../middleware/auth');
const {generateRecipe, getPantrySuggestions, saveRecipe, getRecipes, getRecentRecipes, getRecipeById, updateRecipe, deleteRecipe, getRecipeStats} = require('../controllers/recipe.controller');

const router = express.Router();


router.use(authMiddleware);

router.post('/generate', generateRecipe);
router.get('/suggestion', getPantrySuggestions);


router.get('/', getRecipes);
router.get('/recent', getRecentRecipes);
router.get('/stats', getRecipeStats);
router.get('/:id', getRecipeById);
router.post('/', saveRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;