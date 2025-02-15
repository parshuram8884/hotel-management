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

module.exports = {
    async getHotelComplaints(req, res) {
        try {
            const complaints = await Complaint.find({ hotelId: req.hotel._id });
            res.json(complaints);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async getGuestComplaints(req, res) {
        try {
            const complaints = await Complaint.find({ guestId: req.guest._id });
            res.json(complaints);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async addPredefinedComplaint(req, res) {
        try {
            const complaint = new PredefinedComplaint({
                ...req.body,
                hotelId: req.hotel._id
            });
            const saved = await complaint.save();
            res.status(201).json(saved);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getPredefinedComplaints(req, res) {
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

    async submitComplaint(req, res) {
        try {
            const complaint = new Complaint({
                ...req.body,
                guestId: req.guest._id,
                hotelId: req.body.hotelId
            });
            const saved = await complaint.save();
            res.status(201).json(saved);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async updateComplaintStatus(req, res) {
        try {
            const complaint = await Complaint.findOneAndUpdate(
                { _id: req.params.complaintId, hotelId: req.hotel._id },
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
    },

    async addStaffMessage(req, res) {
        try {
            const complaint = await Complaint.findOne({
                _id: req.params.complaintId,
                hotelId: req.hotel._id
            });
            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }
            complaint.messages.push({
                message: req.body.message,
                isStaff: true
            });
            const updated = await complaint.save();
            res.json(updated);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async addGuestMessage(req, res) {
        try {
            const complaint = await Complaint.findOne({
                _id: req.params.complaintId,
                guestId: req.guest._id
            });
            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }
            complaint.messages.push({
                message: req.body.message,
                isStaff: false
            });
            const updated = await complaint.save();
            res.json(updated);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deleteComplaint(req, res) {
        try {
            const result = await Complaint.findOneAndDelete({
                _id: req.params.complaintId,
                hotelId: req.hotel._id
            });
            if (!result) {
                return res.status(404).json({ message: 'Complaint not found' });
            }
            res.status(200).json({ message: 'Complaint deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};