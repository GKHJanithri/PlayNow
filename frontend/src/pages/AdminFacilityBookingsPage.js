import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './AdminFacilityBookingsPage.css';

const formatDateLabel = (value) => {
  if (!value) return '-';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(parsed);
};

const formatDateTimeLabel = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);
};

const formatCreatedDateParts = (value) => {
  if (!value) return { date: '-', time: '' };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: value, time: '' };
  }

  const datePart = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed);

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);

  return { date: datePart, time: timePart };
};

const toMinutes = (timeValue) => {
  if (!timeValue || !timeValue.includes(':')) return NaN;
  const [hours, minutes] = timeValue.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return (hours * 60) + minutes;
};

const getBookingStatus = (booking) => {
  if (booking?.status === 'Cancelled') return 'Cancelled';

  const bookingDateValue = booking?.date;
  if (!bookingDateValue) return 'Upcoming';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingDate = new Date(`${bookingDateValue}T00:00:00`);
  if (Number.isNaN(bookingDate.getTime())) return 'Upcoming';

  if (bookingDate < today) return 'Used';
  if (bookingDate > today) return 'Upcoming';

  const endMinutes = toMinutes(booking?.endTime);
  if (!Number.isFinite(endMinutes)) return 'Upcoming';

  const now = new Date();
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();
  return currentMinutes >= endMinutes ? 'Used' : 'Upcoming';
};

const AdminFacilityBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    studentId: '',
    studentName: '',
    sport: '',
    date: '',
  });

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiClient.get('/bookings');
        const list = Array.isArray(response.data) ? response.data : [];
        setBookings(list);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Could not load bookings from server.');
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const sortedBookings = useMemo(() => {
    const copy = [...bookings];
    copy.sort((left, right) => {
      const leftTime = new Date(left.createdAt || 0).getTime();
      const rightTime = new Date(right.createdAt || 0).getTime();
      return rightTime - leftTime;
    });
    return copy;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const studentIdQuery = filters.studentId.trim().toLowerCase();
    const studentNameQuery = filters.studentName.trim().toLowerCase();
    const sportQuery = filters.sport.trim().toLowerCase();
    const dateQuery = filters.date;

    return sortedBookings.filter((booking) => {
      const facility = booking?.facilityId || {};
      const studentIdValue = String(booking?.studentId || '').toLowerCase();
      const studentNameValue = String(booking?.studentName || '').toLowerCase();
      const sportValue = String(facility?.sportType || '').toLowerCase();
      const dateValue = booking?.date || '';

      const matchesStudentId = !studentIdQuery || studentIdValue.includes(studentIdQuery);
      const matchesStudentName = !studentNameQuery || studentNameValue.includes(studentNameQuery);
      const matchesSport = !sportQuery || sportValue.includes(sportQuery);
      const matchesDate = !dateQuery || dateValue === dateQuery;

      return matchesStudentId && matchesStudentName && matchesSport && matchesDate;
    });
  }, [sortedBookings, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      studentId: '',
      studentName: '',
      sport: '',
      date: '',
    });
  };

  return (
    <section className="page admin-bookings-page">
      <div className="admin-bookings-header">
        <div>
          <h1 className="page-title">Facility Booking List</h1>
          <p className="admin-bookings-subtitle">All facility reservation details</p>
        </div>
        <button
          type="button"
          className="admin-bookings-back-btn"
          onClick={() => navigate('/admin/facilities')}
        >
          Back to Facilities
        </button>
      </div>

      <div className="admin-bookings-table-wrap">
        {isLoading && <div className="admin-bookings-info">Loading booking list...</div>}
        {!isLoading && error && <div className="admin-bookings-info error">{error}</div>}

        {!isLoading && !error && (
          <>
            <div className="admin-bookings-filters" aria-label="Booking search filters">
              <label className="admin-bookings-filter-field" htmlFor="studentId">
                Student ID
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={filters.studentId}
                  onChange={handleFilterChange}
                  placeholder="Search by student ID"
                />
              </label>
              <label className="admin-bookings-filter-field" htmlFor="studentName">
                Student Name
                <input
                  id="studentName"
                  name="studentName"
                  type="text"
                  value={filters.studentName}
                  onChange={handleFilterChange}
                  placeholder="Search by student name"
                />
              </label>
              <label className="admin-bookings-filter-field" htmlFor="sport">
                Sport
                <input
                  id="sport"
                  name="sport"
                  type="text"
                  value={filters.sport}
                  onChange={handleFilterChange}
                  placeholder="Search by sport"
                />
              </label>
              <label className="admin-bookings-filter-field" htmlFor="date">
                Date
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                />
              </label>
              <div className="admin-bookings-filter-actions">
                <button
                  type="button"
                  className="admin-bookings-clear-btn"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
              </div>
            </div>

            <table className="admin-bookings-table" aria-label="Facility bookings table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Sport</th>
                  <th>Location</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Players</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={11} className="admin-bookings-empty">
                      No bookings match your search.
                    </td>
                  </tr>
                )}

                {filteredBookings.map((booking) => {
                  const facility = booking?.facilityId || {};
                  const bookingStatus = getBookingStatus(booking);
                  const createdAt = formatCreatedDateParts(booking.createdAt);
                  const fullCreatedAt = formatDateTimeLabel(booking.createdAt);

                  return (
                    <tr key={booking._id}>
                      <td className="admin-bookings-cell-strong">{facility.facilityName || '-'}</td>
                      <td>{facility.sportType || '-'}</td>
                      <td className="admin-bookings-cell-location">{facility.location || '-'}</td>
                      <td className="admin-bookings-cell-strong">{booking.studentName || '-'}</td>
                      <td className="admin-bookings-cell-code">{booking.studentId || '-'}</td>
                      <td className="admin-bookings-cell-code">{formatDateLabel(booking.date)}</td>
                      <td className="admin-bookings-cell-code">{booking.startTime || '-'}</td>
                      <td className="admin-bookings-cell-code">{booking.endTime || '-'}</td>
                      <td className="admin-bookings-cell-code">{booking.players ?? '-'}</td>
                      <td>
                        <span className={`admin-bookings-status admin-bookings-status-${bookingStatus.toLowerCase()}`}>
                          {bookingStatus}
                        </span>
                      </td>
                      <td className="admin-bookings-created-cell" title={fullCreatedAt}>
                        <span>{createdAt.date}</span>
                        {createdAt.time && <small>{createdAt.time}</small>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="admin-bookings-footer">
              <span>Showing {filteredBookings.length} of {sortedBookings.length} bookings</span>
              <Link to="/admin/dashboard" className="admin-bookings-back-link">Back to Dashboard</Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AdminFacilityBookingsPage;
