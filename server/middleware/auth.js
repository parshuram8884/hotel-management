const jwt = require('jsonwebtoken');
const Hotel = require('../model/Hotel');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies.staffToken;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.hotelId) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const hotel = await Hotel.findById(decoded.hotelId);
    if (!hotel) {
      return res.status(401).json({ message: 'Hotel not found' });
    }

    req.hotel = hotel;
    req.hotelId = hotel._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};



module.exports = { auth };