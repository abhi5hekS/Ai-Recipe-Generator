const express = require('express');
const {generateFromMealPlan, getShoppingList, addItem, updateItem, toggleChecked, deleteItem, clearChecked, clearAll, addCheckedToPantry} = require('../controllers/shoppingList.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getShoppingList);
router.post('/generate', generateFromMealPlan);
router.post('/', addItem);
router.put('/:id', updateItem);
router.patch('/:id/toggle', toggleChecked);
router.delete('/:id', deleteItem);
router.delete('/clear/checked', clearChecked);
router.delete('/clear/all', clearAll);
router.post('/add-to-pantry', addCheckedToPantry);

module.exports = router;