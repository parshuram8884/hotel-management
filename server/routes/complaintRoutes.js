const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController')
const { auth } = require('../middleware/auth');
const guestAuth = require('../middleware/authMiddleware');
const Complaint = require('../models/complaint');

// Staff routes
router.post('/predefined', auth, complaintController.addPredefinedComplaint);
router.get('/hotel', auth, complaintController.getHotelComplaints);
router.patch('/:complaintId/status', auth, complaintController.updateComplaintStatus);
router.post('/:complaintId/staff-messages', auth, complaintController.addStaffMessage);
router.delete('/:complaintId', auth, complaintController.deleteComplaint);

// Guest routes
router.get('/predefined/:hotelId', complaintController.getPredefinedComplaints);
router.post('/submit', guestAuth, complaintController.submitComplaint);
router.get('/guest', guestAuth, complaintController.getGuestComplaints);
router.post('/:complaintId/messages', guestAuth, complaintController.addGuestMessage);

// Fix the POST route by adding a proper callback function
router.post('/complaints', async (req, res) => {
    try {
        const complaint = new Complaint(req.body);
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;