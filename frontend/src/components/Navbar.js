import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'Guest';
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  const navLinks = [
    { path: '/events', label: 'Events', roles: ['Guest', 'Admin', 'Coach', 'Athlete'] },
    { path: '/admin/dashboard', label: 'Dashboard', roles: ['Admin'] },
    { path: '/admin/events/create', label: 'Create Event', roles: ['Admin'] },
    { path: '/login', label: 'Login', roles: ['Guest'] },
    { path: '/signup', label: 'Sign Up', roles: ['Guest'] },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">PlayNow Sports</div>
        <nav className="nav-links">
          {navLinks
            .filter((link) => link.roles.includes(role))
            .map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          {isAuthenticated && (
            <button type="button" className="nav-action" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
        <div className="tag" style={{ background: '#ecfdf5', color: '#047857' }}>
          {role}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
