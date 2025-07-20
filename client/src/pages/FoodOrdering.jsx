import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const FoodOrdering = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const guestInfo = JSON.parse(localStorage.getItem('guestInfo'));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/food/menu/${guestInfo.hotelId}`
      );
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error('Error loading food items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (food) => {
    const existingItem = cart.find(item => item.foodId === food._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.foodId === food._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { foodId: food._id, name: food.name, price: food.price, quantity: 1 }]);
    }
    toast.success(`Added ${food.name} to cart`);
  };

  const removeFromCart = (foodId) => {
    setCart(cart.filter(item => item.foodId !== foodId));
  };

  const updateQuantity = (foodId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(foodId);
      return;
    }
    setCart(cart.map(item =>
      item.foodId === foodId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setOrderLoading(true);
    try {
      const guestInfo = JSON.parse(localStorage.getItem('guestInfo'));
      const token = localStorage.getItem('guestToken');

      const orderData = {
        items: cart.map(item => ({
          foodId: item.foodId,
          quantity: item.quantity,
          name: item.name,
          price: item.price
        })),
        guestId: guestInfo._id,
        hotelId: guestInfo.hotelId,
        roomNumber: guestInfo.roomNumber,
        totalAmount: calculateTotal()
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/food/orders`,
        orderData,
        {
          headers: { Authorization: token }
        }
      );

      toast.success('Order placed successfully');
      setCart([]);
      navigate('/guest/orders/tracking');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Error placing order');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Food Menu */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Food Menu</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {foods.map((food) => (
                  <div key={food._id} className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <img
                        src={food.imageUrl} // Use the complete URL directly
                        className="card-img-top"
                        alt={food.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                        }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{food.name}</h5>
                        <p className="card-text">₹{food.price}</p>
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => addToCart(food)}
                          disabled={!food.isAvailable}
                        >
                          {food.isAvailable ? 'Add to Cart' : 'Not Available'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Your Cart</h5>
            </div>
            <div className="card-body">
              {cart.length === 0 ? (
                <p className="text-center text-muted">Your cart is empty</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.foodId} className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="mb-0">{item.name}</h6>
                        <small className="text-muted">₹{item.price} x {item.quantity}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-primary ms-2"
                          onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger ms-3"
                          onClick={() => removeFromCart(item.foodId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Total:</h5>
                    <h5 className="mb-0">₹{calculateTotal()}</h5>
                  </div>
                  <button
                    className="btn btn-success w-100"
                    onClick={handlePlaceOrder}
                    disabled={orderLoading}
                  >
                    {orderLoading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodOrdering;
