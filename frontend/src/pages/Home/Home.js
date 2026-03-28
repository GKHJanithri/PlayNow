import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import teamImage from '../../assets/Team.jpg';
import facilityImage from '../../assets/facility.jpg';
import equipmentImage from '../../assets/equipment.jpg';
import eventImage from '../../assets/Event.jpg';
import brandLogo from '../../assets/Logo.jpeg';
import homeBackgroundVideo from '../../assets/Home background.mp4';
import { getNotifications } from '../../utils/notifications';

const quickActions = [
	{
		id: 'team-enrollment',
		icon: 'fa-users',
		title: 'Team Enrollment',
		description: 'Find a team or register as a free agent',
		image: teamImage,
	},
	{
		id: 'facility-booking',
		icon: 'fa-building',
		title: 'Facility Booking',
		description: 'Reserve courts, grounds and swimming pool',
		image: facilityImage,
	},
	{
		id: 'equipment-reservation',
		icon: 'fa-cube',
		title: 'Equipment Reservation',
		description: 'Borrow gear for your next practice',
		image: equipmentImage,
	},
	{
		id: 'events-tournaments',
		icon: 'fa-trophy',
		title: 'Events & Tournaments',
		description: 'View fixtures and match results',
		image: eventImage,
	},
];

const roles = [
	{
		icon: 'fa-user-gear',
		title: 'Admin',
		description: 'Manage equipment, system settings, users, and overall platform operations.',
	},
	{
		icon: 'fa-user-graduate',
		title: 'Student',
		description: 'Reserve items, view tournaments, and join teams for activities and events.',
	},
	{
		icon: 'fa-chalkboard-user',
		title: 'Coach',
		description: 'Manage teams, approve players, and keep practice schedules up to date.',
	},
];

