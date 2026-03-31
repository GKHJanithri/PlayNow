import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import './AdminAddFacilityPage.css';

const emptyForm = {
  facilityName: '',
  sportType: '',
  maxPlayers: '',
  location: '',
  availability: true,
};

const toFormData = (facility) => ({
  facilityName: facility?.facilityName || '',
  sportType: facility?.sportType || '',
  maxPlayers: String(facility?.maxPlayers ?? ''),
  location: facility?.location || '',
  availability: Boolean(facility?.availability),
});

const AdminEditFacilityPage = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadFacility = async () => {
      setIsLoading(true);
      setError('');

      const stateFacility = location.state?.facility || null;
      if (stateFacility && stateFacility.id === facilityId) {
        setForm({
          facilityName: stateFacility.name,
          sportType: stateFacility.sport,
          maxPlayers: String(stateFacility.capacity),
          location: stateFacility.location,
          availability: Boolean(stateFacility.available),
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/facilities/${facilityId}`);
        setForm(toFormData(response.data));
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Could not load facility details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFacility();
  }, [facilityId, location.state]);

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
      await apiClient.put(`/facilities/${facilityId}`, payload);
      setSuccess('Facility updated successfully. Redirecting...');
      setTimeout(() => {
        navigate('/admin/facilities', { replace: true });
      }, 700);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not update facility. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page admin-add-facility-page">
      <div className="admin-add-facility-header">
        <div>
          <h1 className="page-title">Edit Facility</h1>
          <p>Update facility details and save your changes.</p>
        </div>
        <button
          type="button"
          className="admin-add-facility-back-btn"
          onClick={() => navigate('/admin/facilities')}
        >
          Back to Facilities
        </button>
      </div>

      {isLoading && <div className="admin-add-facility-success">Loading facility...</div>}
      {!isLoading && error && <div className="admin-add-facility-error">{error}</div>}

      {!isLoading && !error && (
        <form className="admin-add-facility-form" onSubmit={handleSubmit}>
          <label htmlFor="facilityName">Facility Name *</label>
          <input
            id="facilityName"
            name="facilityName"
            value={form.facilityName}
            onChange={handleInputChange}
          />

          <label htmlFor="sportType">Sport Type *</label>
          <input
            id="sportType"
            name="sportType"
            value={form.sportType}
            onChange={handleInputChange}
          />

          <label htmlFor="maxPlayers">Max Players *</label>
          <input
            id="maxPlayers"
            name="maxPlayers"
            type="number"
            min="1"
            value={form.maxPlayers}
            onChange={handleInputChange}
          />

          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleInputChange}
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

          {success && <div className="admin-add-facility-success">{success}</div>}

          <div className="admin-add-facility-actions">
            <button type="button" className="secondary" onClick={() => navigate('/admin/facilities')}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Facility'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default AdminEditFacilityPage;