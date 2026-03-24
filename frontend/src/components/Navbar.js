import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../utils/auth';
import brandLogo from '../assets/Logo.jpeg';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'Guest';
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const isAdmin = role === 'Admin';

  const navLinks = [
    { path: '/events', label: 'Events', roles: ['Guest', 'Coach', 'Athlete'] },
    { path: '/about', label: 'About Us', roles: ['Guest', 'Coach', 'Athlete'] },
    { path: '/login', label: 'Login', roles: ['Guest'] },
    { path: '/signup', label: 'Sign Up', roles: ['Guest'] },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/', { replace: true });
  };

  return (
    <header className={`navbar${isAdmin ? ' admin-navbar' : ''}`}>
      <div className="navbar-inner">
        <div className="brand">
          <img src={brandLogo} alt="PlayNow logo" className="brand-logo" />
          <span>PlayNow</span>
        </div>
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
        </nav>
        <div className="navbar-right">
          {isAuthenticated && (
            <button type="button" className="nav-notification" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 3a5 5 0 0 0-5 5v2.1c0 .8-.3 1.5-.8 2.1l-1.3 1.4c-.6.7-.2 1.8.8 1.8h12.6c1 0 1.4-1.1.8-1.8L17.8 12c-.5-.6-.8-1.4-.8-2.1V8a5 5 0 0 0-5-5zm0 18a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 21z" />
              </svg>
              <span className="nav-notification-dot" aria-hidden="true" />
            </button>
          )}
          <div className={`tag role-pill${isAdmin ? ' role-pill-admin' : ''}`}>
            {role}
          </div>
          {isAuthenticated && (
            <button type="button" className="nav-action" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
