import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import MatchTable from '../components/MatchTable';

const AdminManageFixturesPage = () => {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/events/${id}/fixtures`);
        setMatches(data?.fixtures || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load fixtures.');
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, [id]);

  const handleGenerate = async () => {
    try {
      setFeedback('');
      const { data } = await apiClient.post(`/events/${id}/fixtures/generate`);
      setMatches(data?.fixtures || []);
      setFeedback('Fixtures generated successfully.');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not generate fixtures.');
    }
  };

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
      setFeedback('');
      await apiClient.put(`/events/${id}/fixtures`, { fixtures: matches });
      setFeedback('Schedule saved successfully.');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to save schedule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading fixtures...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Manage Fixtures</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={handleGenerate}>
            Generate Fixtures
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <MatchTable
        matches={matches}
        editableSchedule
        editableVenue
        onChangeMatch={handleChangeMatch}
        emptyLabel="No fixtures yet. Generate to get started."
      />

      {feedback && <div className="status-text">{feedback}</div>}
    </section>
  );
};

export default AdminManageFixturesPage;
