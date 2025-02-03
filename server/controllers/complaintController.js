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
      if (!req.hotel || !req.hotel._id) {
        return res.status(401).json({ message: 'Hotel authentication required' });
      }

      // Delete old complaints before fetching
      await deleteOldComplaints();

      const complaints = await Complaint.find({ 
        hotelId: req.hotel._id 
      })
      .populate('guestId', 'name roomNumber')
      .sort({ createdAt: -1 });
      
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      res.status(500).json({ message: 'Error fetching complaints' });
    }
  },

  // Get guest complaints
  getGuestComplaints: async (req, res) => {
    try {
      // Delete old complaints before fetching
      await deleteOldComplaints();

      const complaints = await Complaint.find({ 
        guestId: req.guest._id 
      }).sort({ createdAt: -1 });
      
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching guest complaints:', error);
      res.status(500).json({ message: 'Error fetching complaints' });
    }
  },

  // Add predefined complaint
  addPredefinedComplaint: async (req, res) => {
    try {
      if (!req.hotel || !req.hotel._id) {
        return res.status(401).json({ message: 'Hotel authentication required' });
      }

      const { title } = req.body;
      const hotelId = req.hotel._id;

      const complaint = new PreDefinedComplaint({
        title: title.toUpperCase(),
        hotelId
      });

      await complaint.save();
      res.status(201).json({ message: 'Predefined complaint added', complaint });
    } catch (error) {
      console.error('Error adding predefined complaint:', error);
      res.status(500).json({ message: 'Error adding predefined complaint' });
    }
  },

  // Get predefined complaints for a hotel
  getPredefinedComplaints: async (req, res) => {
    try {
      const hotelId = req.params.hotelId;
      const complaints = await PreDefinedComplaint.find({ 
        hotelId,
        isActive: true 
      });
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching predefined complaints:', error);
      res.status(500).json({ message: 'Error fetching predefined complaints' });
    }
  },

  // Submit a complaint (both predefined and custom)
  submitComplaint: async (req, res) => {
    try {
      const { title, description, isPredefined } = req.body;
      const guestId = req.guest._id;
      const hotelId = req.guest.hotelId;

      const complaint = new Complaint({
        title: title.toUpperCase(),
        description,
        guestId,
        hotelId,
        isPredefined,
        status: 'pending',
        messages: [{
          message: description,
          isStaff: false,
          timestamp: new Date()
        }]
      });

      await complaint.save();

      // Populate guest info before sending response
      const populatedComplaint = await Complaint.findById(complaint._id)
        .populate('guestId', 'name roomNumber');

      res.status(201).json({ 
        message: 'Complaint submitted successfully', 
        complaint: populatedComplaint 
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      res.status(500).json({ message: 'Error submitting complaint' });
    }
  },

  // Update complaint status
  updateComplaintStatus: async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.complaintId);

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaint.hotelId.toString() !== req.hotel._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this complaint' });
      }

      complaint.status = req.body.status;
      await complaint.save();

      res.json({ message: 'Status updated successfully', complaint });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ message: 'Error updating status' });
    }
  },

  // Add staff message
  addStaffMessage: async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.complaintId);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaint.hotelId.toString() !== req.hotel._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to message this complaint' });
      }

      complaint.messages.push({
        message: req.body.message,
        isStaff: true,
        timestamp: new Date()
      });

      const updatedComplaint = await complaint.save();
      const populatedComplaint = await Complaint.findById(updatedComplaint._id)
        .populate('guestId', 'name roomNumber');

      res.json(populatedComplaint);
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ message: 'Error adding message' });
    }
  },

  // Add guest message
  addGuestMessage: async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.complaintId);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaint.guestId.toString() !== req.guest._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to message this complaint' });
      }

      complaint.messages.push({
        message: req.body.message,
        isStaff: false,
        timestamp: new Date()
      });

      await complaint.save();
      res.json(complaint);
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ message: 'Error adding message' });
    }
  },

  // Delete complaint
  deleteComplaint: async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.complaintId);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaint.hotelId.toString() !== req.hotel._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this complaint' });
      }

      if (complaint.status !== 'resolved') {
        return res.status(400).json({ message: 'Can only delete resolved complaints' });
      }

      await Complaint.findByIdAndDelete(req.params.complaintId);
      res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
      console.error('Error deleting complaint:', error);
      res.status(500).json({ message: 'Error deleting complaint' });
    }
  }
};

module.exports = complaintController;