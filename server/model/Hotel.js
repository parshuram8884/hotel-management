const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hotelSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(?:\+91|91)?[6-9]\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Indian mobile number!`
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  maxRooms: {
    type: Number,
    default: 10, // Default room limit
    min: 1,
    max: 1000
  },
  roomRange: {
    start: {
      type: Number,
      default: 100,
      min: 1,
      max: 9999
    },
    end: {
      type: Number,
      default: 999,
      min: 1,
      max: 9999
    }
  }
}, { timestamps: true });

// Hash password before saving
hotelSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Add validation for room range
hotelSchema.pre('save', function(next) {
  if (this.roomRange.start >= this.roomRange.end) {
    next(new Error('Room range start must be less than end'));
  }
  next();
});

// Method to compare password
hotelSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Hotel', hotelSchema);