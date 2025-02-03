const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
    default: 'pending'
  },
  roomNumber: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Indexes for faster queries
orderSchema.index({ hotelId: 1, status: 1 });
orderSchema.index({ guestId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order; 