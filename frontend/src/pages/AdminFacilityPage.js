import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './AdminFacilityPage.css';

const sportIcons = {
  Cricket: '🏏',
  Volleyball: '🏐',
  Netball: '🏀',
  Basketball: '🏀',
  Badminton: '🏸',
  Tennis: '🎾',
  Football: '⚽',
  'Swimming Pool': '🏊',
};

const toTableFacility = (facility) => ({
  id: facility._id,
  name: facility.facilityName,
  sport: facility.sportType,
  icon: sportIcons[facility.sportType] || '🎯',
  capacity: Number(facility.maxPlayers) || 0,
  location: facility.location || 'University Sports Complex',
  available: Boolean(facility.availability),
});

const toApiFacilityPayload = (facility) => ({
  facilityName: facility.name,
  sportType: facility.sport,
  maxPlayers: facility.capacity,
  location: facility.location,
  availability: facility.available,
});

const AdminFacilityPage = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const loadFacilities = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiClient.get('/facilities');
        const list = Array.isArray(response.data) ? response.data.map(toTableFacility) : [];
        setFacilities(list);
      } catch (_requestError) {
        setError('Could not load facilities from server.');
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, []);

  const availableCount = useMemo(
    () => facilities.filter((facility) => facility.available).length,
    [facilities],
  );

  const handleToggleAvailability = async (facility) => {
    setError('');
    setActionMessage('');

    const updatedFacility = {
      ...facility,
      available: !facility.available,
    };

    try {
      await apiClient.put(`/facilities/${facility.id}`, toApiFacilityPayload(updatedFacility));
      setFacilities((previousFacilities) => {
        return previousFacilities.map((entry) => {
          if (entry.id !== facility.id) return entry;
          return updatedFacility;
        });
      });
      setActionMessage(`${facility.name} availability updated.`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not update availability.');
    }
  };

  const handleDeleteFacility = async (facility) => {
    const confirmed = window.confirm(`Delete ${facility.name}?`);
    if (!confirmed) return;

    setError('');
    setActionMessage('');

    try {
      await apiClient.delete(`/facilities/${facility.id}`);
      setFacilities((previousFacilities) => {
        return previousFacilities.filter((entry) => entry.id !== facility.id);
      });
      setActionMessage('Facility deleted successfully.');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not delete facility.');
    }
  };

  const handleEditFacility = (facility) => {
    navigate(`/admin/facilities/${facility.id}/edit`, {
      state: { facility },
    });
  };

  return (
    <section className="page admin-facility-page">
      <div className="admin-facility-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="admin-facility-subtitle">Manage university sports facilities</p>
        </div>
        <div className="admin-facility-header-actions">
          <button
            type="button"
            className="admin-facility-view-bookings-btn"
            onClick={() => navigate('/admin/facilities/bookings', { state: { from: '/admin/facilities' } })}
          >
            View Bookings
          </button>
          <button
            type="button"
            className="admin-facility-add-btn"
            onClick={() => navigate('/admin/facilities/new')}
          >
            + Add Facility
          </button>
        </div>
      </div>

      <div className="admin-facility-table-wrap">
        {isLoading && <div className="admin-facility-info">Loading facilities...</div>}
        {!isLoading && error && <div className="admin-facility-info error">{error}</div>}
        {!isLoading && !error && actionMessage && <div className="admin-facility-info">{actionMessage}</div>}

        <table className="admin-facility-table" aria-label="Facilities table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Sport</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility) => (
              <tr key={facility.id}>
                <td>{facility.name}</td>
                <td>
                  <span className="admin-facility-sport-cell">
                    <span aria-hidden="true">{facility.icon}</span>
                    {facility.sport}
                  </span>
                </td>
                <td>{facility.capacity}</td>
                <td>{facility.location}</td>
                <td>
                  <button
                    type="button"
                    className={`admin-facility-switch${facility.available ? ' is-on' : ''}`}
                    onClick={() => handleToggleAvailability(facility)}
                    aria-label={`Set ${facility.name} availability`}
                    aria-pressed={facility.available}
                  >
                    <span className="admin-facility-switch-thumb" />
                  </button>
                </td>
                <td>
                  <div className="admin-facility-actions">
                    <button
                      type="button"
                      className="admin-facility-icon-btn"
                      aria-label={`Edit ${facility.name}`}
                      onClick={() => handleEditFacility(facility)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="admin-facility-icon-btn danger"
                      aria-label={`Delete ${facility.name}`}
                      onClick={() => handleDeleteFacility(facility)}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="admin-facility-footer">
          <span>{availableCount} facilities available</span>
          <Link to="/admin/dashboard" className="admin-facility-back-link">Back to Dashboard</Link>
        </div>
      </div>
    </section>
  );
};

export default AdminFacilityPage;
