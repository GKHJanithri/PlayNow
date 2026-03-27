import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import PracticeList from '../components/PracticeList';

const CoachPracticePage = () => {
  const { id } = useParams();
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ dateTime: '', location: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/events/${id}/practice`);
        setSessions(data?.sessions || data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load practice sessions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.dateTime || !form.location.trim()) {
      setStatus('Date, time, and location are required.');
      return;
    }

    try {
      setSubmitting(true);
      setStatus('');
      const payload = {
        title: 'Practice Session',
        date: form.dateTime,
        location: form.location,
        notes: form.notes,
      };
      const { data } = await apiClient.post(`/events/${id}/practice`, payload);
      const createdSession = data?.session || { ...payload, _id: Date.now() };
      setSessions((prev) => [createdSession, ...prev]);
      setForm({ dateTime: '', location: '', notes: '' });
      setStatus('Practice session logged.');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to save practice session.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading practice sessions...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Coach Practice Planner</h1>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="dateTime">Practice Date & Time</label>
            <input
              id="dateTime"
              name="dateTime"
              type="datetime-local"
              value={form.dateTime}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Add Session'}
          </button>
        </div>
        {status && <div className="status-text">{status}</div>}
      </form>

      <PracticeList sessions={sessions} emptyLabel="No practice sessions logged yet." />
    </section>
  );
};

export default CoachPracticePage;
