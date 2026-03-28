import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { getSportMeta } from './facilityData';
import './FacilityBooking.css';

const normalizeFacility = (facility) => ({
  id: facility._id,
  facilityName: facility.facilityName,
  sportType: facility.sportType,
  location: facility.location || 'University Sports Complex',
  maxPlayers: Number(facility.maxPlayers) || 0,
  availability: Boolean(facility.availability),
});

const preferredSportsOrder = [
  'Cricket',
  'Volleyball',
  'Netball',
  'Basketball',
  'Badminton',
  'Tennis',
  'Football',
  'Swimming Pool',
];

const FacilitiesPage = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    const loadFacilities = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiClient.get('/facilities');
        const data = Array.isArray(response.data) ? response.data.map(normalizeFacility) : [];
        setFacilities(data);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Could not load facilities.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, []);

  const sports = useMemo(() => {
    const uniqueSports = Array.from(new Set(facilities.map((facility) => facility.sportType)));
    const sorted = [
      ...preferredSportsOrder.filter((sport) => uniqueSports.includes(sport)),
      ...uniqueSports.filter((sport) => !preferredSportsOrder.includes(sport)).sort(),
    ];
    return ['All Sports', ...sorted];
  }, [facilities]);

  const visibleFacilities = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return facilities.filter((facility) => {
      const bySport = selectedSport === 'All Sports' || facility.sportType === selectedSport;
      const byAvailability = !availableOnly || facility.availability;
      const bySearch =
        !normalizedSearch ||
        facility.facilityName.toLowerCase().includes(normalizedSearch) ||
        facility.location.toLowerCase().includes(normalizedSearch) ||
        facility.sportType.toLowerCase().includes(normalizedSearch);

      return bySport && byAvailability && bySearch;
    });
  }, [facilities, selectedSport, availableOnly, searchTerm]);

  return (
    <div className="facility-ui-page">
      <header className="facility-ui-topbar">
        <button type="button" className="facility-ui-menu" aria-label="Open menu">
          <span />
          <span />
        </button>

        <div className="facility-ui-search-wrap">
          <span className="facility-ui-search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search facilities, bookings..."
            aria-label="Search facilities"
          />
        </div>

        <div className="facility-ui-actions" aria-hidden="true">
          <button type="button" className="facility-ui-icon-btn">🔔</button>
          <span className="facility-ui-notice-count">4</span>
          <button type="button" className="facility-ui-icon-btn">◌</button>
        </div>
      </header>

      <div className="facility-ui-content">
        <section className="facility-ui-headline">
          <h1>Facilities</h1>
          <p>Browse and book university sports facilities</p>
        </section>

        <section className="facility-ui-filters" aria-label="Sports filters">
          <div className="facility-ui-sport-tabs">
            {sports.map((sport) => {
              const meta = getSportMeta(sport);
              const activeClass = selectedSport === sport ? ' is-active' : '';

              return (
                <button
                  key={sport}
                  type="button"
                  className={`facility-ui-chip${activeClass}`}
                  onClick={() => setSelectedSport(sport)}
                >
                  {sport !== 'All Sports' && <span aria-hidden="true">{meta.icon}</span>}
                  {sport}
                </button>
              );
            })}
          </div>

          <label className="facility-ui-switch-row" htmlFor="availableOnly">
            <input
              id="availableOnly"
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
            />
            <span className="facility-ui-switch" aria-hidden="true" />
            <span>Available Only</span>
          </label>
        </section>

        {error && <div className="facility-ui-error">{error}</div>}
        {isLoading && <div className="facility-ui-message">Loading facilities...</div>}

        {!isLoading && !visibleFacilities.length && (
          <div className="facility-ui-message">No facilities found for the selected filters.</div>
        )}

        {!isLoading && visibleFacilities.length > 0 && (
          <section className="facility-ui-grid">
            {visibleFacilities.map((facility) => {
              const meta = getSportMeta(facility.sportType);
              const unavailableClass = !facility.availability ? ' is-unavailable' : '';

              return (
                <article key={facility.id} className={`facility-ui-card${unavailableClass}`}>
                  <div className="facility-ui-image-wrap">
                    <img src={meta.image} alt={facility.facilityName} loading="lazy" />
                    <div className="facility-ui-chip-floating">
                      <span aria-hidden="true">{meta.icon}</span>
                      {facility.sportType}
                    </div>
                    {!facility.availability && <div className="facility-ui-overlay-tag">Unavailable</div>}
                  </div>

                  <div className="facility-ui-card-body">
                    <h3>{facility.facilityName}</h3>
                    <div className="facility-ui-meta">
                      <span>📍 {facility.location}</span>
                      <span>👥 {facility.maxPlayers} players</span>
                    </div>

                    <button
                      type="button"
                      className="facility-ui-book-btn"
                      onClick={() => navigate(`/facilities/${facility.id}/book`)}
                      disabled={!facility.availability}
                    >
                      {facility.availability ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

export default FacilitiesPage;
