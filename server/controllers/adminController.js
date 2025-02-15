const Admin = require('../model/Admin');
const Hotel = require('../model/Hotel');
const Complaint = require('../model/Complaint');
const FoodOrder = require('../model/FoodOrder');
const Guest = require('../model/Guest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const adminController = {
  // Admin authentication
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await Admin.findOne({ username });
      
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { adminId: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, admin: { id: admin._id, username: admin.username, role: admin.role } });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Get hotels count
      const totalHotels = await Hotel.countDocuments();
      
      // Get today's complaints
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayComplaints = await Complaint.countDocuments({
        createdAt: { $gte: today }
      });

      // Get today's food orders
      const todayOrders = await FoodOrder.countDocuments({
        createdAt: { $gte: today }
      });

      // Get occupancy stats
      const hotels = await Hotel.find();
      const occupancyStats = await Promise.all(
        hotels.map(async (hotel) => {
          const occupiedRooms = await Guest.countDocuments({
            hotelId: hotel._id,
            status: 'approved',
            checkOutDate: { $gt: new Date() }
          });
          
          return {
            hotelName: hotel.hotelName,
            totalRooms: hotel.roomRange ? 
              (hotel.roomRange.end - hotel.roomRange.start + 1) : 0,
            occupiedRooms,
          };
        })
      );

      res.json({
        totalHotels,
        todayComplaints,
        todayOrders,
        occupancyStats
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
  }
};

module.exports = adminController;
