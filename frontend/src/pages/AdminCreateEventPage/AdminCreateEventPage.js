import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { addNotification } from '../../utils/notifications';
import './AdminCreateEventPage.css';

const sportOptions = ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Cricket', 'Badminton', 'Netball','Swimming'];
const tournamentOptions = ['Knockout', 'RoundRobin'];

const toLocalDateTimeInput = (date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const AdminCreateEventPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    sportType: 'Cricket',
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
      } catch {
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
    if (form.startDate) {
      const selectedTime = new Date(form.startDate).getTime();
      if (!Number.isNaN(selectedTime) && selectedTime < Date.now()) {
        nextErrors.startDate = 'Start date cannot be in the past.';
      }
    }
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
      const { data } = await apiClient.post('/events', {
        ...form,
        teams: selectedTeams,
      });
      const createdEventId = data?._id || data?.id || data?.event?._id || data?.event?.id;
      addNotification({
        title: 'New Event Created',
        message: `${form.title} (${form.sportType}) was created for ${form.startDate || 'a scheduled date'}.`,
        icon: 'fa-calendar-check',
        role: 'Admin',
        audienceRoles: ['Admin', 'Coach', 'Student', 'User'],
      });
      setStatus('Event created successfully. Redirecting to fixtures...');
      setTimeout(() => {
        if (createdEventId) {
          navigate(`/admin/events/${createdEventId}/manage`);
          return;
        }
        navigate('/events');
      }, 800);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="ace-page">
      <div className="ace-header">
        <div>
          <p className="ace-eyebrow">Event Control Center</p>
          <h1 className="ace-title">Create Event</h1>
          <p className="ace-subtitle">Plan fixtures faster with structured event details and instant team assignment.</p>
        </div>
        <div className="ace-header-meta" aria-live="polite">
          <span>{selectedTeams.length} team{selectedTeams.length === 1 ? '' : 's'} selected</span>
        </div>
      </div>
      <form className="ace-panel" onSubmit={handleSubmit}>
        <section className="ace-section" aria-labelledby="ace-event-details-title">
          <div className="ace-section-head">
            <h2 id="ace-event-details-title">Event Details</h2>
          </div>

          <div className="ace-grid">
            <div className="ace-field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                placeholder="Interfaculty Cricket Championship"
                value={form.title}
                onChange={handleChange}
              />
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
              <input
                id="venue"
                name="venue"
                placeholder="Main Ground A"
                value={form.venue}
                onChange={handleChange}
              />
              {errors.venue && <span className="ace-error">{errors.venue}</span>}
            </div>

            <div className="ace-field">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                min={toLocalDateTimeInput(new Date())}
                value={form.startDate}
                onChange={handleChange}
              />
              {errors.startDate && <span className="ace-error">{errors.startDate}</span>}
            </div>
          </div>
        </section>

        <section className="ace-section ace-field ace-teams-wrap" aria-labelledby="ace-teams-title">
          <div className="ace-section-head">
            <h2 id="ace-teams-title">Registered Teams</h2>
            <span>Select at least 2 teams</span>
          </div>
          

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
        </section>

        <div className="ace-actions">
          <button 
            type="button" 
            className="ace-secondary" 
            onClick={() => navigate('/events')}
          >
            View Upcoming Events
          </button>
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
