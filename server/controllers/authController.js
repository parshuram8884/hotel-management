const Hotel = require('../model/Hotel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const authController = {
    signup: async (req, res) => {
        try {
            const { hotelName, email, password, address, phoneNumber } = req.body;

            // Validate required fields
            if (!hotelName || !email || !password || !address || !phoneNumber) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if hotel exists
            const existingHotel = await Hotel.findOne({ 
                $or: [{ email }, { hotelName }] 
            });

            if (existingHotel) {
                return res.status(400).json({ 
                    message: 'Hotel already registered with this email or name' 
                });
            }

            // Create hotel
            const hotel = new Hotel({
                hotelName,
                email,
                password,
                address,
                phoneNumber
            });

            await hotel.save();

            const token = jwt.sign(
                { hotelId: hotel._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'Registration successful',
                token,
                hotel: {
                    id: hotel._id,
                    hotelName: hotel.hotelName,
                    email: hotel.email
                }
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ 
                message: 'Registration failed', 
                error: error.message 
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const hotel = await Hotel.findOne({ email });
            if (!hotel) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await hotel.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

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
                token,
                hotel: {
                    id: hotel._id,
                    hotelName: hotel.hotelName,
                    email: hotel.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                message: 'Login failed', 
                error: error.message 
            });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const hotel = await Hotel.findOne({ email });

            if (!hotel) {
                return res.status(404).json({ message: 'Hotel not found' });
            }

            const resetToken = crypto.randomBytes(20).toString('hex');
            hotel.resetPasswordToken = resetToken;
            hotel.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            // Create transporter with verbose error logging
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                debug: true, // Enable debug logging
                logger: true  // Log to console
            });

            // Verify SMTP connection configuration
            try {
                await transporter.verify();
                console.log('SMTP connection verified successfully');
            } catch (smtpError) {
                console.error('SMTP Verification failed:', smtpError);
                return res.status(500).json({ message: 'Email service configuration error' });
            }

            const resetUrl = `https://hotel-management-client.onrender.com/reset-password/${resetToken}`;
            
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Password Reset Request',
                    html: `
                        <h1>Password Reset Request</h1>
                        <p>Please click on the following link to reset your password:</p>
                        <a href="${resetUrl}">${resetUrl}</a>
                        <p>This link will expire in 1 hour.</p>
                        <p>If you did not request this, please ignore this email.</p>
                    `
                });

                await hotel.save();
                res.json({ message: 'Password reset email sent' });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                res.status(500).json({ message: 'Failed to send reset email' });
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            const hotel = await Hotel.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!hotel) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }

            hotel.password = newPassword;
            hotel.resetPasswordToken = undefined;
            hotel.resetPasswordExpires = undefined;
            await hotel.save();

            res.json({ message: 'Password reset successful' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getSettings: async (req, res) => {
        try {
            const hotel = await Hotel.findById(req.params.hotelId);
            if (!hotel) {
                return res.status(404).json({ message: 'Hotel not found' });
            }
            res.json({
                maxRooms: hotel.maxRooms,
                roomRange: hotel.roomRange
            });
        } catch (error) {
            console.error('Get settings error:', error);
            res.status(500).json({ 
                message: 'Error fetching settings',
                error: error.message
            });
        }
    },

    updateSettings: async (req, res) => {
        try {
            const { maxRooms, roomRange } = req.body;
            const hotel = await Hotel.findByIdAndUpdate(
                req.hotel._id,
                { maxRooms, roomRange },
                { new: true, runValidators: true }
            );

            if (!hotel) {
                return res.status(404).json({ message: 'Hotel not found' });
            }

            res.json({
                message: 'Settings updated successfully',
                settings: {
                    maxRooms: hotel.maxRooms,
                    roomRange: hotel.roomRange
                }
            });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({ 
                message: 'Error updating settings',
                error: error.message
            });
        }
    }
};

module.exports = authController;