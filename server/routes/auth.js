const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes - need auth middleware
router.get('/settings/:hotelId', auth, authController.getSettings);
router.patch('/settings', auth, authController.updateSettings);

// Hotel routes
router.post('/hotel/register', authController.registerHotel);
router.post('/hotel/login', authController.loginHotel);

// Guest routes
router.post('/guest/register', authController.registerGuest);
router.post('/guest/login', authController.loginGuest);

// Common routes
router.post('/logout', authController.logout);
router.get('/verify-token', authController.verifyToken);

module.exports = router;