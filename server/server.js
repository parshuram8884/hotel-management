require('dotenv').config();
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

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads/food-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: ['https://hotel-management-client.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory with proper headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

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