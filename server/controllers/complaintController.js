const Complaint = require('../model/Complaint');
const PredefinedComplaint = require('../model/PredefinedComplaint');
const Guest = require('../model/Guest');
const Hotel = require('../model/Hotel');

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
  getHotelComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.find({ hotelId: req.user.hotelId });
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getGuestComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.find({ guestId: req.user._id });
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  addPredefinedComplaint: async (req, res) => {
    try {
      const complaint = new PredefinedComplaint(req.body);
      await complaint.save();
      res.status(201).json(complaint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getPredefinedComplaints: async (req, res) => {
    try {
      const complaints = await PredefinedComplaint.find({
        hotelId: req.params.hotelId,
        isActive: true
      });
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

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

  addStaffMessage: async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.complaintId);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      complaint.messages.push({
        message: req.body.message,
        isStaff: true
      });
      await complaint.save();
      res.json(complaint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addGuestMessage: async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.complaintId);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      complaint.messages.push({
        message: req.body.message,
        isStaff: false
      });
      await complaint.save();
      res.json(complaint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

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