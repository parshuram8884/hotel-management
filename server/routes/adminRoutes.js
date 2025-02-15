const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.post('/login', adminController.login);
router.get('/dashboard', verifyAdmin, adminController.getDashboardStats);

module.exports = router;
