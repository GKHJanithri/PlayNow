import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
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
  const role = localStorage.getItem('role') || 'Guest';
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('fixtures');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/events/${id}`);
        setEvent(data?.event || data);
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

  const fixtures = event.fixtures || [];
  const results = (event.results || []).map((match) => {
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

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{event.title}</h1>
          <p className="card-meta">
            <span>Sport: {event.sportType}</span>
            <span>Tournament: {event.tournamentType}</span>
            <span>Starts: {formatDate(event.startDate)}</span>
            <span>Venue: {event.venue}</span>
          </p>
        </div>
        <div className="tag">Status: {event.status || 'Pending'}</div>
      </div>

      {(role === 'Admin' || role === 'Coach') && (
        <div className="event-quick-actions">
          {role === 'Admin' && (
            <Link to={`/admin/events/${id}/manage`} className="btn btn-secondary">
              Manage Fixtures
            </Link>
          )}
          {(role === 'Admin' || role === 'Coach') && (
            <Link to={`/events/${id}/results`} className="btn btn-secondary">
              Update Results
            </Link>
          )}
          {role === 'Coach' && (
            <Link to={`/events/${id}/practice`} className="btn btn-secondary">
              Practice Schedule
            </Link>
          )}
        </div>
      )}

      <EventTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'fixtures' && (
        <MatchTable
          matches={fixtures}
          emptyLabel="Fixtures will appear here once scheduled."
        />
      )}

      {activeTab === 'results' && (
        <MatchTable
          matches={results}
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
