const Complaint = require('../model/Complaint');
const PreDefinedComplaint = require('../model/PredefinedComplaint')
const Guest = require('../model/Guest');

// Function to delete old complaints
const deleteOldComplaints = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Complaint.deleteMany({
      $or: [
        { status: 'resolved', updatedAt: { $lt: twentyFourHoursAgo } },
        { createdAt: { $lt: twentyFourHoursAgo } }
      ]
    });
    console.log(`Deleted ${result.deletedCount} old complaints`);
  } catch (error) {
    console.error('Error deleting old complaints:', error);
  }
};

// Run cleanup every hour
setInterval(deleteOldComplaints, 60 * 60 * 1000);

const complaintController = {
  // Get hotel complaints
  getHotelComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.find({ hotelId: req.user.hotelId });
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get guest complaints
  getGuestComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.find({ guestId: req.user._id });
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add predefined complaint
  addPredefinedComplaint: async (req, res) => {
    try {
      const complaint = new Complaint(req.body);
      await complaint.save();
      res.status(201).json(complaint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get predefined complaints for a hotel
  getPredefinedComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.find({ 
        hotelId: req.params.hotelId,
        isPredefined: true 
      });
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Submit a complaint (both predefined and custom)
  submitComplaint: async (req, res) => {
    try {
      const complaint = new Complaint({
        ...req.body,
        guestId: req.user._id
      });
      await complaint.save();
      res.status(201).json(complaint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update complaint status
  updateComplaintStatus: async (req, res) => {
    try {
      const complaint = await Complaint.findByIdAndUpdate(
        req.params.complaintId,
        { status: req.body.status },
        { new: true }
      );
      res.json(complaint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Add staff message
  addStaffMessage: async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.complaintId);
      complaint.messages.push({
        sender: 'staff',
        content: req.body.message
      });
      await complaint.save();
      res.json(complaint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Add guest message
  addGuestMessage: async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.complaintId);
      complaint.messages.push({
        sender: 'guest',
        content: req.body.message
      });
      await complaint.save();
      res.json(complaint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete complaint
  deleteComplaint: async (req, res) => {
    try {
      await Complaint.findByIdAndDelete(req.params.complaintId);
      res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = complaintController;