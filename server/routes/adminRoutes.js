const express = require('express');
const router = express.Router();
const { getHotelStats } = require('../controllers/adminController');

router.get('/hotels/stats', getHotelStats);

module.exports = router;
