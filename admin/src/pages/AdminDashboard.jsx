import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAuth } from '../utils/auth';

function AdminDashboard() {
  const navigate = useNavigate();
  const [hotelStats, setHotelStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (!checkAdminAuth()) {
      navigate('/login');
    }
    fetchHotelStats();
  }, [selectedYear, selectedMonth, navigate]);

  const fetchHotelStats = async () => {
    try {
      const response = await fetch(`/api/admin/hotel-stats?year=${selectedYear}&month=${selectedMonth}`);
      const data = await response.json();
      setHotelStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Hotel Management Dashboard</h2>
        <div className="d-flex gap-2">
          <select 
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select 
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Hotel Name</th>
              <th>Total Guests</th>
              <th>Guest Requests</th>
              <th>Food Orders</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {hotelStats.map((hotel) => (
              <tr key={hotel.id}>
                <td>{hotel.id}</td>
                <td>{hotel.name}</td>
                <td>{hotel.totalGuests}</td>
                <td>
                  <span className="badge bg-info">{hotel.guestRequests}</span>
                </td>
                <td>
                  <span className="badge bg-success">{hotel.foodOrders}</span>
                </td>
                <td>${hotel.revenue.toLocaleString()}</td>
                <td>
                  <span className={`badge bg-${hotel.status === 'active' ? 'success' : 'warning'}`}>
                    {hotel.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
