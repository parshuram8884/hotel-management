import React from 'react';

const HotelTable = () => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Hotel Name</th>
            <th>Location</th>
            <th>Rooms</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Hotel data will be mapped here */}
        </tbody>
      </table>
    </div>
  );
};

export default HotelTable;
