const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Hotel = require('../model/Hotel');
const Guest = require('../model/Guest');

const authController = {
    // Hotel authentication
    registerHotel: async (req, res) => {
        try {
            const { hotelName, email, password, address, phoneNumber, roomRange } = req.body;

            // Check if hotel already exists
            const existingHotel = await Hotel.findOne({ 
                $or: [{ email }, { hotelName }] 
            });
            if (existingHotel) {
                return res.status(400).json({ 
                    message: 'Hotel already registered with this email or name' 
                });
            }

            // Create new hotel
            const hotel = new Hotel({
                hotelName,
                email,
                password,
                address,
                phoneNumber,
                roomRange
            });

            await hotel.save();

            // Generate token
            const token = jwt.sign(
                { hotelId: hotel._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.cookie('staffToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(201).json({
                message: 'Hotel registered successfully',
                hotel: {
                    id: hotel._id,
                    hotelName: hotel.hotelName,
                    email: hotel.email
                },
                token
            });
        } catch (error) {
            console.error('Hotel registration error:', error);
            res.status(500).json({ message: 'Error registering hotel' });
        }
    },

    loginHotel: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find hotel
            const hotel = await Hotel.findOne({ email });
            if (!hotel) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await hotel.comparePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { hotelId: hotel._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.cookie('staffToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                hotel: {
                    id: hotel._id,
                    hotelName: hotel.hotelName,
                    email: hotel.email
                },
                token
            });
        } catch (error) {
            console.error('Hotel login error:', error);
            res.status(500).json({ message: 'Login failed' });
        }
    },

    // Guest authentication
    registerGuest: async (req, res) => {
        try {
            const { name, roomNumber, mobileNumber, hotelId, checkOutDate } = req.body;

            // Validate room number format
            if (!/^[A-Z0-9]+$/.test(roomNumber)) {
                return res.status(400).json({ message: 'Invalid room number format' });
            }

            // Check if room is already occupied
            const existingGuest = await Guest.findOne({
                hotelId,
                roomNumber,
                status: 'approved'
            });
            if (existingGuest) {
                return res.status(400).json({ message: 'Room already occupied' });
            }

            // Create new guest
            const guest = new Guest({
                name,
                roomNumber,
                mobileNumber,
                hotelId,
                checkOutDate,
                status: 'pending'
            });

            await guest.save();

            res.status(201).json({
                message: 'Registration successful. Please wait for staff approval.',
                guest: {
                    id: guest._id,
                    name: guest.name,
                    roomNumber: guest.roomNumber,
                    status: guest.status
                }
            });
        } catch (error) {
            console.error('Guest registration error:', error);
            res.status(500).json({ message: 'Error registering guest' });
        }
    },

    loginGuest: async (req, res) => {
        try {
            const { mobileNumber, roomNumber, hotelId } = req.body;

            // Find guest
            const guest = await Guest.findOne({
                mobileNumber,
                roomNumber,
                hotelId,
                status: 'approved'
            });

            if (!guest) {
                return res.status(401).json({ message: 'Invalid credentials or pending approval' });
            }

            // Check if past checkout date
            if (new Date(guest.checkOutDate) < new Date()) {
                return res.status(401).json({ message: 'Stay period has expired' });
            }

            // Generate token
            const token = jwt.sign(
                { 
                    guestId: guest._id,
                    checkOutDate: guest.checkOutDate
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.cookie('guestToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({
                guest: {
                    id: guest._id,
                    name: guest.name,
                    roomNumber: guest.roomNumber
                },
                token
            });
        } catch (error) {
            console.error('Guest login error:', error);
            res.status(500).json({ message: 'Login failed' });
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie('staffToken');
            res.clearCookie('guestToken');
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ message: 'Error during logout' });
        }
    },

    verifyToken: async (req, res) => {
        try {
            const token = req.cookies.staffToken || req.cookies.guestToken;
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (decoded.hotelId) {
                const hotel = await Hotel.findById(decoded.hotelId);
                if (!hotel) {
                    return res.status(401).json({ message: 'Invalid token' });
                }
                return res.json({
                    type: 'hotel',
                    user: {
                        id: hotel._id,
                        hotelName: hotel.hotelName,
                        email: hotel.email
                    }
                });
            }

            if (decoded.guestId) {
                const guest = await Guest.findById(decoded.guestId);
                if (!guest || guest.status !== 'approved') {
                    return res.status(401).json({ message: 'Invalid token' });
                }
                return res.json({
                    type: 'guest',
                    user: {
                        id: guest._id,
                        name: guest.name,
                        roomNumber: guest.roomNumber
                    }
                });
            }

            res.status(401).json({ message: 'Invalid token' });
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ message: 'Token verification failed' });
        }
    }
};

module.exports = authController;
