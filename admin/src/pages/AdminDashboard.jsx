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
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand d-flex align-items-center">
            <i className="bi bi-building me-2"></i>
            Hotel Management
          </span>
          <button 
            className="btn btn-outline-light"
            onClick={() => {
              sessionStorage.removeItem('adminAuthExpiry');
              navigate('/');
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid p-4">
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <h4 className="card-title mb-0">Monthly Statistics</h4>
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
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 g-3">
          {hotelStats.length > 0 && (
            <>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle p-3 bg-primary bg-opacity-10">
                        <i className="bi bi-people fs-4 text-primary"></i>
                      </div>
                      <div className="ms-3">
                        <h6 className="mb-1 text-muted">Total Guests</h6>
                        <h3 className="mb-0">{hotelStats.reduce((sum, hotel) => sum + hotel.totalGuests, 0)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle p-3 bg-success bg-opacity-10">
                        <i className="bi bi-cart fs-4 text-success"></i>
                      </div>
                      <div className="ms-3">
                        <h6 className="mb-1 text-muted">Total Orders</h6>
                        <h3 className="mb-0">{hotelStats.reduce((sum, hotel) => sum + hotel.foodOrders, 0)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle p-3 bg-warning bg-opacity-10">
                        <i className="bi bi-currency-dollar fs-4 text-warning"></i>
                      </div>
                      <div className="ms-3">
                        <h6 className="mb-1 text-muted">Total Revenue</h6>
                        <h3 className="mb-0">${hotelStats.reduce((sum, hotel) => sum + hotel.revenue, 0).toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="card-title mb-4">Hotels Overview</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Hotel Name</th>
                    <th scope="col">Guests</th>
                    <th scope="col">Requests</th>
                    <th scope="col">Orders</th>
                    <th scope="col">Revenue</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hotelStats.map((hotel) => (
                    <tr key={hotel.id}>
                      <td>{hotel.id}</td>
                      <td>{hotel.name}</td>
                      <td>{hotel.totalGuests}</td>
                      <td>
                        <span className="badge rounded-pill bg-info">{hotel.guestRequests}</span>
                      </td>
                      <td>
                        <span className="badge rounded-pill bg-success">{hotel.foodOrders}</span>
                      </td>
                      <td>${hotel.revenue.toLocaleString()}</td>
                      <td>
                        <span className={`badge rounded-pill bg-${hotel.status === 'active' ? 'success' : 'warning'}`}>
                          {hotel.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
