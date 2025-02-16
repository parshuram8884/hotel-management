import React, { useState, useEffect } from 'react';

function ComplaintTable() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints/recent');
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Guest</th>
            <th>Hotel</th>
            <th>Issue</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map(complaint => (
            <tr key={complaint.id}>
              <td>{complaint.id}</td>
              <td>{complaint.guestName}</td>
              <td>{complaint.hotelName}</td>
              <td>{complaint.issue}</td>
              <td>
                <span className={`badge bg-${complaint.status === 'ACTIVE' ? 'danger' : 'success'}`}>
                  {complaint.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComplaintTable;
