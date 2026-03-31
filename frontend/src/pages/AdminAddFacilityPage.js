import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './AdminAddFacilityPage.css';

const initialForm = {
  facilityName: 'Basketball Court',
  sportType: 'Basketball',
  maxPlayers: '15',
  location: 'Next to BirdNest',
  availability: true,
};

const AdminAddFacilityPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      facilityName: form.facilityName.trim(),
      sportType: form.sportType.trim(),
      maxPlayers: Number(form.maxPlayers),
      location: form.location.trim(),
      availability: form.availability,
    };

    if (!payload.facilityName || !payload.sportType || !payload.maxPlayers) {
      setError('Facility name, sport type, and max players are required.');
      return;
    }

    if (!Number.isFinite(payload.maxPlayers) || payload.maxPlayers < 1) {
      setError('Max players must be a valid number greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/facilities', payload);
      setSuccess('Facility created successfully. Redirecting...');
      setTimeout(() => {
        navigate('/admin/facilities', { replace: true });
      }, 700);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not create facility. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page admin-add-facility-page">
      <div className="admin-add-facility-header">
        <div>
          <h1 className="page-title">Add New Facility</h1>
          <p>Create a sports facility and save it to the system.</p>
        </div>
        <button
          type="button"
          className="admin-add-facility-back-btn"
          onClick={() => navigate('/admin/facilities')}
        >
          Back to Facilities
        </button>
      </div>

      <form className="admin-add-facility-form" onSubmit={handleSubmit}>
        <label htmlFor="facilityName">Facility Name *</label>
        <input
          id="facilityName"
          name="facilityName"
          value={form.facilityName}
          onChange={handleInputChange}
          placeholder="e.g., Main Badminton Court"
        />

        <label htmlFor="sportType">Sport Type *</label>
        <input
          id="sportType"
          name="sportType"
          value={form.sportType}
          onChange={handleInputChange}
          placeholder="e.g., Badminton"
        />

        <label htmlFor="maxPlayers">Max Players *</label>
        <input
          id="maxPlayers"
          name="maxPlayers"
          type="number"
          min="1"
          value={form.maxPlayers}
          onChange={handleInputChange}
          placeholder="e.g., 4"
        />

        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          value={form.location}
          onChange={handleInputChange}
          placeholder="e.g., Recreation Center"
        />

        <label className="admin-add-facility-availability" htmlFor="availability">
          <input
            id="availability"
            name="availability"
            type="checkbox"
            checked={form.availability}
            onChange={handleInputChange}
          />
          <span>Available</span>
        </label>

        {error && <div className="admin-add-facility-error">{error}</div>}
        {success && <div className="admin-add-facility-success">{success}</div>}

        <div className="admin-add-facility-actions">
          <button type="button" className="secondary" onClick={() => navigate('/admin/facilities')}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Facility'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdminAddFacilityPage;