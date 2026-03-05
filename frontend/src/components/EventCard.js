import React from 'react';
import { Link } from 'react-router-dom';

const formatDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventCard = ({ event }) => {
  const { title, sportType, startDate, venue } = event;
  const eventId = event._id || event.id;
  const detailsPath = eventId ? `/events/${eventId}` : '/events';

  return (
    <article className="event-card">
      <div className="tag">{sportType || 'TBD Sport'}</div>
      <h3>{title}</h3>
      <div className="card-meta">
        <span>Starts: {formatDate(startDate)}</span>
        <span>Venue: {venue || 'To be announced'}</span>
      </div>
      <Link to={detailsPath} style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
        <button className="btn btn-primary">View Details</button>
      </Link>
    </article>
  );
};

export default EventCard;
