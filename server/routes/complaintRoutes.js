const express = require('express');
const router = express.Router();
const {
    getHotelComplaints,
    getGuestComplaints,
    addPredefinedComplaint,
    getPredefinedComplaints,
    submitComplaint,
    updateComplaintStatus,
    addStaffMessage,
    addGuestMessage,
    deleteComplaint
} = require('../controllers/complaintController');
const { auth } = require('../middleware/auth');
const guestAuth = require('../middleware/authMiddleware');

// Staff routes
router.get('/hotel', auth, getHotelComplaints);
router.post('/predefined', auth, addPredefinedComplaint);
router.patch('/:complaintId/status', auth, updateComplaintStatus);
router.post('/:complaintId/staff-messages', auth, addStaffMessage);
router.delete('/:complaintId', auth, deleteComplaint);

// Guest routes
router.get('/predefined/:hotelId', getPredefinedComplaints);
router.get('/guest', guestAuth, getGuestComplaints);
router.post('/submit', guestAuth, submitComplaint);
router.post('/:complaintId/messages', guestAuth, addGuestMessage);

module.exports = router;