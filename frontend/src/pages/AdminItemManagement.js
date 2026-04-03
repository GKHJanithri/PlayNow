import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const AdminItemManagementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="main-item-page equipment-layout" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh'}}>
      <button
        className="back-btn"
        style={{ marginBottom: 18, alignSelf: 'flex-start' }}
        onClick={() => navigate('/admin/dashboard')}
      >
        ← Back to Dashboard
      </button>
      <h1 className="page-header" style={{marginBottom: '2rem'}}>Item Management</h1>
      <div style={{display: 'flex', gap: '2rem'}}>
        <button
          className="btn btn-primary"
          style={{minWidth: '220px', fontSize: '1.1rem'}}
          onClick={() => navigate('/admin/items')}
        >
          Manage Items
        </button>
        <button
          className="btn btn-secondary"
          style={{minWidth: '220px', fontSize: '1.1rem'}}
          onClick={() => navigate('/admin/item-reservations')}
        >
          Manage Reservations
        </button>
      </div>
    </div>
  );
};

export default AdminItemManagementPage;
