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
  const reservationCount = Array.isArray(user?.reservations) ? user.reservations.length : 0;
  const myTeamsCount = Array.isArray(user?.teams) ? user.teams.length : 0;

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

          <aside className="student-updates-panel" aria-labelledby="student-updates-title">
            <h2 id="student-updates-title">Recent Updates</h2>
            <div className="student-update-list">
              {notifications.length === 0 && (
                <div className="student-empty-update">No updates yet. New notifications will appear here.</div>
              )}
              {notifications.slice(0, 6).map((note) => (
                <article key={note.id} className="student-update-item">
                  <span className="student-update-dot" aria-hidden="true" />
                  <div>
                    <h3>{note.title}</h3>
                    <p>{note.message}</p>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default StudentDashboardPage;