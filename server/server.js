

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const guestRoutes = require('./routes/guestRoutes')
const complaintRoutes = require('./routes/complaintRoutes')
const foodRoutes = require('./routes/foodRoutes')
const cookieParser = require('cookie-parser');

const app = express();

// Move dotenv config to very top
require('dotenv').config();

// Verify environment variables are loaded
console.log('Environment Check:', {
  CLOUDINARY_CONFIG: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
    apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
  }
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads/food-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: ['https://hotel-management-client.onrender.com', 'https://hotel-management-admin-7t7g.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Update static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add CORS headers specifically for images
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  }
  next();
});

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/food', foodRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});