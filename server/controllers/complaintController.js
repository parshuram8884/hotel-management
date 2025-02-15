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

// Export middleware functions directly
exports.getHotelComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ hotelId: req.user.hotelId });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGuestComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ guestId: req.user._id });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addPredefinedComplaint = async (req, res) => {
  try {
    const complaint = new PredefinedComplaint(req.body);
    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPredefinedComplaints = async (req, res) => {
  try {
    const complaints = await PredefinedComplaint.find({
      hotelId: req.params.hotelId,
      isActive: true
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitComplaint = async (req, res) => {
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
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.complaintId,
      { status: req.body.status },
      { new: true }
    );
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addStaffMessage = async (req, res) => {
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
};

exports.addGuestMessage = async (req, res) => {
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
};

exports.deleteComplaint = async (req, res) => {
  try {
    const result = await Complaint.findByIdAndDelete(req.params.complaintId);
    if (!result) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};