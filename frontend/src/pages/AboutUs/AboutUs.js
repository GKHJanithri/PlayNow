import React from 'react';
import './AboutUs.css';

const highlights = [
	{
		icon: 'fa-bolt',
		title: 'Faster Operations',
		text: 'Automate event setup, scheduling, and communication so teams spend less time on paperwork.',
	},
	{
		icon: 'fa-shield-halved',
		title: 'Reliable Records',
		text: 'Maintain accurate match results, attendance, and equipment history in one trusted place.',
	},
	{
		icon: 'fa-people-group',
		title: 'Better Collaboration',
		text: 'Connect admins, coaches, and students through a shared platform for planning and updates.',
	},
];

const AboutUs = () => {
	return (
		<section className="about-page page" aria-labelledby="about-title">
			<header className="about-hero">
				<p className="about-chip">About Our Platform</p>
				<h1 id="about-title">University Sports Management System</h1>
				<p>
					Our system is built to simplify how university sports are organized, tracked, and delivered.
					From event planning to team coordination, we provide one centralized platform that keeps
					every stakeholder aligned.
				</p>
			</header>

			<div className="about-grid">
				<article className="about-card" aria-labelledby="mission-title">
					<h2 id="mission-title">Mission</h2>
					<p>
						To empower university sports communities with a smart, reliable, and inclusive digital
						system that streamlines event management, supports fair participation, and improves the
						student-athlete experience.
					</p>
				</article>

				<article className="about-card" aria-labelledby="vision-title">
					<h2 id="vision-title">Vision</h2>
					<p>
						To become the leading campus sports operations platform by enabling data-driven decisions,
						transparent workflows, and a connected ecosystem where every match, practice, and
						achievement is managed with excellence.
					</p>
				</article>
			</div>

			<section className="about-highlights" aria-labelledby="highlights-title">
				<h2 id="highlights-title">Why This System Matters</h2>
				<div className="about-highlight-grid">
					{highlights.map((item) => (
						<article key={item.title} className="about-highlight-card">
							<span className="about-highlight-icon" aria-hidden="true">
								<i className={`fa-solid ${item.icon}`} />
							</span>
							<h3>{item.title}</h3>
							<p>{item.text}</p>
						</article>
					))}
				</div>
			</section>
		</section>
	);
};

export default AboutUs;
