import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUtensils, FaClipboardList, FaHistory, FaSignOutAlt, FaExclamationCircle } from 'react-icons/fa';

function GuestDashboard() {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('guestInfo'));
    if (!info) {
      navigate('/');
      return;
    }
    setGuestInfo(info);

    // Calculate time remaining
    const updateTimeRemaining = () => {
      const checkoutDate = new Date(info.checkOutDate);
      const now = new Date();
      const diff = checkoutDate - now;

      if (diff <= 0) {
        setTimeRemaining('Checkout time has passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      let remainingText = '';
      if (days > 0) remainingText += `${days}d `;
      if (hours > 0) remainingText += `${hours}h `;
      remainingText += `${minutes}m remaining`;

      setTimeRemaining(remainingText);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('guestToken');
    localStorage.removeItem('guestInfo');
    navigate('/guest/login/:hotelId');
    toast.success('Logged out successfully');
  };

  if (!guestInfo) return null;

  return (
    <div className="container py-5">
      {/* Welcome Section */}
      <div className="card shadow-sm mb-4 border-0 bg-primary text-white">
        <div className="card-body text-center py-4">
          <h2 className="display-6 mb-3">Welcome, {guestInfo?.name}!</h2>
          <p className="lead mb-2">Room {guestInfo?.roomNumber}</p>
          <p className="mb-1">Checkout: {new Date(guestInfo?.checkOutDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          <p className="mb-0 fw-bold">{timeRemaining}</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Food Ordering Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 hover-shadow">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-primary bg-gradient text-white rounded-circle mb-3 mx-auto" style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaUtensils size={24} />
              </div>
              <h5 className="card-title">Order Food</h5>
              <p className="card-text text-muted">
                Browse our menu and order delicious meals directly to your room
              </p>
              <Link to="/guest/food-ordering" className="btn btn-primary w-100">
                Order Now
              </Link>
            </div>
          </div>
        </div>

        {/* Update View Orders Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 hover-shadow">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-success bg-gradient text-white rounded-circle mb-3 mx-auto" style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaHistory size={24} />
              </div>
              <h5 className="card-title">Track Orders</h5>
              <p className="card-text text-muted">
                View active orders and order history
              </p>
              <Link to="/guest/orders/tracking" className="btn btn-success w-100">
                View Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Submit Complaint Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 hover-shadow">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-warning bg-gradient text-white rounded-circle mb-3 mx-auto" style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaExclamationCircle size={24} />
              </div>
              <h5 className="card-title">Submit Complaint</h5>
              <p className="card-text text-muted">
                Report any issues or provide feedback about your stay
              </p>
              <Link to="/guest/complaint-form" className="btn btn-warning w-100">
                Submit Complaint
              </Link>
            </div>
          </div>
        </div>

        {/* Track Complaints Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 hover-shadow">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-info bg-gradient text-white rounded-circle mb-3 mx-auto" style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaClipboardList size={24} />
              </div>
              <h5 className="card-title">Track Complaints</h5>
              <p className="card-text text-muted">
                View the status and responses to your submitted complaints
              </p>
              <Link to="/guest/complaints" className="btn btn-info text-white w-100">
                View Complaints
              </Link>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 hover-shadow">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-danger bg-gradient text-white rounded-circle mb-3 mx-auto" style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaSignOutAlt size={24} />
              </div>
              <h5 className="card-title">Logout</h5>
              <p className="card-text text-muted">
                Securely end your current session
              </p>
              <button onClick={handleLogout} className="btn btn-danger w-100">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
        }
        .feature-icon {
          transition: all 0.3s ease;
        }
        .card:hover .feature-icon {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

export default GuestDashboard;
