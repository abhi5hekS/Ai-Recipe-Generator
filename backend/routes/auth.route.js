const express = require('express');
const {register, login, getCurrentUser, requestPasswordReset} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/reset-password', requestPasswordReset);


router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;