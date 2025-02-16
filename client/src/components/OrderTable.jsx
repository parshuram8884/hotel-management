import React from 'react';

const OrderTable = () => {
  return (
    <div className="order-table">
      <h2>Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {/* Add order data mapping here */}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
