import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import './AdminMatchScoringPage.css';

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
  const [battingTeamPlayers, setBattingTeamPlayers] = useState([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState([]);

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
        
        // Fetch players for both teams
        if (data?.teamA?._id || data?.teamA?.id) {
          try {
            const teamAResponse = await apiClient.get(`/teams/${data.teamA._id || data.teamA.id}`);
            const teamAPlayers = teamAResponse.data?.players || teamAResponse.data?.team?.players || [];
            setBattingTeamPlayers(teamAPlayers);
          } catch (e) {
            console.log('Could not fetch Team A players');
          }
        }
        
        if (data?.teamB?._id || data?.teamB?.id) {
          try {
            const teamBResponse = await apiClient.get(`/teams/${data.teamB._id || data.teamB.id}`);
            const teamBPlayers = teamBResponse.data?.players || teamBResponse.data?.team?.players || [];
            setBowlingTeamPlayers(teamBPlayers);
          } catch (e) {
            console.log('Could not fetch Team B players');
          }
        }
        
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

  const handleUndo = () => {
    setSnapshotStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setScoreState(last);
      return prev.slice(0, -1);
    });
  };

  const handleRetire = () => {
    pushSnapshot();
    setScoreState((prev) => ({ ...prev, striker: '' }));
    setStatusMessage('Batsman retired. Enter new batsman name.');
  };

  const handleSwapBatsman = () => {
    pushSnapshot();
    setScoreState((prev) => ({
      ...prev,
      striker: prev.nonStriker,
      nonStriker: prev.striker,
    }));
    setStatusMessage('Batsmen swapped.');
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
        <div className="cricket-scorer">
          <div className="opening-players-form">
            <h3 className="form-title">Select Opening Players</h3>
            
            <div className="player-input-group">
              <label htmlFor="striker-init">Striker ({scoreState.battingSide === 'A' ? teamAName : teamBName})</label>
              <select
                id="striker-init"
                value={scoreState.striker}
                onChange={(event) =>
                  setScoreState((prev) => ({ ...prev, striker: event.target.value }))
                }
              >
                <option value="">Select Player</option>
                {battingTeamPlayers.length > 0 ? (
                  battingTeamPlayers.map((player) => (
                    <option key={player._id || player.id} value={player.name || player.playerName || player._id}>
                      {player.name || player.playerName}
                    </option>
                  ))
                ) : (
                  <option disabled>No players available</option>
                )}
              </select>
            </div>

            <div className="player-input-group">
              <label htmlFor="nonStriker-init">Non-striker ({scoreState.battingSide === 'A' ? teamAName : teamBName})</label>
              <select
                id="nonStriker-init"
                value={scoreState.nonStriker}
                onChange={(event) =>
                  setScoreState((prev) => ({ ...prev, nonStriker: event.target.value }))
                }
              >
                <option value="">Select Player</option>
                {battingTeamPlayers.length > 0 ? (
                  battingTeamPlayers.map((player) => (
                    <option key={player._id || player.id} value={player.name || player.playerName || player._id}>
                      {player.name || player.playerName}
                    </option>
                  ))
                ) : (
                  <option disabled>No players available</option>
                )}
              </select>
            </div>

            <div className="player-input-group">
              <label htmlFor="bowler-init">Opening Bowler ({scoreState.battingSide === 'A' ? teamBName : teamAName})</label>
              <select
                id="bowler-init"
                value={scoreState.bowler}
                onChange={(event) =>
                  setScoreState((prev) => ({ ...prev, bowler: event.target.value }))
                }
              >
                <option value="">Select Player</option>
                {bowlingTeamPlayers.length > 0 ? (
                  bowlingTeamPlayers.map((player) => (
                    <option key={player._id || player.id} value={player.name || player.playerName || player._id}>
                      {player.name || player.playerName}
                    </option>
                  ))
                ) : (
                  <option disabled>No players available</option>
                )}
              </select>
            </div>

            <button 
              type="button" 
              className="btn-start-match" 
              onClick={handleStartMatch}
            >
              Start Match
            </button>
          </div>
        </div>
      )}

      {scoreState.status !== 'scheduled' && (
        <>
          <div className="cricket-scorer">
            <div className="scorer-header">
              <div className="inning-info">
                <div className="team-badge">{scoreState.battingSide}, 1st inning</div>
                <div className="current-rate">CRR: {scoreState.ballsA > 0 ? (scoreState.scoreA / (scoreState.ballsA / 6)).toFixed(2) : '0.00'}</div>
              </div>
            </div>

            <div className="score-card">
              <div className="score-main">
                <h2 className="score-display">{scoreState.scoreA} - {scoreState.scoreB}</h2>
                <p className="score-meta">({scoreState.wicketsA} - {scoreState.wicketsB})</p>
              </div>
            </div>

            <div className="batter-box">
              <div className="player-section">
                <h4 className="player-label">Batsman</h4>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <td>Name</td>
                      <td>R</td>
                      <td>B</td>
                      <td>4s</td>
                      <td>6s</td>
                      <td>SR</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="player-name">{scoreState.striker || 'Not selected'}*</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <td className="player-name">{scoreState.nonStriker || 'Not selected'}</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="player-section">
                <h4 className="player-label">Bowler</h4>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <td>Name</td>
                      <td>O</td>
                      <td>M</td>
                      <td>R</td>
                      <td>W</td>
                      <td>ER</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="player-name">{scoreState.bowler || 'Not selected'}</td>
                      <td>0.0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="this-over-section">
              <h4>This over:</h4>
              <div className="over-balls">
                {scoreState.thisOver.length > 0 ? (
                  scoreState.thisOver.map((ball, idx) => (
                    <span key={idx} className={`over-ball ball-${ball}`}>{ball}</span>
                  ))
                ) : (
                  <span className="over-empty">—</span>
                )}
              </div>
            </div>

            <div className="extras-options">
              <label>
                <input type="checkbox" /> <span>Wide</span>
              </label>
              <label>
                <input type="checkbox" /> <span>No Ball</span>
              </label>
              <label>
                <input type="checkbox" /> <span>Byes</span>
              </label>
              <label>
                <input type="checkbox" /> <span>Leg Byes</span>
              </label>
              <label>
                <input type="checkbox" /> <span>Wicket</span>
              </label>
            </div>

            <div className="action-buttons">
              <button type="button" className="btn btn-action retire-btn" onClick={handleRetire}>
                Retire
              </button>
              <button type="button" className="btn btn-action swap-btn" onClick={handleSwapBatsman}>
                Swap Batsman
              </button>
            </div>

            <div className="undo-extras">
              <button type="button" className="btn btn-undo" onClick={handleUndo}>
                Undo
              </button>
              <div></div>
            </div>

            <div className="runs-grid">
              {[0, 1, 2, 3, 4, 5, 6].map((run) => (
                <button
                  key={run}
                  type="button"
                  className="run-btn"
                  onClick={() => addRuns(run)}
                >
                  {run}
                </button>
              ))}
              <button type="button" className="run-btn dots-btn" onClick={() => {}}>
                ...
              </button>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
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
