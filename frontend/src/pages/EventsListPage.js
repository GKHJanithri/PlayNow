import React, { useEffect, useMemo, useState } from 'react';
import EventCard from '../components/EventCard';
import apiClient from '../api/client';

const EventsListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/events');
        setEvents(data?.events || data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load events right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const query = searchTerm.toLowerCase().trim();
      if (!query) return true;
      return (
        event.title?.toLowerCase().includes(query) ||
        event.sportType?.toLowerCase().includes(query)
      );
    });
  }, [events, searchTerm]);

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Upcoming Events</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title or sport"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {loading && <div className="loading-state">Loading events...</div>}
      {error && !loading && <div className="error-state">{error}</div>}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="empty-state">No events match your search.</div>
      )}

      {!loading && !error && filteredEvents.length > 0 && (
        <div className="card-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event._id || event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
};

export default EventsListPage;
