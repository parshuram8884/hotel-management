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

      console.log('Received registration request:', {
        body: req.body,
        params: req.params,
        hotelId
      });

      // Validate hotelId
      if (!hotelId) {
        console.log('Missing hotelId');
        return res.status(400).json({ message: 'Hotel ID is required' });
      }

      // Find hotel
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        console.log('Hotel not found for ID:', hotelId);
        return res.status(404).json({ message: 'Hotel not found' });
      }

      console.log('Found hotel:', hotel.hotelName);

      // Create guest
      const guest = new Guest({
        name: name.toUpperCase(),
        roomNumber: roomNumber.toUpperCase(),
        mobileNumber,
        hotelId,
        checkOutDate,
        status: 'pending'
      });

      await guest.save();
      console.log('Guest saved successfully:', guest);

      const token = jwt.sign(
        { guestId: guest._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Registration submitted successfully',
        token,
        guest: {
          id: guest._id,
          name: guest.name,
          roomNumber: guest.roomNumber,
          status: guest.status,
          hotelId: guest.hotelId
        }
      });
    } catch (error) {
      console.error('Guest registration error:', error);
      res.status(500).json({ 
        message: 'Registration failed', 
        error: error.message 
      });
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
  },

  // Add loginGuest method
  loginGuest: async (req, res) => {
    try {
      const { roomNumber, mobileNumber, hotelId } = req.body;

      // Find guest
      const guest = await Guest.findOne({
        roomNumber,
        mobileNumber,
        hotelId,
        status: 'approved'
      });

      if (!guest) {
        return res.status(401).json({ 
          message: 'Invalid credentials or pending approval' 
        });
      }

      // Check if today is the check-in date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(guest.createdAt);
      checkInDate.setHours(0, 0, 0, 0);
      const checkOutDate = new Date(guest.checkOutDate);
      checkOutDate.setHours(23, 59, 59, 999);

      if (today < checkInDate) {
        return res.status(403).json({ 
          message: 'Your stay has not started yet' 
        });
      }

      if (today > checkOutDate) {
        return res.status(403).json({ 
          message: 'Your stay period has expired' 
        });
      }

      // Generate token
      const token = jwt.sign(
        { 
          guestId: guest._id,
          checkInDate: guest.createdAt,
          checkOutDate: guest.checkOutDate
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        guest: {
          id: guest._id,
          name: guest.name,
          roomNumber: guest.roomNumber,
          checkInDate: guest.createdAt,
          checkOutDate: guest.checkOutDate
        }
      });
    } catch (error) {
      console.error('Guest login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  },

  // Add room validation middleware
  validateRoomNumber: async (req, res, next) => {
    try {
      const { roomNumber, hotelId } = req.body;
      const hotel = await Hotel.findById(hotelId);
      
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      const roomNum = parseInt(roomNumber);
      const start = parseInt(hotel.roomRange.start);
      const end = parseInt(hotel.roomRange.end);

      if (isNaN(roomNum) || roomNum < start || roomNum > end) {
        return res.status(400).json({ 
          message: `Room number must be between ${start} and ${end}` 
        });
      }

      // Check if maximum room limit is reached
      const currentGuests = await Guest.countDocuments({
        hotelId,
        status: 'approved'
      });

      if (currentGuests >= hotel.maxRooms) {
        return res.status(400).json({ 
          message: 'Hotel has reached maximum guest capacity' 
        });
      }

      next();
    } catch (error) {
      console.error('Room validation error:', error);
      res.status(500).json({ message: 'Validation failed' });
    }
  }
};

// Set up automatic cleaning of expired guests
setInterval(guestController.cleanExpiredGuests, 1000 * 60 * 60); // Run every hour

module.exports = guestController;