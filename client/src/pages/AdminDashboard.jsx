import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available</div>;

  const occupancyChartData = {
    labels: stats.occupancyStats.map(hotel => hotel.hotelName),
    datasets: [
      {
        label: 'Total Rooms',
        data: stats.occupancyStats.map(hotel => hotel.totalRooms),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Occupied Rooms',
        data: stats.occupancyStats.map(hotel => hotel.occupiedRooms),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };

  const summaryData = {
    labels: ['Hotels', 'Today\'s Complaints', 'Today\'s Orders'],
    datasets: [
      {
        data: [stats.totalHotels, stats.todayComplaints, stats.todayOrders],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Total Hotels</h2>
          <p className="text-3xl">{stats.totalHotels}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Today's Complaints</h2>
          <p className="text-3xl">{stats.todayComplaints}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Today's Orders</h2>
          <p className="text-3xl">{stats.todayOrders}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Hotel Room Occupancy</h2>
          <Bar data={occupancyChartData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Daily Summary</h2>
          <Pie data={summaryData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
