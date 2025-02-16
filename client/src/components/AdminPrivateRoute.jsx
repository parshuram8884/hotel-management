import { Navigate, Outlet } from 'react-router-dom';
import { checkAdminAuth } from '../utils/auth';

const AdminPrivateRoute = () => {
  return checkAdminAuth() ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminPrivateRoute;
