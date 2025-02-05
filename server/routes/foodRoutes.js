const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { auth } = require('../middleware/auth');
const guestAuth = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Staff routes - ensure auth middleware is applied correctly
router.post('/', auth, upload.single('image'), foodController.addFood);
router.patch('/:foodId', auth, upload.single('image'), foodController.updateFood);
router.delete('/:foodId', auth, foodController.deleteFood);
router.get('/hotel/:hotelId', auth, foodController.getFoodItems);

// Guest route - no auth required
router.get('/menu/:hotelId', foodController.getFoodItems);

// Fix: Change the route to match the controller
router.get('/orders/:hotelId', auth, foodController.getHotelOrders); // Updated route
// Fix: Update the status update route
router.patch('/orders/:orderId/update-status', auth, foodController.updateOrderStatus);

// Guest routes
router.post('/orders', guestAuth, foodController.placeOrder);
router.get('/orders/active/:guestId', guestAuth, foodController.getGuestOrders);
router.get('/orders/history/:guestId', guestAuth, foodController.getGuestOrders);

module.exports = router;