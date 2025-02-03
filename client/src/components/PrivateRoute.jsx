import { Navigate } from 'react-router-dom';

export const StaffPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const hotelInfo = localStorage.getItem('hotelInfo');

  if (!token || !hotelInfo) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const GuestPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('guestToken');
  const guestInfo = JSON.parse(localStorage.getItem('guestInfo') || '{}');

  if (!token || !guestInfo) {
    return <Navigate to="/" replace />;
  }

  // If guest exists but is not approved, redirect to status page
  if (guestInfo.status !== 'approved') {
    return <Navigate to={`/guest/status/${guestInfo._id}`} replace />;
  }

  return children;
};