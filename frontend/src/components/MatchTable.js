import React from 'react';

const formatDateTime = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const asDateInputValue = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 16);
};

const MatchTable = ({
  matches = [],
  editableSchedule = false,
  editableVenue = false,
  editableScores = false,
  showScores = false,
  showWinner = false,
  onChangeMatch = () => {},
  emptyLabel = 'No matches scheduled',
}) => {
  const columnCount = 4 + (showScores ? 2 : 0) + (showWinner ? 1 : 0);

  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Team A</th>
            <th>Team B</th>
            <th>Date & Time</th>
            <th>Venue</th>
            {showScores && (
              <>
                <th>Score A</th>
                <th>Score B</th>
              </>
            )}
            {showWinner && <th>Winner</th>}
          </tr>
        </thead>
        <tbody>
          {matches.length === 0 && (
            <tr>
              <td colSpan={columnCount} style={{ textAlign: 'center', padding: '1.5rem' }}>
                {emptyLabel}
              </td>
            </tr>
          )}
          {matches.map((match, index) => {
            const matchId = match._id || match.id;
            const safeId = matchId ?? index;
            return (
              <tr key={matchId || `${match.teamA}-${match.teamB}-${index}`}>
                <td>{match.teamA}</td>
                <td>{match.teamB}</td>
                <td>
                  {editableSchedule ? (
                    <input
                      type="datetime-local"
                      className="inline-input"
                      value={asDateInputValue(match.schedule)}
                      onChange={(event) => onChangeMatch(safeId, 'schedule', event.target.value)}
                    />
                  ) : (
                    formatDateTime(match.schedule)
                  )}
                </td>
                <td>
                  {editableVenue ? (
                    <input
                      type="text"
                      value={match.venue || ''}
                      onChange={(event) => onChangeMatch(safeId, 'venue', event.target.value)}
                    />
                  ) : (
                    match.venue || 'TBD'
                  )}
                </td>
                {showScores && (
                  <>
                    <td>
                      {editableScores ? (
                        <input
                          type="number"
                          min="0"
                          value={Number.isFinite(match.scoreA) ? match.scoreA : ''}
                          onChange={(event) => {
                            const { value } = event.target;
                            onChangeMatch(safeId, 'scoreA', value === '' ? '' : Number(value));
                          }}
                        />
                      ) : (
                        match.scoreA ?? '-'
                      )}
                    </td>
                    <td>
                      {editableScores ? (
                        <input
                          type="number"
                          min="0"
                          value={Number.isFinite(match.scoreB) ? match.scoreB : ''}
                          onChange={(event) => {
                            const { value } = event.target;
                            onChangeMatch(safeId, 'scoreB', value === '' ? '' : Number(value));
                          }}
                        />
                      ) : (
                        match.scoreB ?? '-'
                      )}
                    </td>
                  </>
                )}
                {showWinner && <td>{match.winner || '-'}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTable;
