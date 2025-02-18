import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAuth } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';

function AdminDashboard() {
  const navigate = useNavigate();
  const [hotelStats, setHotelStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (!checkAdminAuth()) {
      navigate('/');
      return;
    }
    fetchHotelStats();
  }, [selectedYear, selectedMonth, navigate]);

  const fetchHotelStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotels/stats?year=${selectedYear}&month=${selectedMonth}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch hotel statistics');
      }

      if (data.success) {
        setHotelStats(data.hotels || []);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection.');
      console.error('Error fetching stats:', err);
      setHotelStats([]); // Reset stats on error
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    return hotelStats.reduce((acc, hotel) => ({
      guests: acc.guests + (hotel.totalGuests || 0),
      complaints: acc.complaints + (hotel.complaints || 0), // Changed from requests
      orders: acc.orders + (hotel.foodOrders || 0),
      revenue: acc.revenue + (hotel.revenue || 0)
    }), { guests: 0, complaints: 0, orders: 0, revenue: 0 });
  };

  // Add currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

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
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

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
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-primary bg-opacity-10">
                    <i className="bi bi-people fs-4 text-primary"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1 text-muted">Total Guests</h6>
                    <h3 className="mb-0">{totals.guests}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-danger bg-opacity-10">
                    <i className="bi bi-exclamation-triangle fs-4 text-danger"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1 text-muted">Total Complaints</h6>
                    <h3 className="mb-0">{totals.complaints}</h3>
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
                    <h3 className="mb-0">{totals.orders}</h3>
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
                    <i className="bi bi-currency-rupee fs-4 text-warning"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1 text-muted">Total Revenue</h6>
                    <h3 className="mb-0">{formatCurrency(totals.revenue)}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="card-title mb-4">Hotels Overview</h5>
            {hotelStats.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No data available for the selected period</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Hotel Name</th>
                      <th scope="col">Guests</th>
                      <th scope="col">Complaints</th> {/* Changed from Requests */}
                      <th scope="col">Orders</th>
                      <th scope="col">Revenue</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelStats.map((hotel) => (
                      <tr key={hotel._id}>
                        <td>{hotel._id}</td>
                        <td>{hotel.name}</td>
                        <td>{hotel.totalGuests || 0}</td>
                        <td>
                          <span className="badge rounded-pill bg-danger"> {/* Changed from bg-info */}
                            {hotel.complaints || 0}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill bg-success">
                            {hotel.foodOrders || 0}
                          </span>
                        </td>
                        <td>{formatCurrency(hotel.revenue)}</td>
                        <td>
                          <span className={`badge rounded-pill bg-${hotel.status === 'active' ? 'success' : 'warning'}`}>
                            {hotel.status || 'inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
