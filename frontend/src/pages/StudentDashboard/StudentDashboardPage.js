import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNotifications } from '../../utils/notifications';
import apiClient from '../../api/client';
import { logoutUser } from '../../utils/auth';
import brandLogo from '../../assets/Logo.jpeg';
import './StudentDashboardPage.css';

const quickActions = [
  {
    key: 'book-court',
    title: 'Book a Court',
    icon: 'fa-building',
    route: '/facilities',
    color: 'mint',
  },
  {
    key: 'reserve-gear',
    title: 'Reserve Gear',
    icon: 'fa-cube',
    route: '/student/items',
    color: 'blue',
  },
  {
    key: 'browse-teams',
    title: 'Browse Teams',
    icon: 'fa-users',
    route: '/student/teams',
    color: 'violet',
  },
];

const sidebarLinks = [
  { label: 'Dashboard', icon: 'fa-table-cells-large', route: '/student/dashboard', active: true },
  { label: 'Events', icon: 'fa-calendar-days', route: '/events' },
  { label: 'Items', icon: 'fa-cube', route: '/student/items' },
  { label: 'Facilities', icon: 'fa-building', route: '/facilities' },
  { label: 'Teams', icon: 'fa-users', route: '/student/teams' },
];

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const notifications = useMemo(() => getNotifications(), []);
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : {};
    } catch (_error) {
      return {};
    }
  }, []);

  const displayName = user?.fullName || 'Student';
  const [itemReservations, setItemReservations] = useState([]);
  const reservationCount = itemReservations.length;
  const myTeamsCount = Array.isArray(user?.teams) ? user.teams.length : 0;
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState('');
  const [facilityBookings, setFacilityBookings] = useState([]);
  const [facilityBookingsLoading, setFacilityBookingsLoading] = useState(true);
  const [facilityBookingsError, setFacilityBookingsError] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState('');

  const studentId = String(user?.studentId || localStorage.getItem('studentId') || '').trim();

  const formatDate = (value) => {
    if (!value) return 'Date not available';

    const parsedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return 'Date not available';

    return parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Time not available';

    const formatClock = (time) => {
      const [hours, minutes] = String(time).split(':');
      const parsedHours = Number(hours);

      if (!Number.isFinite(parsedHours)) {
        return time;
      }

      const suffix = parsedHours >= 12 ? 'PM' : 'AM';
      const normalizedHours = ((parsedHours + 11) % 12) + 1;
      return `${normalizedHours}:${minutes || '00'} ${suffix}`;
    };

    return `${formatClock(startTime)} - ${formatClock(endTime)}`;
  };

  const createFacilityBookingUpdate = (booking) => {
    const facilityName = booking?.facilityId?.facilityName || booking?.facilityName || 'Facility booking';
    const sportType = booking?.facilityId?.sportType || booking?.sportType || 'Facility';
    const status = booking?.status || 'Active';

    return {
      id: booking?._id || booking?.id,
      title: `${facilityName} booked`,
      message: `${formatDate(booking?.date)} · ${formatTimeRange(booking?.startTime, booking?.endTime)} · ${status}`,
      detailRows: [
        `Sport: ${sportType}`,
        `Players: ${booking?.players ?? 1}`,
        `Booked by: ${booking?.studentName || displayName}`,
        `Status: ${status}`,
      ],
      badge: status,
      createdAt: booking?.createdAt || booking?.updatedAt || new Date().toISOString(),
    };
  };

  const handleCancelFacilityBooking = async (bookingId) => {
    if (!bookingId) return;

    const confirmed = window.confirm('Cancel this facility booking? This will remove it from your dashboard.');
    if (!confirmed) return;

    setCancellingBookingId(bookingId);

    try {
      await apiClient.delete(`/booking/${bookingId}`);
      setFacilityBookings((currentBookings) => currentBookings.filter((booking) => booking._id !== bookingId));
    } catch (_error) {
      alert('Could not cancel booking. Please try again.');
    } finally {
      setCancellingBookingId('');
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const { data } = await apiClient.get('/events?upcoming=true');
        const payload = data?.events || data || [];
        const normalizedEvents = (Array.isArray(payload) ? payload : []).filter(
          (event) => event?.title && event?.sportType && event?.startDate,
        );
        setEvents(normalizedEvents);
      } catch (_error) {
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
  const fetchReservations = async () => {
    setReservationsLoading(true);
    setReservationsError('');
    try {
     
      const queryId = user?.studentId || localStorage.getItem('studentId');
      
      console.log('DEBUG: Readable studentId used for fetch:', queryId);
      
      if (!queryId) {
        setItemReservations([]);
        setReservationsLoading(false);
        return;
      }

      const response = await apiClient.get(`/items/itemReservations?student_id=${queryId}`);
      const data = response.data;
      
      setItemReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setReservationsError('Could not load reservations.');
      setItemReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };
  fetchReservations();
}, [user]); // user is already a dependency, which is good



  useEffect(() => {
    const fetchFacilityBookings = async () => {
      setFacilityBookingsLoading(true);
      setFacilityBookingsError('');

      try {
        if (!studentId) {
          setFacilityBookings([]);
          return;
        }

        const response = await apiClient.get('/bookings');
        const bookings = Array.isArray(response.data) ? response.data : [];
        const currentStudentBookings = bookings.filter((booking) => {
          const bookingStudentId = String(booking?.studentId || '').trim();
          const bookingStudentName = String(booking?.studentName || '').trim().toLowerCase();
          const displayNameMatches = bookingStudentName && bookingStudentName === displayName.toLowerCase();
          return bookingStudentId === studentId || displayNameMatches;
        });

        setFacilityBookings(currentStudentBookings);
      } catch (_error) {
        setFacilityBookings([]);
        setFacilityBookingsError('Could not load facility updates.');
      } finally {
        setFacilityBookingsLoading(false);
      }
    };

    fetchFacilityBookings();
  }, [studentId, displayName]);

  const filteredEvents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) => {
      return (
        event.title?.toLowerCase().includes(query) ||
        event.sportType?.toLowerCase().includes(query)
      );
    });
  }, [events, searchTerm]);

  const topUpcomingEvents = filteredEvents.slice(0, 3);

  const welcomeNotification = useMemo(() => {
    return notifications.find((note) => note.id === 'welcome-note') || notifications[0] || null;
  }, [notifications]);

  const recentFacilityUpdates = useMemo(() => {
    return facilityBookings
      .map(createFacilityBookingUpdate)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }, [facilityBookings, displayName, createFacilityBookingUpdate]);

  const recentNotificationUpdates = useMemo(() => {
    return notifications
      .filter((note) => note.id !== 'welcome-note')
      .map((note) => ({
      id: note.id,
      title: note.title,
      message: note.message,
      detailRows: note.role ? [`Source: ${note.role}`] : [],
      badge: note.role || 'Update',
      createdAt: note.createdAt || new Date().toISOString(),
    }));
  }, [notifications]);

  const formatEventDate = (value) => {
    if (!value) return 'Date not available';
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
    });
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/', { replace: true });
  };

  return (
    <section className="student-dashboard-page">
      <aside className="student-sidebar">
        <div className="student-sidebar-brand">
          <div className="student-brand-icon" aria-hidden="true">
            <img src={brandLogo} alt="" className="student-brand-logo" />
          </div>
          <h2>PlayNow</h2>
        </div>

        <nav className="student-sidebar-nav" aria-label="Student menu">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              to={link.route}
              className={`student-sidebar-link${link.active ? ' active' : ''}`}
            >
              <i className={`fa-solid ${link.icon}`} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="student-sidebar-footer">
          <h3>Notifications</h3>
          <p>{notifications.length} updates</p>

          <div className="student-user-card">
            <div className="student-avatar" aria-hidden="true">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4>{displayName}</h4>
              <span>Student Athlete</span>
            </div>
          </div>

          <button type="button" className="student-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="student-dashboard-main">
        <header className="student-topbar">
          <div className="student-search-shell" role="search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by title or sport"
              aria-label="Search events"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="student-topbar-user">
            <h3>{displayName}</h3>
            <span>Student</span>
          </div>
        </header>

        <div className="student-stats-grid" role="list">
          <article className="student-stat-card" role="listitem">
            <div className="student-stat-icon icon-blue">
              <i className="fa-regular fa-calendar" aria-hidden="true" />
            </div>
            <strong>{events.length}</strong>
            <p>Upcoming Events</p>
          </article>

          <article className="student-stat-card" role="listitem">
            <div className="student-stat-icon icon-green">
              <i className="fa-solid fa-cube" aria-hidden="true" />
            </div>
            <strong>{reservationCount}</strong>
            <p>My Reservations</p>
          </article>

          <article className="student-stat-card" role="listitem">
            <div className="student-stat-icon icon-purple">
              <i className="fa-solid fa-users" aria-hidden="true" />
            </div>
            <strong>{myTeamsCount}</strong>
            <p>My Teams</p>
          </article>

          <article className="student-stat-card" role="listitem">
            <div className="student-stat-icon icon-amber">
              <i className="fa-regular fa-bell" aria-hidden="true" />
            </div>
            <strong>{notifications.length}</strong>
            <p>Notifications</p>
          </article>
        </div>

        <div className="student-layout-grid">
          <section className="student-content-block" aria-labelledby="student-quick-title">
            <div className="student-block-header">
              <h2 id="student-quick-title">Quick Actions</h2>
            </div>

            <div className="student-quick-grid">
              {quickActions.map((action) => (
                <Link key={action.key} to={action.route} className="student-action-card">
                  <span className={`student-action-icon ${action.color}`}>
                    <i className={`fa-solid ${action.icon}`} aria-hidden="true" />
                  </span>
                  <h3>{action.title}</h3>
                </Link>
              ))}
            </div>

            <div className="student-block-header events-header">
              <h2>Upcoming Events</h2>
              <Link to="/events" className="student-view-all">View All</Link>
            </div>

            <div className="student-event-list">
              {eventsLoading && <div className="student-empty-update">Loading events...</div>}

              {!eventsLoading && topUpcomingEvents.length === 0 && (
                <div className="student-empty-update">No upcoming events available.</div>
              )}

              {!eventsLoading && topUpcomingEvents.map((event) => (
                <article key={event._id || event.id || event.title} className="student-event-card">
                  <span className="student-event-tag">{event.sportType}</span>
                  <h3>{event.title}</h3>
                  <p>
                    <i className="fa-regular fa-calendar" aria-hidden="true" /> {formatEventDate(event.startDate)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Updates Panel with Reservation Board/Card */}
          <aside className="student-updates-panel" aria-labelledby="student-updates-title">
            <h2 id="student-updates-title">Recent Updates</h2>
            <div className="student-updates-featured-grid">
              <article className="student-highlight-card student-highlight-card-welcome">
                <div className="student-highlight-card-topline">
                  <span className="student-highlight-kicker">Welcome</span>
                  <span className="student-highlight-badge">{displayName}</span>
                </div>
                <h3>{welcomeNotification?.title || 'Welcome to PlayNow'}</h3>
                <p>{welcomeNotification?.message || 'Track your bookings, teams, and event updates from one dashboard.'}</p>
              </article>
            </div>

            <div className="student-updates-section">
              <div className="student-updates-section-header">
                <h3>Facility Updates</h3>
                <span>{facilityBookings.length} booking{facilityBookings.length === 1 ? '' : 's'}</span>
              </div>

              {facilityBookingsLoading && <div className="student-empty-update">Loading facility updates...</div>}

              {!facilityBookingsLoading && facilityBookingsError && (
                <div className="student-empty-update">{facilityBookingsError}</div>
              )}

              {!facilityBookingsLoading && !facilityBookingsError && recentFacilityUpdates.length === 0 && (
                <div className="student-empty-update">No facility bookings yet.</div>
              )}

              {!facilityBookingsLoading && !facilityBookingsError && recentFacilityUpdates.map((update) => (
                <article key={update.id} className="student-update-card student-facility-update-card">
                  <div className="student-update-card-header">
                    <span className="student-update-badge facility">{update.badge}</span>
                    <span className="student-update-meta">Facility booking</span>
                  </div>
                  <h3>{update.title}</h3>
                  <p>{update.message}</p>
                  <div className="student-update-details">
                    {update.detailRows.map((row) => (
                      <span key={row}>{row}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="cancel-btn student-facility-cancel-btn"
                    onClick={() => handleCancelFacilityBooking(update.id)}
                    disabled={cancellingBookingId === update.id}
                  >
                    {cancellingBookingId === update.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </article>
              ))}
            </div>

            <div className="student-updates-section student-updates-section-spaced">
              <div className="student-updates-section-header">
                <h3>Notifications</h3>
                <span>{recentNotificationUpdates.length} item{recentNotificationUpdates.length === 1 ? '' : 's'}</span>
              </div>

              <div className="student-update-list">
                {recentNotificationUpdates.length === 0 && (
                  <div className="student-empty-update">No updates yet. New notifications will appear here.</div>
                )}
                {recentNotificationUpdates.slice(0, 6).map((note) => (
                  <article key={note.id} className="student-update-item">
                    <span className="student-update-dot" aria-hidden="true" />
                    <div>
                      <h3>{note.title}</h3>
                      <p>{note.message}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="reservation-board student-reservation-board" style={{ marginTop: 24 }}>
              <div className="student-block-header student-reservations-header">
                <h2>My Reservations</h2>
                <span>{itemReservations.length} total</span>
              </div>
              {!reservationsLoading && !reservationsError && itemReservations.length === 0 && (
                <div className="student-empty-update">No reservations yet.</div>
              )}
              <div className="item-grid">
                {!reservationsLoading && !reservationsError && itemReservations.map((res) => (
                  <div key={res._id} className="equipment-card" style={{ minWidth: 280 }}>
                    <div className="equipment-header">
                      <h3>{res.item_name}</h3>
                      <span className="sport-tag">{res.item_category || 'Sports'}</span>
                    </div>
                    <div className="availability-row">
                      <span>Quantity:</span>
                      <strong>{res.item_quantity_reserved}</strong>
                    </div>
                    <div className="condition-row">
                      <span>Purpose:</span>
                      <span>{res.item_reservation_purpose}</span>
                    </div>
                    <div className="availability-row">
                      <span>Borrow:</span>
                      <strong>{res.item_reservation_date ? new Date(res.item_reservation_date).toLocaleDateString() : '-'}</strong>
                    </div>
                    <div className="availability-row">
                      <span>Return:</span>
                      <strong>{res.item_reservation_return_date ? new Date(res.item_reservation_return_date).toLocaleDateString() : '-'}</strong>
                    </div>
                    <div className="condition-row">
                      <span>Status:</span>
                      <span style={{ color: res.item_reservation_status === 'Returned' ? '#16a34a' : '#1a73e8' }}>{res.item_reservation_status || 'Active'}</span>
                    </div>
                    {res.item_reservation_status === 'Reserved' && (
                      <button
                        className="cancel-btn"
                        style={{ marginTop: 10, width: '100%' }}
                        onClick={async () => {
                          try {
                            await fetch(
                              `http://localhost:5000/api/items/${res._id}/cancelreservedItem`,
                              { method: 'DELETE' }
                            );
                            setItemReservations((prev) => prev.filter((r) => r._id !== res._id));
                          } catch (err) {
                            alert('Cancel failed');
                          }
                        }}
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default StudentDashboardPage;