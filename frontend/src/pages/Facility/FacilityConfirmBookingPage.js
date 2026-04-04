import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { getSportMeta } from './facilityData';
import { addNotification } from '../../utils/notifications';
import './FacilityBooking.css';

const FacilityConfirmBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { facilityId } = useParams();

  const locationState = location.state || {};
  const selectedDate = locationState.date || '';
  const selectedSlot = locationState.slot || null;

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : {};
    } catch (_error) {
      return {};
    }
  }, []);

  const sessionStudentName = String(currentUser?.fullName || localStorage.getItem('fullName') || '').trim();
  const sessionStudentId = String(
    currentUser?.studentId || currentUser?.studentID || localStorage.getItem('studentId') || '',
  ).trim();

  const [facility, setFacility] = useState(locationState.facility || null);
  const [isLoadingFacility, setIsLoadingFacility] = useState(!locationState.facility);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    studentName: sessionStudentName,
    studentId: sessionStudentId,
    players: 1,
    agreeToTerms: false,
  });

  useEffect(() => {
    const loadFacility = async () => {
      if (facility) return;

      setIsLoadingFacility(true);
      try {
        const response = await apiClient.get('/facilities');
        const facilities = Array.isArray(response.data) ? response.data : [];
        const matched = facilities.find((entry) => entry._id === facilityId);
        setFacility(matched || null);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Could not load facility for confirmation.');
      } finally {
        setIsLoadingFacility(false);
      }
    };

    loadFacility();
  }, [facility, facilityId]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      studentName: sessionStudentName,
      studentId: sessionStudentId,
    }));
  }, [sessionStudentName, sessionStudentId]);

  const maxPlayers = useMemo(() => Number(facility?.maxPlayers) || 1, [facility]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleConfirmBooking = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!facility) {
      setError('Facility data is missing.');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setError('Date and time slot are missing. Please choose them again.');
      return;
    }

    if (!form.studentName.trim() || !form.studentId.trim()) {
      setError('Logged-in student name and ID are missing. Please log in again.');
      return;
    }

    const players = Number(form.players);
    if (!Number.isFinite(players) || players < 1) {
      setError('Number of players must be at least 1.');
      return;
    }

    if (players > maxPlayers) {
      setError(`Number of players cannot exceed ${maxPlayers}.`);
      return;
    }

    if (!form.agreeToTerms) {
      setError('Please agree to the terms and conditions to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/book', {
        facilityId,
        studentName: form.studentName.trim(),
        studentId: form.studentId.trim(),
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        players,
      });

      addNotification({
        title: `${facility.facilityName} booked`,
        message: `${selectedDate} · ${selectedSlot.start} - ${selectedSlot.end} · ${players} player${players === 1 ? '' : 's'} · Active`,
        icon: 'fa-bell',
        role: 'Facility',
      });

      setSuccess('Booking confirmed successfully. Redirecting to facilities...');
      setTimeout(() => {
        navigate('/facilities', { replace: true });
      }, 1000);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingFacility) {
    return <section className="facility-ui-page"><div className="facility-ui-message">Loading confirmation...</div></section>;
  }

  if (!facility) {
    return (
      <section className="facility-ui-page">
        <div className="facility-ui-message facility-ui-error">
          {error || 'Facility details could not be loaded.'}
        </div>
        <div className="facility-ui-inline-actions">
          <button type="button" className="facility-ui-secondary-btn" onClick={() => navigate('/facilities')}>
            Back to Facilities
          </button>
        </div>
      </section>
    );
  }

  const sportMeta = getSportMeta(facility.sportType);

  return (
    <section className="facility-ui-page">
      <div className="facility-ui-confirm-page-top-actions">
        <button
          type="button"
          className="facility-ui-back-link-btn"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="facility-ui-confirm-wrap">

        <h1>Confirm Booking</h1>
        <p>Review details and complete your reservation</p>

        <div className="facility-ui-summary-box">
          <div>
            <span>Facility</span>
            <strong>{facility.facilityName}</strong>
          </div>
          <div>
            <span>Sport</span>
            <strong>{sportMeta.icon} {facility.sportType}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{selectedDate || '-'}</strong>
          </div>
          <div>
            <span>Time Slot</span>
            <strong>{selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end}` : '-'}</strong>
          </div>
          <div>
            <span>Max Capacity</span>
            <strong>{maxPlayers} players</strong>
          </div>
        </div>

        <form className="facility-ui-confirm-form" onSubmit={handleConfirmBooking}>
          <label htmlFor="studentName">Student Name *</label>
          <input
            id="studentName"
            name="studentName"
            value={form.studentName}
            readOnly
            placeholder="Enter your full name"
          />

          <label htmlFor="studentId">Student ID *</label>
          <input
            id="studentId"
            name="studentId"
            value={form.studentId}
            readOnly
            placeholder="e.g., STU-2024-001"
          />

          <label htmlFor="players">Number of Players *</label>
          <input
            id="players"
            name="players"
            type="number"
            min="1"
            max={maxPlayers}
            value={form.players}
            onChange={handleInputChange}
          />

          <label className="facility-ui-check-row" htmlFor="agreeToTerms">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={form.agreeToTerms}
              onChange={handleInputChange}
            />
            <span>I agree to the university sports facility terms and conditions *</span>
          </label>

          {error && <div className="facility-ui-error">{error}</div>}
          {success && <div className="facility-ui-success">{success}</div>}

          <div className="facility-ui-confirm-actions">
            <button
              type="button"
              className="facility-ui-secondary-btn"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="facility-ui-primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default FacilityConfirmBookingPage;
