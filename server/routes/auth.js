const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes - need auth middleware
router.get('/settings/:hotelId', auth, authController.getSettings);
router.patch('/settings', auth, authController.updateSettings);

// The issue was here - settings routes weren't properly formatted
// Always make sure the route handler is a function
// router.get('/settings/:hotelId', auth, authController.getSettings);  // Wrong
// router.patch('/settings', auth, authController.updateSettings);      // Wrong

module.exports = router;