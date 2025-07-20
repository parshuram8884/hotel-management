import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function OrderTracking() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const guestInfo = JSON.parse(localStorage.getItem('guestInfo'));
        const token = localStorage.getItem('guestToken');

        if (!guestInfo || !token) {
          toast.error('Authentication required');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/food/orders/active/${guestInfo._id}`,  // Updated route
          {
            headers: { Authorization: token }
          }
        );

        setActiveOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch active orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Set up polling for active orders
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    const classes = {
      pending: 'bg-warning',
      confirmed: 'bg-info',
      preparing: 'bg-primary',
      delivered: 'bg-success',
      cancelled: 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Active Orders</h2>
        <Link to="/guest/orders/history" className="btn btn-outline-primary">
          View Order History
        </Link>
      </div>

      {activeOrders.length === 0 ? (
        <div className="alert alert-info">No active orders</div>
      ) : (
        <div className="row g-4">
          {activeOrders.map((order) => (
            <div key={order._id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Order #{order._id.slice(-6)}</h5>
                  <span className={`badge ${getStatusClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6>Items:</h6>
                    <ul className="list-unstyled">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.name} - ₹{item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="card-text">
                    <strong>Total:</strong> ₹{order.totalAmount}
                  </p>
                  <p className="card-text">
                    <strong>Ordered:</strong>{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <div className="progress" style={{ height: '20px' }}>
                    {order.status === 'pending' && (
                      <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                           style={{ width: '25%' }}>
                        Pending Confirmation
                      </div>
                    )}
                    {order.status === 'confirmed' && (
                      <div className="progress-bar progress-bar-striped progress-bar-animated bg-info" 
                           style={{ width: '50%' }}>
                        Order Confirmed
                      </div>
                    )}
                    {order.status === 'preparing' && (
                      <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                           style={{ width: '75%' }}>
                        Preparing
                      </div>
                    )}
                    {order.status === 'delivered' && (
                      <div className="progress-bar bg-success" style={{ width: '100%' }}>
                        Delivered
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderTracking;