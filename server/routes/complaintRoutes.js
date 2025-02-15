const express = require('express');
const router = express.Router();
const {
    addPredefinedComplaint,
    getHotelComplaints,
    updateComplaintStatus,
    addStaffMessage,
    deleteComplaint,
    getPredefinedComplaints,
    submitComplaint,
    getGuestComplaints,
    addGuestMessage
} = require('../controllers/complaintController');
const { auth } = require('../middleware/auth');
const guestAuth = require('../middleware/authMiddleware');

// Staff routes
router.post('/predefined', auth, addPredefinedComplaint);
router.get('/hotel', auth, getHotelComplaints);
router.patch('/:complaintId/status', auth, updateComplaintStatus);
router.post('/:complaintId/staff-messages', auth, addStaffMessage);
router.delete('/:complaintId', auth, deleteComplaint);

// Guest routes
router.get('/predefined/:hotelId', getPredefinedComplaints);
router.post('/submit', guestAuth, submitComplaint);
router.get('/guest', guestAuth, getGuestComplaints);
router.post('/:complaintId/messages', guestAuth, addGuestMessage);

module.exports = router;