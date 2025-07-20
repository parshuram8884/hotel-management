import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StaffOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    // Polling interval reduced to 10 seconds for more responsive updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));

      if (!token || !hotelInfo?.id) {
        toast.error('Authentication required');
        navigate('/');
        return;
      }

      console.log('Hotel ID:', hotelInfo.id); // Debug log

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/food/orders/${hotelInfo.id}`,
        {
          headers: { 
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', response.data); // Debug log

      if (response.data) {
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error details:', error.response || error); // Enhanced error logging
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/');
      } else {
        toast.error('Error loading orders: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/food/orders/${orderId}/update-status`,
        { status: newStatus },
        {
          headers: { 
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Status update response:', response.data); // Debug log

      if (response.data) {
        toast.success(`Order ${newStatus} successfully`);
        await fetchOrders(); // Refresh the orders list
      }
    } catch (error) {
      console.error('Error updating order status:', error.response || error);
      toast.error(error.response?.data?.message || 'Error updating order status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'confirmed':
        return 'bg-info';
      case 'preparing':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getGuestInfo = (order) => {
    if (!order.guestId) return 'Guest not found';
    return order.guestId.name || 'Unnamed Guest';
  };

  const renderOrderItems = (items) => {
    if (!items || !Array.isArray(items)) return 'No items';
    return items.map((item, index) => (
      <li key={index}>
        {item.quantity}x {item.foodId?.name || 'Unknown Item'}
      </li>
    ));
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

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => ['confirmed', 'preparing'].includes(order.status));
  const completedOrders = orders.filter(order => ['delivered', 'cancelled'].includes(order.status));

  return (
    <div className="container-fluid py-5">
      <h2 className="mb-4">Order Management</h2>

      {/* Pending Orders */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0">Pending Orders ({pendingOrders.length})</h5>
        </div>
        <div className="card-body">
          {pendingOrders.length === 0 ? (
            <p className="text-center text-muted mb-0">No pending orders</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{getGuestInfo(order)}</td>
                      <td>{order.roomNumber || 'N/A'}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {renderOrderItems(order.items)}
                        </ul>
                      </td>
                      <td>₹{order.totalAmount || 0}</td>
                      <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Active Orders */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Active Orders ({activeOrders.length})</h5>
        </div>
        <div className="card-body">
          {activeOrders.length === 0 ? (
            <p className="text-center text-muted mb-0">No active orders</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{getGuestInfo(order)}</td>
                      <td>{order.roomNumber || 'N/A'}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {renderOrderItems(order.items)}
                        </ul>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {order.status === 'confirmed' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleStatusUpdate(order._id, 'preparing')}
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusUpdate(order._id, 'delivered')}
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Completed Orders */}
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">Completed Orders ({completedOrders.length})</h5>
        </div>
        <div className="card-body">
          {completedOrders.length === 0 ? (
            <p className="text-center text-muted mb-0">No completed orders</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Completed At</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{getGuestInfo(order)}</td>
                      <td>{order.roomNumber || 'N/A'}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {renderOrderItems(order.items)}
                        </ul>
                      </td>
                      <td>₹{order.totalAmount || 0}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(order.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffOrderManagement;