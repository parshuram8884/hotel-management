const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Stats endpoint
router.get('/stats', adminController.getHotelStats);

module.exports = router;
