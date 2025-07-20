import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
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
          `${import.meta.env.VITE_API_URL}/api/food/orders/history/${guestInfo._id}`,  // Updated route
          {
            headers: { Authorization: token }
          }
        );

        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
      <h2 className="mb-4">Order History</h2>
      
      {orders.length === 0 ? (
        <div className="alert alert-info">No orders found</div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order._id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Order #{order._id.slice(-6)}</h5>
                  <p className="card-text">
                    <strong>Status:</strong>{' '}
                    <span className={`badge bg-${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </p>
                  <p className="card-text">
                    <strong>Total:</strong> ₹{order.totalAmount}
                  </p>
                  <p className="card-text">
                    <strong>Date:</strong>{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3">
                    <h6>Items:</h6>
                    <ul className="list-unstyled">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.name} x {item.quantity} - ₹{item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
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

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'preparing':
      return 'info';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default OrderHistory;