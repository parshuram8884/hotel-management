const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
// const { guestAuth } = require('../middleware/authMiddleware');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/verify-hotel/:hotelId', guestController.verifyHotel);
router.post('/register/:hotelId', guestController.registerGuest);
router.get('/status/:guestId', guestController.getGuestStatus);

// Protected routes
router.get('/pending/:hotelId', auth, guestController.getPendingGuests);
router.post('/approve/:guestId', auth, guestController.approveGuest);
router.post('/reject/:guestId', auth, guestController.rejectGuest);
router.get('/approved/:hotelId', auth, guestController.getApprovedGuests);

module.exports = router;