const Home = () => {
	const [notifications, setNotifications] = useState([]);

	useEffect(() => {
		setNotifications(getNotifications());
	}, []);

	return (
		<div className="home-page" id="top">
			<header className="home-header">
				<div className="home-header-inner">
					<div className="home-brand">
						<span className="home-brand-mark" aria-hidden="true">
							<img src={brandLogo} alt="" className="home-brand-logo" />
						</span>
						<span>PlayNow</span>
					</div>

					<nav className="home-nav" aria-label="Main navigation">
						<Link to="/" className="home-nav-link home-nav-link-active">Home</Link>
						<Link to="/login" className="home-nav-link">Event</Link>
						<Link to="/login" className="home-nav-link">Facility</Link>
						<Link to="/login" className="home-nav-link">Teams</Link>
						<Link to="/login" className="home-nav-link">Items</Link>
					</nav>

					<div className="home-auth-actions">
						<a href="#notifications-title" className="home-notification-link" aria-label="Notifications">
							<i className="fa-solid fa-bell" aria-hidden="true" />
						</a>
						<Link to="/login" className="home-login-link">
							Login
						</Link>
						<Link to="/signup" className="home-signup-link">
							Sign Up
						</Link>
					</div>
				</div>
			</header>

			<section className="home-hero" aria-labelledby="hero-title">
				<video className="home-hero-video-bg" autoPlay muted loop playsInline preload="metadata">
					<source src={homeBackgroundVideo} type="video/mp4" />
				</video>
				<div className="home-hero-content">
					<p className="hero-chip">All-in-one Sports Operations Platform</p>
					<h1 id="hero-title">Manage Your Sports Activities Easily</h1>
					<p>
						Streamline sports events, equipment tracking, reservations, and team coordination with a
						modern platform built for admins, students, and coaches.
					</p>
					<div className="hero-actions">
						<Link to="/signup" className="hero-cta">
							Get Started
						</Link>
						<a href="#features" className="hero-link">
							Explore Features
						</a>
					</div>
				</div>
			</section>

			<section id="features" className="home-section" aria-labelledby="features-title">
				<div className="section-heading">
					<h2 id="features-title">Core Features</h2>
					<p>Designed to simplify sports management for everyone involved.</p>
				</div>
				<div className="quick-actions-grid">
					{quickActions.map((action) => (
						<article key={action.id} id={action.id} className="quick-action-card">
							<div className="quick-action-media">
								<img src={action.image} alt={action.title} loading="lazy" />
								<span className="quick-action-badge" aria-hidden="true">
									<i className={`fa-solid ${action.icon}`} />
								</span>
							</div>
							<div className="quick-action-content">
								<h3>{action.title}</h3>
								<p>{action.description}</p>
							</div>
						</article>
					))}
				</div>
			</section>

			<section className="home-section" aria-labelledby="roles-title">
				<div className="section-heading">
					<h2 id="roles-title">User Roles</h2>
					<p>Each role gets tailored tools to support sports operations more effectively.</p>
				</div>
				<div className="roles-grid">
					{roles.map((role) => (
						<article key={role.title} className="role-card">
							<div className="card-icon" aria-hidden="true">
								<i className={`fa-solid ${role.icon}`} />
							</div>
							<h3>{role.title}</h3>
							<p>{role.description}</p>
						</article>
					))}
				</div>
			</section>

			<section className="home-section" aria-labelledby="notifications-title">
				<div className="section-heading">
					<h2 id="notifications-title">Notifications</h2>
					<p>Stay informed with actionable alerts and timely updates.</p>
				</div>
				<div className="notification-list" role="list">
					{notifications.length === 0 && (
						<article className="notification-item" role="listitem">
							<div className="card-icon" aria-hidden="true">
								<i className="fa-solid fa-bell" />
							</div>
							<div>
								<h3>No notifications yet</h3>
								<p>New updates from Admin and Coach actions will appear here.</p>
							</div>
						</article>
					)}
					{notifications.map((notification) => (
						<article key={notification.id} className="notification-item" role="listitem">
							<div className="card-icon" aria-hidden="true">
								<i className={`fa-solid ${notification.icon}`} />
							</div>
							<div>
								<h3>{notification.title}</h3>
								<p>{notification.message}</p>
							</div>
						</article>
					))}
				</div>
			</section>

			<footer className="home-footer" aria-labelledby="footer-title">
				<div className="home-footer-grid">
					<div className="footer-block footer-brand-block">
						<div className="home-brand footer-brand">
							<span className="home-brand-mark" aria-hidden="true">
								<img src={brandLogo} alt="" className="home-brand-logo" />
							</span>
							<h3 id="footer-title">Sports Management Web System</h3>
						</div>
						<p>
							A unified platform to manage equipment, events, reservations, and teams with speed
							and clarity.
						</p>
						<div className="footer-social" aria-label="Social links">
							<a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
								<i className="fa-brands fa-facebook-f" aria-hidden="true" />
							</a>
							<a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
								<i className="fa-brands fa-instagram" aria-hidden="true" />
							</a>
							<a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
								<i className="fa-brands fa-x-twitter" aria-hidden="true" />
							</a>
						</div>
					</div>

					<div className="footer-block footer-quick-links-block">
						<h4>Quick Links</h4>
						<ul>
							<li>
								<a href="#top">Home</a>
							</li>
							<li>
								<a href="#features">Features</a>
							</li>
							<li>
								<a href="#roles-title">User Roles</a>
							</li>
							
							<li>
								<Link to="/about">About Us</Link>
							</li>
						</ul>
					</div>

					<div className="footer-block footer-main-modules-block">
						<h4>Main Modules</h4>
						<ul>
							<li>Item Management</li>
							<li>Event Management</li>
							<li>Facility Management</li>
							<li>Team Management</li>
						</ul>
					</div>

					<div className="footer-block">
						<h4>Contact</h4>
						<ul>
							<li>
								<i className="fa-solid fa-envelope" aria-hidden="true" />PlayNow@gmail.com
							</li>
							<li>
								<i className="fa-solid fa-phone" aria-hidden="true" /> 011-754 4801
							</li>
							<li>
								<i className="fa-solid fa-location-dot" aria-hidden="true" />SLIIT Campus, Malabe
							</li>
						</ul>
					</div>
				</div>

				<div className="home-footer-bottom">
					<p>Sports Management Web System © {new Date().getFullYear()} All rights reserved.</p>
					<div className="footer-legal-links">
						<a href="/privacy-policy">Privacy</a>
						<a href="/terms-and-conditions">Terms</a>
						<a href="/support">Support</a>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Home;
