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

exports.getHotelComplaints = (req, res) => {
    Complaint.find({ hotelId: req.hotel._id })
        .then(complaints => res.json(complaints))
        .catch(error => res.status(500).json({ message: error.message }));
};

exports.getGuestComplaints = (req, res) => {
    Complaint.find({ guestId: req.guest._id })
        .then(complaints => res.json(complaints))
        .catch(error => res.status(500).json({ message: error.message }));
};

exports.addPredefinedComplaint = (req, res) => {
    const complaint = new PredefinedComplaint({
        ...req.body,
        hotelId: req.hotel._id
    });
    complaint.save()
        .then(saved => res.status(201).json(saved))
        .catch(error => res.status(400).json({ message: error.message }));
};

exports.getPredefinedComplaints = (req, res) => {
    PredefinedComplaint.find({
        hotelId: req.params.hotelId,
        isActive: true
    })
        .then(complaints => res.json(complaints))
        .catch(error => res.status(500).json({ message: error.message }));
};

exports.submitComplaint = (req, res) => {
    const complaint = new Complaint({
        ...req.body,
        guestId: req.guest._id
    });
    complaint.save()
        .then(saved => res.status(201).json(saved))
        .catch(error => res.status(400).json({ message: error.message }));
};

exports.updateComplaintStatus = (req, res) => {
    Complaint.findOneAndUpdate(
        { _id: req.params.complaintId, hotelId: req.hotel._id },
        { status: req.body.status },
        { new: true }
    )
        .then(complaint => {
            if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
            res.json(complaint);
        })
        .catch(error => res.status(400).json({ message: error.message }));
};

exports.addStaffMessage = (req, res) => {
    Complaint.findOne({ _id: req.params.complaintId, hotelId: req.hotel._id })
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
};

exports.addGuestMessage = (req, res) => {
    Complaint.findOne({ _id: req.params.complaintId, guestId: req.guest._id })
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
};

exports.deleteComplaint = (req, res) => {
    Complaint.findOneAndDelete({ _id: req.params.complaintId, hotelId: req.hotel._id })
        .then(result => {
            if (!result) return res.status(404).json({ message: 'Complaint not found' });
            res.status(200).json({ message: 'Complaint deleted successfully' });
        })
        .catch(error => res.status(500).json({ message: error.message }));
};