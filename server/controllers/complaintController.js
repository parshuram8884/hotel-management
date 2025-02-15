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
    getHotelComplaints: function(req, res) {
        Complaint.find({ hotelId: req.user.hotelId })
            .then(complaints => res.json(complaints))
            .catch(error => res.status(500).json({ message: error.message }));
    },

    getGuestComplaints: function(req, res) {
        Complaint.find({ guestId: req.user._id })
            .then(complaints => res.json(complaints))
            .catch(error => res.status(500).json({ message: error.message }));
    },

    addPredefinedComplaint: function(req, res) {
        const complaint = new PredefinedComplaint(req.body);
        complaint.save()
            .then(saved => res.status(201).json(saved))
            .catch(error => res.status(400).json({ message: error.message }));
    },

    getPredefinedComplaints: function(req, res) {
        PredefinedComplaint.find({ 
            hotelId: req.params.hotelId,
            isActive: true 
        })
            .then(complaints => res.json(complaints))
            .catch(error => res.status(500).json({ message: error.message }));
    },

    submitComplaint: function(req, res) {
        const complaint = new Complaint({
            ...req.body,
            guestId: req.user._id
        });
        complaint.save()
            .then(saved => res.status(201).json(saved))
            .catch(error => res.status(400).json({ message: error.message }));
    },

    updateComplaintStatus: function(req, res) {
        Complaint.findByIdAndUpdate(
            req.params.complaintId,
            { status: req.body.status },
            { new: true }
        )
            .then(complaint => {
                if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
                res.json(complaint);
            })
            .catch(error => res.status(400).json({ message: error.message }));
    },

    addStaffMessage: function(req, res) {
        Complaint.findById(req.params.complaintId)
            .then(complaint => {
                if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
                complaint.messages.push({
                    message: req.body.message,
                    isStaff: true
                });
                return complaint.save();
            })
            .then(updated => res.json(updated))
            .catch(error => res.status(400).json({ message: error.message }));
    },

    addGuestMessage: function(req, res) {
        Complaint.findById(req.params.complaintId)
            .then(complaint => {
                if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
                complaint.messages.push({
                    message: req.body.message,
                    isStaff: false
                });
                return complaint.save();
            })
            .then(updated => res.json(updated))
            .catch(error => res.status(400).json({ message: error.message }));
    },

    deleteComplaint: function(req, res) {
        Complaint.findByIdAndDelete(req.params.complaintId)
            .then(result => {
                if (!result) return res.status(404).json({ message: 'Complaint not found' });
                res.status(200).json({ message: 'Complaint deleted successfully' });
            })
            .catch(error => res.status(500).json({ message: error.message }));
    }
};

module.exports = complaintController;