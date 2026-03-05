import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const resolveTeamName = (team) => {
  if (!team) return 'Team';
  if (typeof team === 'string') return team;
  return team.name || team.teamName || team._id || 'Team';
};

const isCricketSport = (sportType) => String(sportType || '').trim().toLowerCase() === 'cricket';

const AdminDashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [matches, setMatches] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        setError('');
        const { data } = await apiClient.get('/events');
        const eventList = data?.events || data || [];
        setEvents(Array.isArray(eventList) ? eventList : []);
        if (Array.isArray(eventList) && eventList.length > 0) {
          setSelectedEventId(eventList[0]._id || eventList[0].id || '');
        }
      } catch (eventError) {
        setError(eventError.response?.data?.message || 'Failed to load events.');
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setMatches([]);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const { data } = await apiClient.get(`/matches?eventId=${selectedEventId}`);
        setMatches(Array.isArray(data) ? data : []);
      } catch (matchError) {
        setMatches([]);
        setError(matchError.response?.data?.message || 'Failed to load event matches.');
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((item) => (item._id || item.id) === selectedEventId),
    [events, selectedEventId],
  );
  const isCricketEvent = isCricketSport(selectedEvent?.sportType);

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <Link to="/admin/events/create" className="btn btn-primary">
          Create Event
        </Link>
      </div>

      {error && <div className="error-state">{error}</div>}

      <div className="form-panel">
        <div className="form-field">
          <label htmlFor="eventSelect">Select Event</label>
          <select
            id="eventSelect"
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            disabled={loadingEvents || events.length === 0}
          >
            {events.length === 0 && <option value="">No events available</option>}
            {events.map((event) => {
              const eventId = event._id || event.id;
              return (
                <option key={eventId} value={eventId}>
                  {event.title}
                </option>
              );
            })}
          </select>
        </div>

        {selectedEvent && (
          <>
            <div className="dashboard-actions">
              <Link to={`/admin/events/${selectedEventId}/manage`} className="btn btn-secondary">
                Manage Fixtures
              </Link>
              <Link to={`/events/${selectedEventId}/results`} className="btn btn-secondary">
                Update Results
              </Link>
            </div>
            {!isCricketEvent && (
              <small className="field-error">Live scorer is available only for Cricket events.</small>
            )}
          </>
        )}
      </div>

      <div className="table-card">
        <h3 style={{ marginTop: 0 }}>Matches Scoring</h3>
        {loadingMatches ? (
          <div className="loading-state">Loading matches...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Team A</th>
                <th>Team B</th>
                <th>Status</th>
                <th>Score</th>
                <th>Scorer</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    No matches found for this event.
                  </td>
                </tr>
              )}
              {matches.map((match, index) => {
                const matchId = match._id || match.id || index;
                const scoreA = Number.isFinite(match.scoreA) ? match.scoreA : 0;
                const scoreB = Number.isFinite(match.scoreB) ? match.scoreB : 0;

                return (
                  <tr key={matchId}>
                    <td>{resolveTeamName(match.teamA)}</td>
                    <td>{resolveTeamName(match.teamB)}</td>
                    <td>{match.status || 'scheduled'}</td>
                    <td>
                      {scoreA} - {scoreB}
                    </td>
                    <td>
                      {isCricketEvent ? (
                        <Link to={`/admin/matches/${match._id || match.id}/score`} className="btn btn-secondary">
                          Open Scorer
                        </Link>
                      ) : (
                        <span className="session-meta">Cricket only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AdminDashboardPage;
