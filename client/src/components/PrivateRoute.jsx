import { Navigate, Outlet } from 'react-router-dom';

export const StaffPrivateRoute = () => {
  const token = localStorage.getItem('token');
  const hotelInfo = localStorage.getItem('hotelInfo');

  if (!token || !hotelInfo) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const GuestPrivateRoute = () => {
  const token = localStorage.getItem('guestToken');
  const guestInfo = JSON.parse(localStorage.getItem('guestInfo') || '{}');

  if (!token || !guestInfo) {
    return <Navigate to="/" replace />;
  }

  if (guestInfo.status !== 'approved') {
    return <Navigate to={`/guest/status/${guestInfo._id}`} replace />;
  }

  return <Outlet />;
};