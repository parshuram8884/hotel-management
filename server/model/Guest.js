const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Add your room number format validation here
        return /^[A-Z0-9]+$/.test(v);
      },
      message: props => `${props.value} is not a valid room number!`
    }
  },
  mobileNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(?:\+91|91)?[6-9]\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Indian mobile number!`
    }
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'checked-out'],
    default: 'pending'
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add index for querying guests by hotel and status
guestSchema.index({ hotelId: 1, status: 1 });

// Add compound index to prevent duplicate room assignments
guestSchema.index({ 
  hotelId: 1, 
  roomNumber: 1, 
  status: 1 
}, { 
  unique: true, 
  partialFilterExpression: { status: 'approved' } 
});

module.exports = mongoose.model('Guest', guestSchema);