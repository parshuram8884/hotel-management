const Guest = require('../model/Guest');
const jwt = require('jsonwebtoken');
const Hotel = require('../model/Hotel');

// Add exports for each controller function
const guestController = {
  verifyHotel: async (req, res) => {
    try {
      const hotel = await Hotel.findById(req.params.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      res.json({ 
        hotel: {
          id: hotel._id,
          hotelName: hotel.hotelName
        }
      });
    } catch (error) {
      console.error('Verify hotel error:', error);
      res.status(500).json({ message: 'Error verifying hotel' });
    }
  },

  registerGuest: async (req, res) => {
    try {
      const { name, roomNumber, mobileNumber, checkOutDate } = req.body;
      const hotelId = req.params.hotelId;

      // Get hotel and validate room range
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      // Format inputs and dates
      const uppercaseName = name.toUpperCase();
      const uppercaseRoomNumber = roomNumber.toUpperCase();
      const checkOut = new Date(checkOutDate);
      const now = new Date();

      // Validate checkout date
      if (checkOut <= now) {
        return res.status(400).json({ 
          message: 'Check-out date must be in the future' 
        });
      }

      // First, find if room is occupied
      const occupiedRoom = await Guest.findOne({
        hotelId,
        roomNumber: uppercaseRoomNumber,
        status: 'approved',
        checkOutDate: { $gt: now }
      });

      if (occupiedRoom) {
        // If room is occupied, check if it's the same person
        if (
          occupiedRoom.name === uppercaseName &&
          occupiedRoom.mobileNumber === mobileNumber &&
          occupiedRoom.checkOutDate.getTime() === checkOut.getTime()
        ) {
          // Same person, same details - auto-approve
          const token = jwt.sign(
            { guestId: occupiedRoom._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.status(200).json({
            message: 'Welcome back! Auto-approved.',
            token,
            guest: occupiedRoom
          });
        } else {
          // Different person or details - reject
          return res.status(400).json({
            message: 'This room is currently occupied by another guest.'
          });
        }
      }

      // Room is not occupied, create new guest registration
      const newGuest = new Guest({
        name: uppercaseName,
        roomNumber: uppercaseRoomNumber,
        mobileNumber,
        checkOutDate: checkOut,
        hotelId,
        status: 'pending'
      });

      await newGuest.save();

      const token = jwt.sign(
        { guestId: newGuest._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Registration submitted. Awaiting staff approval.',
        token,
        guest: newGuest
      });

    } catch (error) {
      console.error('Register guest error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  getGuestStatus: async (req, res) => {
    try {
      const guest = await Guest.findById(req.params.guestId);
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      res.json({ 
        status: guest.status,
        guest: {
          id: guest._id,
          name: guest.name,
          status: guest.status
        }
      });
    } catch (error) {
      console.error('Get guest status error:', error);
      res.status(500).json({ message: 'Error fetching status' });
    }
  },

  getPendingGuests: async (req, res) => {
    try {
      const hotelId = req.params.hotelId;
      console.log('Fetching pending guests for hotel:', hotelId); // Debug log

      const guests = await Guest.find({ 
        hotelId,
        status: 'pending'
      }).sort({ createdAt: -1 });

      console.log('Found pending guests:', guests); // Debug log
      res.json(guests);
    } catch (error) {
      console.error('Get pending guests error:', error);
      res.status(500).json({ message: 'Error fetching pending guests' });
    }
  },

  approveGuest: async (req, res) => {
    try {
      const guest = await Guest.findById(req.params.guestId);
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found' });
      }

      guest.status = 'approved';
      await guest.save();

      res.json({ message: 'Guest approved successfully', guest });
    } catch (error) {
      console.error('Approve guest error:', error);
      res.status(500).json({ message: 'Error approving guest' });
    }
  },

  rejectGuest: async (req, res) => {
    try {
      const guest = await Guest.findById(req.params.guestId);
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found' });
      }

      guest.status = 'rejected';
      guest.rejectionReason = req.body.reason || 'Invalid details provided';
      await guest.save();

      res.json({ 
        message: 'Guest rejected successfully', 
        guest,
        rejectionReason: guest.rejectionReason 
      });
    } catch (error) {
      console.error('Reject guest error:', error);
      res.status(500).json({ message: 'Error rejecting guest' });
    }
  },

  // Add method to clean expired guests
  cleanExpiredGuests: async () => {
    try {
      const result = await Guest.updateMany(
        {
          checkOutDate: { $lt: new Date() },
          status: 'approved'
        },
        {
          $set: { status: 'checked-out' }
        }
      );
      console.log(`Cleaned ${result.modifiedCount} expired guest records`);
    } catch (error) {
      console.error('Clean expired guests error:', error);
    }
  },

  // Add method to get all approved guests for a hotel
  getApprovedGuests: async (req, res) => {
    try {
      const hotelId = req.params.hotelId;
      const guests = await Guest.find({
        hotelId,
        status: 'approved',
        checkOutDate: { $gt: new Date() }
      }).sort({ checkOutDate: 1 });

      res.json(guests);
    } catch (error) {
      console.error('Get approved guests error:', error);
      res.status(500).json({ message: 'Error fetching approved guests' });
    }
  }
};

// Set up automatic cleaning of expired guests
setInterval(guestController.cleanExpiredGuests, 1000 * 60 * 60); // Run every hour

module.exports = guestController;