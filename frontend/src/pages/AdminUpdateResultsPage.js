import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/client';

const isCricketSport = (sportType) => String(sportType || '').trim().toLowerCase() === 'cricket';

const determineWinner = (match) => {
  const { scoreA, scoreB, teamA, teamB } = match;
  if (!Number.isFinite(scoreA) || !Number.isFinite(scoreB)) return match.winner;
  if (scoreA > scoreB) return teamA;
  if (scoreB > scoreA) return teamB;
  return 'Draw';
};

const AdminUpdateResultsPage = () => {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isCricketEvent, setIsCricketEvent] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const [matchesResponse, eventResponse] = await Promise.all([
          apiClient.get(`/matches?eventId=${id}`),
          apiClient.get(`/events/${id}`),
        ]);
        const eventData = eventResponse.data?.event || eventResponse.data;
        setIsCricketEvent(isCricketSport(eventData?.sportType));
        setMatches(Array.isArray(matchesResponse.data) ? matchesResponse.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load match results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const matchesWithWinners = useMemo(
    () =>
      matches.map((match) => ({
        ...match,
        winner: determineWinner(match),
      })),
    [matches],
  );

  const handleChangeMatch = (matchKey, field, value) => {
    setMatches((prev) =>
      prev.map((match, index) => {
        const currentKey = match._id || match.id || index;
        if (currentKey === matchKey) {
          return { ...match, [field]: value };
        }
        return match;
      }),
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setStatus('');
      await Promise.all(
        matches.map((match) => apiClient.put(`/matches/${match._id || match.id}`, match)),
      );
      setStatus('Results updated successfully.');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to update results.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading results...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Update Results (Admin / Coach)</h1>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Results'}
        </button>
      </div>
      {!isCricketEvent && (
        <div className="error-state">Live scorer is available only for Cricket events.</div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Team A</th>
              <th>Team B</th>
              <th>Score A</th>
              <th>Score B</th>
              <th>Winner</th>
              <th>Scorer</th>
            </tr>
          </thead>
          <tbody>
            {matchesWithWinners.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem' }}>
                  No matches available for scoring.
                </td>
              </tr>
            )}
            {matchesWithWinners.map((match, index) => {
              const key = match._id || match.id || index;
              return (
                <tr key={key}>
                  <td>{String(match.teamA || '')}</td>
                  <td>{String(match.teamB || '')}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={Number.isFinite(match.scoreA) ? match.scoreA : 0}
                      onChange={(event) =>
                        handleChangeMatch(key, 'scoreA', Number(event.target.value || 0))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={Number.isFinite(match.scoreB) ? match.scoreB : 0}
                      onChange={(event) =>
                        handleChangeMatch(key, 'scoreB', Number(event.target.value || 0))
                      }
                    />
                  </td>
                  <td>{String(match.winner || '-')}</td>
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
      </div>

      {status && <div className="status-text">{status}</div>}
    </section>
  );
};

export default AdminUpdateResultsPage;
