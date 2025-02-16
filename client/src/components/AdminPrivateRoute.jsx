import { Navigate } from 'react-router-dom';

const AdminPrivateRoute = () => {
  // Always redirect to login page
  return <Navigate to="/admin/login" replace />;
};

export default AdminPrivateRoute;
