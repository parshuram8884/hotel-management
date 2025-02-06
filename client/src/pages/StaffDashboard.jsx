import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Correct import for QRCodeSVG
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

function StaffDashboard() {
  const [guestLoginLink, setGuestLoginLink] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [approvedGuests, setApprovedGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const maxRoomsWarningThreshold = 5; // Configurable threshold
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovedGuests();
    const interval = setInterval(fetchApprovedGuests, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchApprovedGuests = async () => {
    try {
      const hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));
      const token = localStorage.getItem('token');

      if (!hotelInfo?.id || !token) return;

      const response = await axios.get(
        `https://hotel-management-server-a3o3.onrender.com/api/guests/approved/${hotelInfo.id}`,
        {
          headers: { Authorization: token }
        }
      );

      setApprovedGuests(response.data);
    } catch (error) {
      console.error('Error fetching approved guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGuestLink = () => {
    const hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));
    if (hotelInfo && hotelInfo.id) {
      const uniqueLink = `${window.location.origin}/guest/login/${hotelInfo.id}`;
      setGuestLoginLink(uniqueLink);
      setShowQRCode(true);
    } else {
      toast.error('Hotel information not found');
    }
  };

  // Add search filter
  const filteredGuests = approvedGuests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.mobileNumber.includes(searchTerm)
  );

  // Add room availability warning
  const remainingRooms = maxRoomsWarningThreshold - approvedGuests.length;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Staff Dashboard</h1>

      <div className="row justify-content-center">
        {/* Guest Login Sharing Section */}
        <div className="col-lg-5 col-md-6 col-sm-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white text-center">
              <h4>Guest Login Sharing</h4>
            </div>
            <div className="card-body text-center">
              <button
                className="btn btn-success btn-lg w-100 mb-3"
                onClick={generateGuestLink}
              >
                Generate Guest Login Link
              </button>
              {guestLoginLink && (
                <div>
                  <p className="font-weight-bold">Guest Login Link:</p>
                  <p className="text-break">{guestLoginLink}</p>
                  {showQRCode && (
                    <div className="text-center">
                      <QRCodeSVG value={guestLoginLink} size={150} />
                      <p className="mt-2">Scan the QR code to access the login page</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="col-lg-5 col-md-6 col-sm-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white text-center">
              <h4>Quick Navigation</h4>
            </div>
            <div className="card-body">
              <button
                className="btn btn-primary btn-lg w-100 mb-3"
                onClick={() => navigate('/staff/guest-approval')}
              >
                Manage Guest Approvals
              </button>
              <button
                className="btn btn-info btn-lg w-100 mb-3 text-white"
                onClick={() => navigate('/staff/complaints')}
              >
                Manage Complaints
              </button>
              <button
                className="btn btn-warning btn-lg w-100 mb-3 text-white"
                onClick={() => navigate('/staff/food-management')}
              >
                Manage Food Menu
              </button>
              <button
                className="btn btn-success btn-lg w-100"
                onClick={() => navigate('/staff/orders')}
              >
                View Food Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Room Availability Warning */}
      {remainingRooms <= 3 && remainingRooms > 0 && (
        <div className="alert alert-warning" role="alert">
          Warning: Only {remainingRooms} rooms available!
        </div>
      )}
      {remainingRooms <= 0 && (
        <div className="alert alert-danger" role="alert">
          No rooms available! Maximum capacity reached.
        </div>
      )}

      {/* Approved Guests Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Currently Approved Guests</h4>
              <div className="w-25">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredGuests.length === 0 ? (
                <p className="text-center mb-0">
                  {searchTerm ? 'No matching guests found' : 'No approved guests at the moment'}
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Room</th>
                        <th>Mobile</th>
                        <th>Check-in Date</th>
                        <th>Check-out Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map(guest => (
                        <tr key={guest._id}>
                          <td>{guest.name}</td>
                          <td>{guest.roomNumber}</td>
                          <td>{guest.mobileNumber}</td>
                          <td>{new Date(guest.createdAt).toLocaleDateString()}</td>
                          <td>{new Date(guest.checkOutDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;