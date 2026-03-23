import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../utils/auth';
import './Login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from || '/events';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      const session = await loginUser(form);
      if (session.role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      navigate(from, { replace: true });
    } catch (authError) {
      setError(authError.message || 'Login failed.');
    }
  };

  return (
    <section className="login-screen">
      <div className="login-shell">
        <aside className="login-hero">
          <div className="login-circle one" />
          <div className="login-circle two" />
          <div className="login-circle three" />

          <div className="login-hero-content">
            <div className="login-trophy" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" color="#f4b529">
                <path d="M8 21h8" />
                <path d="M12 17v4" />
                <path d="M7 5H4v2a4 4 0 004 4" />
                <path d="M17 5h3v2a4 4 0 01-4 4" />
                <path d="M8 3h8v4a4 4 0 01-8 0V3z" />
              </svg>
            </div>

            <h2 className="login-title">
              Elevate Your
              <span className="login-title-accent">Sports Journey</span>
            </h2>

            <p className="login-hero-text">
              The all-in-one platform for SLIIT students and coaches to manage teams, book facilities, and track events.
            </p>

            <div className="login-stats">
              <div className="login-stat">
                <strong>50+</strong>
                <span>Active Teams</span>
              </div>
              <div className="login-stat">
                <strong>12</strong>
                <span>Sports Facilities</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="login-form-panel">
          <div className="login-form-wrap">
            <div className="login-switch" role="tablist" aria-label="Authentication switch">
              <span className="active" role="tab" aria-selected="true">Log In</span>
              <Link to="/signup" role="tab" aria-selected="false">Sign Up</Link>
            </div>

            <h1>Welcome back</h1>
            <p className="subtitle">Enter your SLIIT credentials to access your dashboard.</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="email">SLIIT Email</label>
              <div className="login-input-shell">
                <span className="login-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 8l9 6 9-6" />
                  </svg>
                </span>
                <input
                  className="login-input"
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="it21000000@my.sliit.lk"
                />
              </div>

              <label htmlFor="password">Password</label>
              <div className="login-input-shell">
                <span className="login-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </svg>
                </span>
                <input
                  className="login-input"
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="login-row">
                <label className="remember-me" htmlFor="rememberMe">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-link">Forgot password?</button>
              </div>

              {error && <div className="login-message error">{error}</div>}

              <button type="submit" className="login-submit">Sign In</button>
            </form>

            <p className="login-terms">By continuing, you agree to SLIIT&apos;s Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
