import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';

const initialScoreState = {
  scoreA: 0,
  scoreB: 0,
  wicketsA: 0,
  wicketsB: 0,
  ballsA: 0,
  ballsB: 0,
  battingSide: 'A',
  striker: '',
  nonStriker: '',
  bowler: '',
  thisOver: [],
  status: 'scheduled',
};

const getOversFromBalls = (balls) => {
  const over = Math.floor(balls / 6);
  const ball = balls % 6;
  return `${over}.${ball}`;
};

const getBallsFromOvers = (oversValue) => {
  if (!oversValue && oversValue !== 0) return 0;
  const asText = String(oversValue);
  if (!asText.includes('.')) return Number(asText) * 6;
  const [overPart, ballPart] = asText.split('.');
  return Number(overPart || 0) * 6 + Number(ballPart || 0);
};

const normalizeTeamName = (team) => {
  if (!team) return 'Team';
  if (typeof team === 'string') return team;
  return team.name || team.teamName || team._id || 'Team';
};

const isCricketSport = (sportType) => String(sportType || '').trim().toLowerCase() === 'cricket';

const AdminMatchScoringPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [scoreState, setScoreState] = useState(initialScoreState);
  const [, setSnapshotStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isCricketEvent, setIsCricketEvent] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/matches/${matchId}`);
        if (data?.eventId) {
          const eventResponse = await apiClient.get(`/events/${data.eventId}`);
          const eventData = eventResponse.data?.event || eventResponse.data;
          setIsCricketEvent(isCricketSport(eventData?.sportType));
        }
        setMatch(data);
        setScoreState({
          scoreA: data.scoreA ?? 0,
          scoreB: data.scoreB ?? 0,
          wicketsA: data.wicketsA ?? 0,
          wicketsB: data.wicketsB ?? 0,
          ballsA: getBallsFromOvers(data.oversA ?? 0),
          ballsB: getBallsFromOvers(data.oversB ?? 0),
          battingSide: data.battingSide || 'A',
          striker: data.striker || '',
          nonStriker: data.nonStriker || '',
          bowler: data.bowler || '',
          thisOver: data.thisOver || [],
          status: data.status || 'scheduled',
        });
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load match scoring page.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const teamAName = useMemo(() => normalizeTeamName(match?.teamA), [match]);
  const teamBName = useMemo(() => normalizeTeamName(match?.teamB), [match]);

  const pushSnapshot = () => {
    setSnapshotStack((prev) => [...prev, scoreState]);
  };

  const updateForBall = (recipe) => {
    pushSnapshot();
    setScoreState((prev) => {
      const next = { ...prev, thisOver: [...prev.thisOver] };
      recipe(next);
      next.thisOver = next.thisOver.slice(-6);
      return next;
    });
  };

  const addRuns = (runs) => {
    updateForBall((next) => {
      if (next.battingSide === 'A') {
        next.scoreA += runs;
        next.ballsA += 1;
      } else {
        next.scoreB += runs;
        next.ballsB += 1;
      }
      next.thisOver.push(String(runs));
    });
  };

  const addExtra = (type) => {
    updateForBall((next) => {
      if (next.battingSide === 'A') {
        next.scoreA += 1;
        if (type === 'B' || type === 'LB') next.ballsA += 1;
      } else {
        next.scoreB += 1;
        if (type === 'B' || type === 'LB') next.ballsB += 1;
      }
      next.thisOver.push(type);
    });
  };

  const addWicket = () => {
    updateForBall((next) => {
      if (next.battingSide === 'A') {
        next.wicketsA += 1;
        next.ballsA += 1;
      } else {
        next.wicketsB += 1;
        next.ballsB += 1;
      }
      next.thisOver.push('W');
    });
  };

  const handleUndo = () => {
    setSnapshotStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setScoreState(last);
      return prev.slice(0, -1);
    });
  };

  const handleStartMatch = () => {
    if (!scoreState.striker.trim() || !scoreState.nonStriker.trim() || !scoreState.bowler.trim()) {
      setStatusMessage('Enter striker, non-striker and bowler before starting.');
      return;
    }
    setScoreState((prev) => ({ ...prev, status: 'live' }));
    setStatusMessage('Match marked as live. You can now score ball-by-ball.');
  };

  const handleSave = async (forceComplete = false) => {
    try {
      setSaving(true);
      setStatusMessage('');

      const payload = {
        scoreA: scoreState.scoreA,
        scoreB: scoreState.scoreB,
        wicketsA: scoreState.wicketsA,
        wicketsB: scoreState.wicketsB,
        oversA: Number(getOversFromBalls(scoreState.ballsA)),
        oversB: Number(getOversFromBalls(scoreState.ballsB)),
        battingSide: scoreState.battingSide,
        striker: scoreState.striker,
        nonStriker: scoreState.nonStriker,
        bowler: scoreState.bowler,
        thisOver: scoreState.thisOver,
        status: forceComplete ? 'completed' : scoreState.status,
      };

      const { data } = await apiClient.put(`/matches/${matchId}`, payload);
      setMatch(data);
      setStatusMessage(forceComplete ? 'Match completed and score saved.' : 'Score saved successfully.');
      if (forceComplete) {
        navigate(`/events/${data.eventId}/results`);
      }
    } catch (saveError) {
      setStatusMessage(saveError.response?.data?.message || 'Failed to save score.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading scorer...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!isCricketEvent) {
    return (
      <section className="page">
        <div className="error-state">This scoring screen is only available for Cricket matches.</div>
        <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
          <Link to={`/events/${match?.eventId}/results`} className="btn btn-secondary">
            Back to Results
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">{teamAName} v/s {teamBName}</h1>
        <Link to={`/events/${match?.eventId}/results`} className="btn btn-secondary">
          Back to Results
        </Link>
      </div>

      <div className="scoreboard-card">
        <div>
          <h3>{teamAName}</h3>
          <p className="score-line">{scoreState.scoreA}/{scoreState.wicketsA} ({getOversFromBalls(scoreState.ballsA)})</p>
        </div>
        <div>
          <h3>{teamBName}</h3>
          <p className="score-line">{scoreState.scoreB}/{scoreState.wicketsB} ({getOversFromBalls(scoreState.ballsB)})</p>
        </div>
      </div>

      {scoreState.status === 'scheduled' && (
        <div className="form-panel">
          <h3 style={{ margin: 0 }}>Select Opening Players</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="striker">Striker</label>
              <input
                id="striker"
                type="text"
                value={scoreState.striker}
                onChange={(event) =>
                  setScoreState((prev) => ({ ...prev, striker: event.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label htmlFor="nonStriker">Non-striker</label>
              <input
                id="nonStriker"
                type="text"
                value={scoreState.nonStriker}
                onChange={(event) =>
                  setScoreState((prev) => ({ ...prev, nonStriker: event.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label htmlFor="bowler">Opening Bowler</label>
              <input
                id="bowler"
                type="text"
                value={scoreState.bowler}
                onChange={(event) =>
                  setScoreState((prev) => ({ ...prev, bowler: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleStartMatch}>
              Start Match
            </button>
          </div>
        </div>
      )}

      {scoreState.status !== 'scheduled' && (
        <>
          <div className="form-panel">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="battingSide">Batting Team</label>
                <select
                  id="battingSide"
                  value={scoreState.battingSide}
                  onChange={(event) =>
                    setScoreState((prev) => ({ ...prev, battingSide: event.target.value }))
                  }
                >
                  <option value="A">{teamAName}</option>
                  <option value="B">{teamBName}</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="strikerLive">Striker</label>
                <input
                  id="strikerLive"
                  type="text"
                  value={scoreState.striker}
                  onChange={(event) =>
                    setScoreState((prev) => ({ ...prev, striker: event.target.value }))
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="nonStrikerLive">Non-striker</label>
                <input
                  id="nonStrikerLive"
                  type="text"
                  value={scoreState.nonStriker}
                  onChange={(event) =>
                    setScoreState((prev) => ({ ...prev, nonStriker: event.target.value }))
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="bowlerLive">Bowler</label>
                <input
                  id="bowlerLive"
                  type="text"
                  value={scoreState.bowler}
                  onChange={(event) =>
                    setScoreState((prev) => ({ ...prev, bowler: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="over-strip">
              <strong>This over:</strong> {scoreState.thisOver.length ? scoreState.thisOver.join(' ') : '-'}
            </div>

            <div className="score-action-grid">
              {[0, 1, 2, 3, 4, 5, 6].map((run) => (
                <button key={run} type="button" className="score-btn" onClick={() => addRuns(run)}>
                  {run}
                </button>
              ))}
              <button type="button" className="score-btn" onClick={addWicket}>
                W
              </button>
            </div>

            <div className="extras-row">
              <button type="button" className="btn btn-secondary" onClick={() => addExtra('WD')}>
                Wide
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => addExtra('NB')}>
                No Ball
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => addExtra('B')}>
                Byes
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => addExtra('LB')}>
                Leg Byes
              </button>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleUndo}>
                Undo
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleSave(false)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Score'}
              </button>
              <button type="button" className="btn btn-danger" onClick={() => handleSave(true)} disabled={saving}>
                Complete Match
              </button>
            </div>
          </div>
        </>
      )}

      {statusMessage && <div className="status-text">{statusMessage}</div>}
    </section>
  );
};

export default AdminMatchScoringPage;
