import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { getSportMeta, rangesOverlap, TIME_SLOTS } from './facilityData';
import './FacilityBooking.css';

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const formatFullDate = (isoDate) => {
  if (!isoDate) return '';
  const parsedDate = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};

const FacilityDateTimePage = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  const stateFacility = locationState.facility || null;

  const [facility, setFacility] = useState(stateFacility);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(toIsoDate(new Date()));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookingContext = async () => {
      setIsLoading(true);
      setError('');

      try {
        const bookingResponse = await apiClient.get('/bookings');

        if (!stateFacility) {
          const facilityResponse = await apiClient.get('/facilities');
          const allFacilities = Array.isArray(facilityResponse.data) ? facilityResponse.data : [];
          const activeFacility = allFacilities.find((entry) => entry._id === facilityId);

          if (!activeFacility) {
            setError('Facility not found.');
          } else {
            setFacility(activeFacility);
          }
        }

        setBookings(Array.isArray(bookingResponse.data) ? bookingResponse.data : []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Could not load booking details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingContext();
  }, [facilityId, stateFacility]);

  useEffect(() => {
    setSelectedSlot('');
  }, [selectedDate]);

  const reservedSlots = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingFacilityId = booking?.facilityId?._id || booking?.facilityId;
      return bookingFacilityId === facilityId && booking.date === selectedDate;
    });
  }, [bookings, facilityId, selectedDate]);

  const isTimeSlotBooked = (slot) => {
    return reservedSlots.some((booking) => rangesOverlap(slot.start, slot.end, booking.startTime, booking.endTime));
  };

  const handleProceed = () => {
    if (!facility || !selectedSlot) return;

    const slot = TIME_SLOTS.find((entry) => `${entry.start}-${entry.end}` === selectedSlot);
    if (!slot) return;

    navigate(`/facilities/${facilityId}/confirm`, {
      state: {
        facility,
        date: selectedDate,
        slot,
      },
    });
  };

  if (isLoading) {
    return <section className="facility-ui-page"><div className="facility-ui-message">Loading booking view...</div></section>;
  }

  if (error || !facility) {
    return (
      <section className="facility-ui-page">
        <div className="facility-ui-message facility-ui-error">{error || 'Facility details are unavailable.'}</div>
        <div className="facility-ui-inline-actions">
          <button type="button" className="facility-ui-back-link-btn" onClick={() => navigate('/facilities')}>
            Back to Facilities
          </button>
        </div>
      </section>
    );
  }

  const sportMeta = getSportMeta(facility.sportType);
  const capacity = Number(facility.maxPlayers) || 0;

  return (
    <section className="facility-ui-page">
      <div className="facility-ui-detail-wrap">
        <div className="facility-ui-detail-top-actions">
          <button
            type="button"
            className="facility-ui-back-link-btn"
            onClick={() => navigate('/facilities')}
          >
            Back to Facilities
          </button>
        </div>

        <div className="facility-ui-hero-image">
          <img src={sportMeta.image} alt={facility.facilityName} />
          <button type="button" className="facility-ui-hero-arrow left" aria-label="Previous image">‹</button>
          <button type="button" className="facility-ui-hero-arrow right" aria-label="Next image">›</button>
          <div className="facility-ui-hero-dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>

        <div className="facility-ui-detail-grid">
          <article className="facility-ui-left-panel">
            <h1>{facility.facilityName}</h1>
            <div className="facility-ui-single-chip">
              <span aria-hidden="true">{sportMeta.icon}</span>
              {facility.sportType}
            </div>
            <p>
              A full-size {facility.sportType.toLowerCase()} facility with well-maintained space and safe playing conditions.
            </p>

            <div className="facility-ui-key-facts">
              <span>📍 {facility.location || 'University Sports Complex'}</span>
              <span>👥 Up to {capacity} players</span>
              <span>🕒 6:00 - 20:00</span>
            </div>
          </article>

          <aside className="facility-ui-right-panel">
            <h2>Select Date and Time</h2>
            <input
              type="date"
              min={toIsoDate(new Date())}
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />

            <p className="facility-ui-date-preview">{formatFullDate(selectedDate)}</p>

            <h3>Available Time Slots</h3>
            <div className="facility-ui-time-grid">
              {TIME_SLOTS.map((slot) => {
                const slotKey = `${slot.start}-${slot.end}`;
                const isBooked = isTimeSlotBooked(slot) || !facility.availability;
                const isSelected = selectedSlot === slotKey;

                return (
                  <button
                    key={slotKey}
                    type="button"
                    className={`facility-ui-time-btn${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelectedSlot(slotKey)}
                    disabled={isBooked}
                  >
                    {isBooked ? 'Booked' : `${slot.start} - ${slot.end}`}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="facility-ui-primary-btn"
              onClick={handleProceed}
              disabled={!selectedSlot}
            >
              Proceed to Book
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default FacilityDateTimePage;
