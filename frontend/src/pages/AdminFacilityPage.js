import React from 'react';
import { Link } from 'react-router-dom';

const AdminFacilityPage = () => {
  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Facility Management</h1>
        <Link to="/admin/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      <div className="form-panel">
        <p>
          Manage university sports facilities from this page. You can maintain court availability,
          define booking windows, and organize location details for events and practices.
        </p>
        <div className="dashboard-actions">
          <button type="button" className="btn btn-primary">Add Facility</button>
          <button type="button" className="btn btn-secondary">View Bookings</button>
        </div>
      </div>
    </section>
  );
};

export default AdminFacilityPage;
