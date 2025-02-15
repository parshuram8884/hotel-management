const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/settings/:hotelId', auth, authController.getSettings);
router.patch('/settings', auth, authController.updateSettings);

module.exports = router;