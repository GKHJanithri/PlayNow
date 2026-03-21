import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../../utils/auth';
import './Signup.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    role: 'Student / Player',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!form.fullName.trim() || !form.studentId.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      signupUser(form);
      setStatus('Account created successfully. Please login.');
      setTimeout(() => navigate('/login'), 900);
    } catch (signupError) {
      setError(signupError.message || 'Signup failed.');
    }
  };

  return (
    <section className="signup-screen">
      <div className="signup-shell">
        <aside className="signup-hero">
          <div className="signup-circle one" />
          <div className="signup-circle two" />
          <div className="signup-circle three" />

          <div className="signup-hero-content">
            <div className="signup-trophy" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" color="#f4b529">
                <path d="M8 21h8" />
                <path d="M12 17v4" />
                <path d="M7 5H4v2a4 4 0 004 4" />
                <path d="M17 5h3v2a4 4 0 01-4 4" />
                <path d="M8 3h8v4a4 4 0 01-8 0V3z" />
              </svg>
            </div>

            <h2 className="signup-title">
              Elevate Your
              <span className="signup-title-accent">Sports Journey</span>
            </h2>

            <p className="signup-hero-text">
              The all-in-one platform for SLIIT students and coaches to manage teams, book facilities, and track events.
            </p>

            <div className="signup-stats">
              <div className="signup-stat">
                <strong>50+</strong>
                <span>Active Teams</span>
              </div>
              <div className="signup-stat">
                <strong>12</strong>
                <span>Sports Facilities</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="signup-form-panel">
          <div className="signup-form-wrap">
            <h1>Create an account</h1>
            <p className="subtitle">Join the SLIIT Sports community today.</p>

            <form className="signup-form" onSubmit={handleSubmit}>
              <label htmlFor="fullName">Full Name</label>
              <div className="signup-input-shell">
                <span className="signup-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20a7 7 0 0114 0" />
                  </svg>
                </span>
                <input
                  className="signup-input"
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>

              <label htmlFor="studentId">Student ID</label>
              <div className="signup-input-shell">
                <span className="signup-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M12 3l7 4v5c0 4.2-2.9 7.8-7 8.7-4.1-.9-7-4.5-7-8.7V7l7-4z" />
                    <path d="M9.5 12.4l1.6 1.6 3.4-3.4" />
                  </svg>
                </span>
                <input
                  className="signup-input"
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={form.studentId}
                  onChange={handleChange}
                  placeholder="IT21000000"
                />
              </div>

              <label htmlFor="role">Role</label>
              <select
                className="signup-select"
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option>Student / Player</option>
                <option>Coach</option>
              </select>

              <label htmlFor="email">SLIIT Email</label>
              <div className="signup-input-shell">
                <span className="signup-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 8l9 6 9-6" />
                  </svg>
                </span>
                <input
                  className="signup-input"
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="it21000000@my.sliit.lk"
                />
              </div>

              <label htmlFor="password">Password</label>
              <div className="signup-input-shell">
                <span className="signup-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </svg>
                </span>
                <input
                  className="signup-input"
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="signup-input-shell">
                <span className="signup-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </svg>
                </span>
                <input
                  className="signup-input"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="signup-message error">{error}</div>}
              {status && <div className="signup-message success">{status}</div>}

              <button type="submit" className="signup-submit">
                Create Account
              </button>
            </form>

            <p className="signup-login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
