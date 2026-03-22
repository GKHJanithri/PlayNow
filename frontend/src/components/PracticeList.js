import React from 'react';

const PracticeList = ({ sessions = [], emptyLabel = 'No practice sessions yet.' }) => (
  <div className="practice-list">
    {sessions.length === 0 && <div className="empty-state">{emptyLabel}</div>}
    {sessions.map((session) => {
      const sessionId = session._id || session.id;
      const date = session.date || session.schedule;
      const formattedDate = date
        ? new Date(date).toLocaleString()
        : 'To be confirmed';
      return (
        <article className="session-card" key={sessionId || date}>
          <h4>{session.title || 'Session'}</h4>
          <div className="session-meta">{formattedDate}</div>
          <p>{session.location || session.venue}</p>
          {session.notes && <small className="session-meta">Notes: {session.notes}</small>}
        </article>
      );
    })}
  </div>
);

export default PracticeList;
