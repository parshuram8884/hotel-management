import { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const GuestLogin = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [loading, setLoading] = useState(false);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    mobileNumber: '',
    checkOutDate: new Date()
  });

  useEffect(() => {
    // Check for existing approved session
    const guestInfo = JSON.parse(localStorage.getItem('guestInfo'));
    const guestToken = localStorage.getItem('guestToken');

    if (guestInfo && guestToken) {
      if (guestInfo.hotelId === hotelId && guestInfo.status === 'approved') {
        // If guest is already approved for this hotel, redirect to dashboard
        navigate('/guest/dashboard');
        return;
      } else {
        // Clear old session if it's for a different hotel
        localStorage.removeItem('guestToken');
        localStorage.removeItem('guestInfo');
      }
    }

    const verifyHotel = async () => {
      try {
        console.log('Verifying hotel:', hotelId);
        const response = await axios.get(`https://hotel-management-server-a3o3.onrender.com/api/guests/verify-hotel/${hotelId}`);
        console.log('Hotel verification response:', response.data);
        setHotelInfo(response.data.hotel);
      } catch (error) {
        console.error('Hotel verification error:', error.response || error);
        toast.error(error.response?.data?.message || 'Invalid hotel ID');
        navigate('/');
      } finally {
        setVerifying(false);
      }
    };

    if (hotelId) {
      verifyHotel();
    } else {
      setVerifying(false);
    }
  }, [hotelId, navigate]);

  // Show loading while verifying hotel
  if (verifying) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Only redirect if there's no hotelId
  if (!hotelId) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      checkOutDate: date
    });
  };

  const validatePhone = (phone) => {
    // Allows formats: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX (10 digits)
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Add debug logging
        console.log('Attempting registration with data:', {
            hotelId,
            formData
        });

        // Validate hotelId
        if (!hotelId) {
            toast.error('Hotel ID is missing');
            return;
        }

        // Validate mobile number
        if (!validatePhone(formData.mobileNumber)) {
            toast.error('Please enter a valid 10-digit Indian mobile number');
            setLoading(false);
            return;
        }

        const requestBody = {
            name: formData.name,
            roomNumber: formData.roomNumber,
            mobileNumber: formData.mobileNumber,
            checkOutDate: formData.checkOutDate,
            hotelId: hotelId // Include hotelId in request body
        };

        console.log('Sending registration request:', requestBody);

        const response = await axios.post(
            `https://hotel-management-server-a3o3.onrender.com/api/guests/register/${hotelId}`,
            requestBody
        );

        console.log('Registration response:', response.data);

        if (response.data.token && response.data.guest) {
            localStorage.setItem('guestToken', response.data.token);
            localStorage.setItem('guestInfo', JSON.stringify({
                ...response.data.guest,
                hotelId
            }));
            
            toast.success('Registration successful! Awaiting staff approval.');
            navigate(`/guest/status/${response.data.guest.id}`);
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Registration error:', error.response || error);
        const errorMessage = error.response?.data?.message || 'Registration failed';
        toast.error(errorMessage);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2">Guest Registration</h2>
            {hotelInfo && <p className="text-muted">Register at {hotelInfo.hotelName}</p>}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Room Number</label>
              <input
                type="text"
                className="form-control"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-control"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Check-out Date</label>
              <DatePicker
                selected={formData.checkOutDate}
                onChange={handleDateChange}
                className="form-control"
                minDate={new Date()}
                dateFormat="MMMM d, yyyy"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuestLogin;