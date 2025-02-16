import React from 'react';

function StatisticsCard({ title, value }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h6 className="card-subtitle mb-2 text-muted">{title}</h6>
        <h2 className="card-title">{value}</h2>
      </div>
    </div>
  );
}

export default StatisticsCard;
