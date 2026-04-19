const express = require('express');
const {getProfile, updateProfile, updatePreferences, changePassword, deleteAccount} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/preferences', updatePreferences);
router.patch('/change-password', changePassword);
router.delete('/account', deleteAccount);

module.exports = router;