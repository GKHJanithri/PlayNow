import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import EventTabs from '../components/EventTabs';
import MatchTable from '../components/MatchTable';
import PracticeList from '../components/PracticeList';

const tabs = [
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'results', label: 'Results' },
  { value: 'practice', label: 'Practice' },
];

const formatDate = (value) => {
  if (!value) return 'To be announced';
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'Guest';
  const [event, setEvent] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('fixtures');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError('');
        const [eventResponse, fixturesResponse, matchesResponse] = await Promise.all([
          apiClient.get(`/events/${id}`),
          apiClient.get(`/events/${id}/fixtures`),
          apiClient.get(`/matches?eventId=${id}`),
        ]);

        const eventPayload = eventResponse.data?.event || eventResponse.data;
        const fixturePayload = fixturesResponse.data?.fixtures || fixturesResponse.data || [];
        const matchPayload = matchesResponse.data?.matches || matchesResponse.data || [];

        setEvent(eventPayload);
        setFixtures(Array.isArray(fixturePayload) ? fixturePayload : []);
        setResults(Array.isArray(matchPayload) ? matchPayload : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this event.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="loading-state">Loading event details...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (!event) {
    return <div className="empty-state">Event not found.</div>;
  }

  const resultsWithWinners = results.map((match) => {
    if (match.winner) return match;
    const { scoreA, scoreB, teamA, teamB } = match;
    if (Number.isFinite(scoreA) && Number.isFinite(scoreB)) {
      if (scoreA > scoreB) return { ...match, winner: teamA };
      if (scoreB > scoreA) return { ...match, winner: teamB };
      return { ...match, winner: 'Draw' };
    }
    return match;
  });
  const practiceSessions = event.practiceSessions || [];

  const handleDeleteEvent = async () => {
    const confirmed = window.confirm('Delete this event? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError('');
      await apiClient.delete(`/events/${id}`);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  const handleGoToMatchScoring = () => {
    const firstMatch = results.find((match) => (match?._id || match?.id));
    const firstMatchId = firstMatch?._id || firstMatch?.id;

    if (firstMatchId) {
      navigate(`/admin/matches/${firstMatchId}/score`);
      return;
    }

    navigate(`/events/${id}/results`);
  };

  return (
    <section className="page event-details-page">
      <div className="event-top-nav">
        <Link to="/events" className="btn btn-secondary">
          Back to Upcoming Events
        </Link>
      </div>

        <div className="page-header event-summary-card">
          <div className="event-summary-main">
            <h1 className="page-title event-summary-title">{event.title}</h1>
            <div className="card-meta event-summary-meta">
              <span><strong>Sport:</strong> {event.sportType}</span>
              <span><strong>Tournament:</strong> {event.tournamentType}</span>
              <span><strong>Starts:</strong> {formatDate(event.startDate)}</span>
              <span><strong>Venue:</strong> {event.venue}</span>
            </div>
          </div>
          <div className="tag event-summary-tag">Status: {event.status || 'Pending'}</div>
        </div>

        <div className="event-tabs-row">
          <EventTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          {role === 'Admin' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleGoToMatchScoring}
            >
              Match Scoring
            </button>
          )}
          {role === 'Admin' && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteEvent}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Event'}
            </button>
          )}
        </div>

        {activeTab === 'fixtures' && (
          <MatchTable
            matches={fixtures}
            emptyLabel="Fixtures will appear here once scheduled."
          />
        )}

        {activeTab === 'results' && (
          <MatchTable
            matches={resultsWithWinners}
            showScores
            showWinner
            emptyLabel="Results will appear after matches are played."
          />
        )}

        {activeTab === 'practice' && (
          <PracticeList
            sessions={practiceSessions}
            emptyLabel="No practice sessions logged for this event."
          />
        )}
    </section>
  );
};

export default EventDetailsPage;
