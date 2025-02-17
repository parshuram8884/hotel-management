const Hotel = require('../model/Hotel');
const Guest = require('../model/Guest');
const Order = require('../model/Order');
const Complaint = require('../model/Complaint'); // Add this import

exports.getHotelStats = async (req, res) => {
    try {
        const { year, month } = req.query;
        
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required'
            });
        }

        res.setHeader('Content-Type', 'application/json');

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Get all hotels with their stats
        const hotels = await Hotel.find().select('hotelName email maxRooms roomRange');
        
        // Collect stats for each hotel
        const hotelStats = await Promise.all(hotels.map(async (hotel) => {
            // Get guest count for the month
            const totalGuests = await Guest.countDocuments({
                hotelId: hotel._id,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            // Get complaint count instead of requests
            const complaintCount = await Complaint.countDocuments({
                hotelId: hotel._id,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            // Exclude canceled orders
            const orders = await Order.find({
                hotelId: hotel._id,
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: 'cancelled' } // Exclude cancelled orders
            });

            const foodOrders = orders.length;
            // Remove the dollar conversion, use amount directly as it's already in rupees
            const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            return {
                _id: hotel._id,
                name: hotel.hotelName,
                totalGuests,
                complaints: complaintCount, // Changed from guestRequests
                foodOrders,
                revenue,
                status: hotel.maxRooms > 0 ? 'active' : 'inactive'
            };
        }));

        const response = {
            success: true,
            hotels: hotelStats,
            timestamp: new Date().toISOString()
        };

        return res.json(response);

    } catch (error) {
        console.error('Error in getHotelStats:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching hotel statistics',
            error: error.message
        });
    }
};
