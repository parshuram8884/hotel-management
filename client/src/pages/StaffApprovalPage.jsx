import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StaffApprovalPage = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState(null);

  const fetchPendingGuests = async () => {
    try {
      // Get hotelInfo from localStorage
      const hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));
      const token = localStorage.getItem('token');

      if (!hotelInfo?.id || !token) {
        toast.error('Authentication required');
        return;
      }

      setHotelId(hotelInfo.id); // Store hotelId

      const response = await axios.get(
        `http://localhost:5000/api/guests/pending/${hotelInfo.id}`,
        {
          headers: { Authorization: token }
        }
      );
      
      console.log('Pending guests:', response.data); // Debug log
      setGuests(response.data);
    } catch (error) {
      console.error('Error fetching pending guests:', error);
      toast.error('Error fetching pending guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingGuests();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchPendingGuests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (guestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/guests/approve/${guestId}`,
        {},
        {
          headers: { Authorization: token }
        }
      );
      toast.success('Guest approved successfully');
      fetchPendingGuests(); // Refresh the list
    } catch (error) {
      console.error('Error approving guest:', error);
      toast.error('Error approving guest');
    }
  };

  const handleReject = async (guestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/guests/reject/${guestId}`,
        { hotelId }, // Include hotelId in rejection
        {
          headers: { Authorization: token }
        }
      );
      toast.success('Guest rejected successfully');
      fetchPendingGuests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting guest:', error);
      toast.error('Error rejecting guest');
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
      <h2 className="mb-4">Pending Guest Approvals</h2>
      
      {guests.length === 0 ? (
        <div className="alert alert-info">No pending guest approvals</div>
      ) : (
        <div className="row g-4">
          {guests.map((guest) => (
            <div key={guest._id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{guest.name}</h5>
                  <p className="card-text mb-1">
                    <strong>Room:</strong> {guest.roomNumber}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Mobile:</strong> {guest.mobileNumber}
                  </p>
                  <p className="card-text mb-3">
                    <strong>Check-out:</strong>{' '}
                    {new Date(guest.checkOutDate).toLocaleDateString()}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleApprove(guest._id)}
                      className="btn btn-success flex-grow-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(guest._id)}
                      className="btn btn-danger flex-grow-1"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffApprovalPage;