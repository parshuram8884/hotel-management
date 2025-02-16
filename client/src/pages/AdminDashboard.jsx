import React, { useState, useEffect } from 'react';
import StatisticsCard from '../components/StatisticsCard';
import ComplaintTable from '../components/ComplaintTable';
import { OrderTable } from '../components/OrderTable';
import HotelTable from '../components/HotelTable';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalGuests: 0,
    activeComplaints: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatisticsCard title="Total Hotels" value={stats.totalHotels} />
        </div>
        <div className="col-md-3">
          <StatisticsCard title="Total Guests" value={stats.totalGuests} />
        </div>
        <div className="col-md-3">
          <StatisticsCard title="Active Complaints" value={stats.activeComplaints} />
        </div>
        <div className="col-md-3">
          <StatisticsCard title="Pending Orders" value={stats.pendingOrders} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Recent Complaints</h5>
              <ComplaintTable />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Recent Orders</h5>
              <OrderTable />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Hotels Overview</h5>
              <HotelTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
