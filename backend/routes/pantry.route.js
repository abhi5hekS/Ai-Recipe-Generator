const express = require('express');
const {getPantryItems, getPantryStats, getExpiringSoon, addPantryItem, updatePantryItem, deletePantryItem} = require('../controllers/pantry.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


router.use(authMiddleware);

router.get('/', getPantryItems);
router.get('/stats', getPantryStats);
router.get('/expiring-soon', getExpiringSoon);
router.post('/', addPantryItem);
router.put('/:id', updatePantryItem);
router.delete('/:id', deletePantryItem);

module.exports = router;