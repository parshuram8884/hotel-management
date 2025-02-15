const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth } = require('../middleware/auth');
const guestAuth = require('../middleware/authMiddleware');

// Staff routes
router.get('/hotel', auth, complaintController.getHotelComplaints);
router.post('/predefined', auth, complaintController.addPredefinedComplaint);
router.patch('/:complaintId/status', auth, complaintController.updateComplaintStatus);
router.post('/:complaintId/staff-messages', auth, complaintController.addStaffMessage);
router.delete('/:complaintId', auth, complaintController.deleteComplaint);

// Guest routes
router.get('/predefined/:hotelId', complaintController.getPredefinedComplaints);
router.get('/guest', guestAuth, complaintController.getGuestComplaints);
router.post('/submit', guestAuth, complaintController.submitComplaint);
router.post('/:complaintId/messages', guestAuth, complaintController.addGuestMessage);

module.exports = router;