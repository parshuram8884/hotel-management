const Hotel = require('../models/Hotel');
const Guest = require('../models/Guest');
const Order = require('../models/Order');
const Request = require('../models/Request');

exports.getHotelStats = async (req, res) => {
    try {
        const { year, month } = req.query;
        
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required'
            });
        }

        // Set proper headers
        res.setHeader('Content-Type', 'application/json');

        // Convert month and year to date range
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Get all hotels
        const hotels = await Hotel.find();
        
        // Collect stats for each hotel
        const hotelStats = await Promise.all(hotels.map(async (hotel) => {
            // Get guest count
            const totalGuests = await Guest.countDocuments({
                hotelId: hotel._id,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            // Get request count
            const guestRequests = await Request.countDocuments({
                hotelId: hotel._id,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            // Get order stats
            const orders = await Order.find({
                hotelId: hotel._id,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const foodOrders = orders.length;
            const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            return {
                _id: hotel._id,
                name: hotel.name,
                totalGuests,
                guestRequests,
                foodOrders,
                revenue,
                status: hotel.status || 'inactive'
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
}
