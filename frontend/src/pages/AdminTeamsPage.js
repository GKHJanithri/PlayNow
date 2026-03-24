import React from 'react';
import { Link } from 'react-router-dom';

const AdminTeamsPage = () => {
  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Team Management</h1>
        <Link to="/admin/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      <div className="form-panel">
        <p>
          Manage registered teams, review roster updates, and coordinate team participation across
          tournaments and training sessions.
        </p>
        <div className="dashboard-actions">
          <button type="button" className="btn btn-primary">Create Team</button>
          <button type="button" className="btn btn-secondary">View Rosters</button>
        </div>
      </div>
    </section>
  );
};

export default AdminTeamsPage;
