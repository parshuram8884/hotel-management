const Food = require('../model/Food');
const Order = require('../model/Order');
const Guest = require('../model/Guest');
const fs = require('fs');
const path = require('path');

// Helper function to clean up expired orders
const cleanupExpiredOrders = async (hotelId) => {
  try {
    // Get all guests who have checked out
    const expiredGuests = await Guest.find({
      hotelId,
      checkoutDate: { $lt: new Date() }
    });

    // Get their IDs
    const expiredGuestIds = expiredGuests.map(guest => guest._id);

    // Delete orders for expired guests
    if (expiredGuestIds.length > 0) {
      await Order.deleteMany({
        hotelId,
        guestId: { $in: expiredGuestIds }
      });
    }
  } catch (error) {
    console.error('Error cleaning up expired orders:', error);
  }
};

const foodController = {
  // Add new food item
  addFood: async (req, res) => {
    try {
      if (!req.hotel || !req.hotel._id) {
        return res.status(401).json({ message: 'Hotel authentication required' });
      }

      const { name, price } = req.body;
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
      }

      const food = new Food({
        name: name.toUpperCase(),
        price: Number(price),
        imageUrl: `/uploads/food-images/${req.file.filename}`,
        hotelId: req.hotel._id,
        isAvailable: true
      });

      await food.save();
      console.log('Food added:', food); // Debug log
      res.status(201).json({ message: 'Food item added successfully', food });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error adding food:', error);
      res.status(500).json({ message: 'Error adding food item', error: error.message });
    }
  },

  // Simplify getFoodItems
  getFoodItems: async (req, res) => {
    try {
      const { hotelId } = req.params;
      
      // Basic query with hotelId
      const query = { hotelId };

      // Add condition for URLs containing 'menu'
      if (req.path.includes('/menu')) {
        query.isAvailable = true;
      }

      const foods = await Food.find(query).sort({ name: 1 });

      // Transform each food item to include full image URL
      const transformedFoods = foods.map(food => ({
        ...food.toObject(),
        imageUrl: `https://hotel-management-server-a3o3.onrender.com/uploads/food-images/${path.basename(food.imageUrl)}`
      }));

      console.log('Sending foods:', transformedFoods); // Debug log
      res.json(transformedFoods);
    } catch (error) {
      console.error('Error fetching food items:', error);
      res.status(500).json({ message: 'Error fetching food items' });
    }
  },

  // Update food item
  updateFood: async (req, res) => {
    try {
      const food = await Food.findById(req.params.foodId);
      if (!food) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      if (food.hotelId.toString() !== req.hotel._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this food item' });
      }

      const { name, price, isAvailable } = req.body;
      let imageUrl = food.imageUrl;

      // If new image is uploaded
      if (req.file) {
        // Delete old image
        const oldImagePath = path.join(__dirname, '..', food.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        imageUrl = `/uploads/food-images/${req.file.filename}`;
      }

      Object.assign(food, {
        name: name || food.name,
        price: price || food.price,
        imageUrl,
        isAvailable: isAvailable !== undefined ? isAvailable : food.isAvailable
      });

      await food.save();
      res.json({ message: 'Food item updated successfully', food });
    } catch (error) {
      // Delete uploaded file if there's an error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error updating food:', error);
      res.status(500).json({ message: 'Error updating food item' });
    }
  },

  // Delete food item
  deleteFood: async (req, res) => {
    try {
      const food = await Food.findById(req.params.foodId);
      if (!food) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      if (food.hotelId.toString() !== req.hotel._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this food item' });
      }

      // Delete image file
      const imagePath = path.join(__dirname, '..', food.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await Food.findByIdAndDelete(req.params.foodId);
      res.json({ message: 'Food item deleted successfully' });
    } catch (error) {
      console.error('Error deleting food:', error);
      res.status(500).json({ message: 'Error deleting food item' });
    }
  },

  // Place order
  placeOrder: async (req, res) => {
    try {
      const { items } = req.body;
      const guestId = req.guest._id;
      const hotelId = req.guest.hotelId;
      const roomNumber = req.guest.roomNumber;

      // Calculate total amount and verify food items
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const food = await Food.findById(item.foodId);
        if (!food || !food.isAvailable) {
          return res.status(400).json({ 
            message: `Food item ${item.foodId} is not available` 
          });
        }
        
        const itemTotal = food.price * item.quantity;
        totalAmount += itemTotal;
        orderItems.push({
          foodId: food._id,
          quantity: item.quantity,
          price: food.price
        });
      }

      const order = new Order({
        guestId,
        hotelId,
        items: orderItems,
        totalAmount,
        roomNumber
      });

      await order.save();
      
      const populatedOrder = await Order.findById(order._id)
        .populate('items.foodId', 'name price');

      res.status(201).json({ 
        message: 'Order placed successfully', 
        order: populatedOrder 
      });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ message: 'Error placing order' });
    }
  },

  // Get orders for hotel
  getHotelOrders: async (req, res) => {
    try {
      const hotelId = req.params.hotelId;
      console.log('Getting orders for hotel:', hotelId); // Debug log

      if (!hotelId) {
        return res.status(400).json({ message: 'Hotel ID is required' });
      }

      const orders = await Order.find({ hotelId })
        .populate('guestId', 'name roomNumber')
        .populate('items.foodId', 'name price')
        .sort({ createdAt: -1 });

      console.log(`Found ${orders.length} orders`); // Debug log
      res.json(orders);
    } catch (error) {
      console.error('Error in getHotelOrders:', error);
      res.status(500).json({ message: 'Error fetching orders' });
    }
  },

  // Get guest orders
  getGuestOrders: async (req, res) => {
    try {
      // Check if guest has checked out
      const guest = await Guest.findById(req.guest._id);
      if (!guest || guest.checkoutDate < new Date()) {
        return res.json([]);
      }

      const orders = await Order.find({ guestId: req.guest._id })
        .populate('items.foodId', 'name price')
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      console.error('Error fetching guest orders:', error);
      res.status(500).json({ message: 'Error fetching orders' });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      console.log('Updating order:', orderId, 'to status:', status); // Debug log

      if (!orderId || !status) {
        return res.status(400).json({ message: 'Order ID and status are required' });
      }

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Update the order status
      order.status = status;
      await order.save();

      // Fetch the updated order with populated fields
      const updatedOrder = await Order.findById(orderId)
        .populate('guestId', 'name roomNumber')
        .populate('items.foodId', 'name price');

      console.log('Order updated successfully:', updatedOrder); // Debug log

      res.json({
        message: 'Order status updated successfully',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      res.status(500).json({ message: 'Error updating order status' });
    }
  }
};

module.exports = foodController;