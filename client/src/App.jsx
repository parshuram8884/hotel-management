import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import StaffApprovalPage from './pages/StaffApprovalPage';
import GuestLogin from './pages/GuestLogin';
import GuestDashboard from './pages/GuestDashboard';
import { StaffPrivateRoute, GuestPrivateRoute } from './components/PrivateRoute';
import GuestStatus from './pages/GuestStatus';
import ComplaintForm from './pages/ComplaintForm';
import ComplaintManagement from './pages/ComplaintManagement';
import GuestComplaintTracking from './pages/GuestComplaintTracking';
import FoodManagement from './pages/FoodManagement';
import FoodOrdering from './pages/FoodOrdering';
import OrderTracking from './pages/OrderTracking';
import StaffOrderManagement from './pages/StaffOrderManagement';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Hotel Management</Link>
          <div className="navbar-nav">
            <Link className="nav-link" to="/admin">Admin Dashboard</Link>
          </div>
        </div>
      </nav>

      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/guest/login/:hotelId" element={<GuestLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/guest/status/:guestId" element={<GuestStatus />} />

        {/* Staff Routes */}
        <Route element={<StaffPrivateRoute />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/guest-approval" element={<StaffApprovalPage />} />
          <Route path="/staff/complaints" element={<ComplaintManagement />} />
          <Route path="/staff/food-management" element={<FoodManagement />} />
          <Route path="/staff/orders" element={<StaffOrderManagement />} />
        </Route>

        {/* Guest Routes */}
        <Route element={<GuestPrivateRoute />}>
          <Route path="/guest/dashboard" element={<GuestDashboard />} />
          <Route path="/guest/complaint-form" element={<ComplaintForm />} />
          <Route path="/guest/complaints" element={<GuestComplaintTracking />} />
          <Route path="/guest/food-ordering" element={<FoodOrdering />} />
          <Route path="/guest/orders/tracking" element={<OrderTracking />} />
          <Route path="/guest/orders/history" element={<OrderHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;