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
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/guest/login/:hotelId" element={<GuestLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Staff Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <StaffPrivateRoute>
              <StaffDashboard />
            </StaffPrivateRoute>
          }
        />
        <Route
          path="/staff/guest-approval"
          element={
            <StaffPrivateRoute>
              <StaffApprovalPage />
            </StaffPrivateRoute>
          }
        />
        <Route
          path="/staff/complaints"
          element={
            <StaffPrivateRoute>
              <ComplaintManagement />
            </StaffPrivateRoute>
          }
        />
        <Route
          path="/staff/food-management"
          element={
            <StaffPrivateRoute>
              <FoodManagement />
            </StaffPrivateRoute>
          }
        />
        <Route
          path="/staff/orders"
          element={
            <StaffPrivateRoute>
              <StaffOrderManagement />
            </StaffPrivateRoute>
          }
        />

        {/* Protected Guest Routes */}
        <Route path="/guest/status/:guestId" element={<GuestStatus />} />
        <Route
          path="/guest/dashboard"
          element={
            <GuestPrivateRoute>
              <GuestDashboard />
            </GuestPrivateRoute>
          }
        />
        <Route
          path="/guest/complaint-form"
          element={
            <GuestPrivateRoute>
              <ComplaintForm />
            </GuestPrivateRoute>
          }
        />
        <Route
          path="/guest/complaints"
          element={
            <GuestPrivateRoute>
              <GuestComplaintTracking />
            </GuestPrivateRoute>
          }
        />
        <Route
          path="/guest/food-ordering"
          element={
            <GuestPrivateRoute>
              <FoodOrdering />
            </GuestPrivateRoute>
          }
        />
        <Route
          path="/guest/orders/tracking"
          element={
            <GuestPrivateRoute>
              <OrderTracking />
            </GuestPrivateRoute>
          }
        />
        <Route
          path="/guest/orders/history"
          element={
            <GuestPrivateRoute>
              <OrderHistory />
            </GuestPrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;