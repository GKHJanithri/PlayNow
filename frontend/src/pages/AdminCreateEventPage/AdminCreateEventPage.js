import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { addNotification } from '../../utils/notifications';
import './AdminCreateEventPage.css';

const sportOptions = ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Cricket', 'Badminton', 'Netball','Swimming'];
const tournamentOptions = ['Knockout', 'RoundRobin'];

const AdminCreateEventPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    sportType: sportOptions[0],
    tournamentType: tournamentOptions[0],
    venue: '',
    startDate: '',
  });
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchRegisteredTeams = async () => {
      try {
        setTeamsLoading(true);
        setTeamsError('');
        const { data } = await apiClient.get('/teams');
        const teams = data?.teams || data || [];
        setRegisteredTeams(Array.isArray(teams) ? teams : []);
      } catch (error) {
        setRegisteredTeams([]);
        setTeamsError('No registered teams found. Team registration is managed in another module.');
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchRegisteredTeams();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTeamSelection = (teamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId],
    );
  };

  const validationErrors = useMemo(() => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (!form.venue.trim()) nextErrors.venue = 'Venue is required.';
    if (!form.startDate) nextErrors.startDate = 'Start date is required.';
    if (selectedTeams.length < 2) nextErrors.teams = 'Select at least two registered teams.';
    return nextErrors;
  }, [form, selectedTeams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setSubmitting(true);
      setStatus('');
      await apiClient.post('/events', {
        ...form,
        teams: selectedTeams,
      });
      addNotification({
        title: 'New Event Created',
        message: `${form.title} (${form.sportType}) was created for ${form.startDate || 'a scheduled date'}.`,
        icon: 'fa-calendar-check',
        role: 'Admin',
      });
      setStatus('Event created successfully. Redirecting...');
      setTimeout(() => navigate('/events'), 800);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="ace-page">
      <div className="ace-header">
        <h1 className="ace-title">Create Event</h1>
      </div>
      <form className="ace-panel" onSubmit={handleSubmit}>
        <div className="ace-grid">
          <div className="ace-field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} />
            {errors.title && <span className="ace-error">{errors.title}</span>}
          </div>

          <div className="ace-field">
            <label htmlFor="sportType">Sport Type</label>
            <select
              id="sportType"
              name="sportType"
              value={form.sportType}
              onChange={handleChange}
            >
              {sportOptions.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <div className="ace-field">
            <label htmlFor="tournamentType">Tournament Type</label>
            <select
              id="tournamentType"
              name="tournamentType"
              value={form.tournamentType}
              onChange={handleChange}
            >
              {tournamentOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="ace-field">
            <label htmlFor="venue">Venue</label>
            <input id="venue" name="venue" value={form.venue} onChange={handleChange} />
            {errors.venue && <span className="ace-error">{errors.venue}</span>}
          </div>

          <div className="ace-field">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={form.startDate}
              onChange={handleChange}
            />
            {errors.startDate && <span className="ace-error">{errors.startDate}</span>}
          </div>
        </div>

        <div className="ace-field ace-teams-wrap">
          <label>Registered Teams</label>
          <small className="ace-meta">
            Teams are managed in the Team Registration module.
          </small>

          {teamsLoading && <div className="ace-state">Loading registered teams...</div>}
          {!teamsLoading && teamsError && <div className="ace-state ace-state-error">{teamsError}</div>}

          {!teamsLoading && !teamsError && registeredTeams.length > 0 && (
            <div className="ace-team-list">
              {registeredTeams.map((team) => {
                const teamId = team._id || team.id;
                const teamName = team.name || team.teamName || 'Unnamed Team';
                const isChecked = selectedTeams.includes(teamId);

                return (
                  <label key={teamId} className="ace-team-option">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTeamSelection(teamId)}
                    />
                    <span>{teamName}</span>
                  </label>
                );
              })}
            </div>
          )}

          {!teamsLoading && !teamsError && registeredTeams.length === 0 && (
            <div className="ace-state">No teams available in the system yet.</div>
          )}

          {errors.teams && <span className="ace-error">{errors.teams}</span>}
        </div>

        <div className="ace-actions">
          <button type="submit" className="ace-submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Event'}
          </button>
        </div>
        {status && <div className="ace-status">{status}</div>}
      </form>
    </section>
  );
};

export default AdminCreateEventPage;
