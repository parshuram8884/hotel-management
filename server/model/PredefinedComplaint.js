const mongoose = require('mongoose');

const preDefinedComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    uppercase: true // This will automatically convert the title to uppercase
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Add index for faster queries
preDefinedComplaintSchema.index({ hotelId: 1, isActive: 1 });

module.exports = mongoose.model('PreDefinedComplaint', preDefinedComplaintSchema);