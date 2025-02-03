import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const GuestStatus = () => {
  const [status, setStatus] = useState('pending');
  const { guestId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`https://hotel-management-server-a3o3.onrender.com/api/guests/status/${guestId}`);
        setStatus(response.data.status);
        
        if (response.data.status === 'approved') {
          const guestInfo = JSON.parse(localStorage.getItem('guestInfo') || '{}');
          localStorage.setItem('guestInfo', JSON.stringify({
            ...guestInfo,
            status: 'approved'
          }));
          
          toast.success('Your registration has been approved!');
          navigate('/guest/dashboard');
        } else if (response.data.status === 'rejected') {
          const hotelId = JSON.parse(localStorage.getItem('guestInfo'))?.hotelId;
          localStorage.removeItem('guestToken');
          localStorage.removeItem('guestInfo');
          
          toast.error('Registration rejected. Please verify your details and try again.');
          if (hotelId) {
            navigate(`/guest/login/${hotelId}`);
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
        toast.error('Error checking status');
      }
    };

    checkStatus();
    const statusInterval = setInterval(checkStatus, 5000);

    return () => clearInterval(statusInterval);
  }, [guestId, navigate]);

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm p-4 text-center">
        <h2 className="mb-4">Registration Status</h2>
        <div className="mb-4">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mb-0">Waiting for staff approval...</p>
          <p className="text-muted">Please wait while hotel staff verifies your registration.</p>
          <p className="text-muted">Current status: {status}</p>
        </div>
      </div>
    </div>
  );
};

export default GuestStatus; 