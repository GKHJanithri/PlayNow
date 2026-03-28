import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import eventImage from '../../assets/Event.jpg';
import facilityImage from '../../assets/facility.jpg';
import itemsImage from '../../assets/equipment.jpg';
import teamsImage from '../../assets/Team.jpg';
import './AdminDashboardPage.css';

const adminModules = [
  {
    key: 'event',
    title: 'Event',
    description: 'Create and manage sports events, fixtures, and results.',
    route: '/admin/events/create',
    cta: 'Open Event',
    image: eventImage,
    imageAlt: 'Team huddle before training',
    badge: 'E',
  },
  {
    key: 'facility',
    title: 'Facility',
    description: 'Manage courts, grounds, schedules, and facility allocations.',
    route: '/admin/facilities',
    cta: 'Open Facility',
    image: facilityImage,
    imageAlt: 'Indoor sports facility',
    badge: 'F',
  },
  {
    key: 'items',
    title: 'Items',
    description: 'Track equipment inventory, issue items, and monitor stock levels.',
    route: '/admin/items',
    cta: 'Open Items',
    image: itemsImage,
    imageAlt: 'Sports equipment inventory',
    badge: 'I',
  },
  {
    key: 'teams',
    title: 'Teams',
    description: 'View team records, roster status, and participation details.',
    route: '/admin/teams',
    cta: 'Open Teams',
    image: teamsImage,
    imageAlt: 'Teams playing in a stadium',
    badge: 'T',
  },
];

const AdminDashboardPage = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <section className="page admin-dashboard-page">
          <div className="page-header admin-dashboard-header">
            <div>
              <p className="admin-dashboard-eyebrow">Control Center</p>
              <h1 className="page-title">Welcome to the Admin Dashboard</h1>
              <p className="admin-dashboard-subtitle">
                Manage events, facilities, inventory, and team operations from one place.
              </p>
            </div>
          </div>

          <div className="admin-module-grid" aria-label="Admin modules">
            {adminModules.map((module) => (
              <article key={module.key} className={`admin-module-card module-${module.key}`}>
                <div className="admin-module-media">
                  <img src={module.image} alt={module.imageAlt} className="admin-module-image" />
                  <span className="admin-module-badge" aria-hidden="true">
                    {module.badge}
                  </span>
                </div>
                <div className="admin-module-content">
                  <span className="admin-module-chip">{module.title}</span>
                  <h3>{module.title} Management</h3>
                  <p>{module.description}</p>
                  <Link to={module.route} className="btn btn-secondary">
                    {module.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
