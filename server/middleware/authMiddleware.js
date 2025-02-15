const jwt = require('jsonwebtoken');
const Guest = require('../model/Guest')

const guestAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const guest = await Guest.findById(decoded.guestId);
    
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    if (guest.status !== 'approved') {
      return res.status(403).json({ message: 'Awaiting staff approval' });
    }

    req.guest = guest;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = guestAuth;