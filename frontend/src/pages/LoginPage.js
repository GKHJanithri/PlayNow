import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const from = location.state?.from || '/events';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      const session = loginUser(form);
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
    <section className="page auth-page">
      <div className="auth-card">
        <h1 className="page-title">Login</h1>
        <p className="session-meta">Use your credentials to continue.</p>

        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          </div>

          {error && <div className="field-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
        </form>

        <p className="session-meta" style={{ marginTop: '1rem' }}>
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
