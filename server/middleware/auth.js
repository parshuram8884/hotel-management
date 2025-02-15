const jwt = require('jsonwebtoken');
const Hotel = require('../model/Hotel');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.staffToken || 
                     req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            console.log('No token provided'); // Debug log
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Debug log

        if (!decoded.hotelId) {
            console.log('No hotelId in token'); // Debug log
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const hotel = await Hotel.findById(decoded.hotelId);
        if (!hotel) {
            console.log('No hotel found for ID:', decoded.hotelId); // Debug log
            return res.status(401).json({ message: 'Hotel not found' });
        }

        req.hotel = hotel;
        req.hotelId = hotel._id;
        console.log('Auth successful for hotel:', hotel._id); // Debug log
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};

const guestAuth = async (req, res, next) => {
  try {
    const token = req.cookies.guestToken || 
                 req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Guest authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if past checkout date
    if (new Date(decoded.checkOutDate) < new Date()) {
      res.clearCookie('guestToken');
      return res.status(401).json({ message: 'Stay period has expired' });
    }

    req.guestId = decoded.guestId;
    next();
  } catch (error) {
    console.error('Guest auth middleware error:', error);
    res.status(401).json({ message: 'Guest authentication failed' });
  }
};

module.exports = { auth, guestAuth };