import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const AdminItemsPage = () => {
  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Items Management</h1>
        <Link to="/admin/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      <div className="form-panel">
        <p>
          Manage sports equipment inventory, monitor issued items, and keep stock levels updated
          for all university sports activities.
        </p>
        <div className="dashboard-actions">
          <button type="button" className="btn btn-primary">Add Item</button>
          <button type="button" className="btn btn-secondary">Inventory Report</button>
        </div>
      </div>
    </section>
  );
};

export default AdminItemsPage;
