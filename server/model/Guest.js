const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
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

module.exports = mongoose.model('Guest', guestSchema);