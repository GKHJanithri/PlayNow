import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentItemsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [availabilityFilter, setAvailabilityFilter] = useState('All Availability');
  const [conditionFilter, setConditionFilter] = useState('All Conditions');

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch('http://localhost:5000/items');

        if (!response.ok) {
          if (response.status === 404) {
            setItems([]);
            return;
          }
          throw new Error('Failed to load items from database');
        }

        const data = await response.json();
        const mappedItems = (Array.isArray(data) ? data : []).map((item) => ({
          ...item, // include all original properties, especially _id
          id: item._id || item.item_id || item.item_name,
          name: item.item_name || 'Unnamed Item',
          sport: item.item_category || 'General',
          available: Number(item.item_quantity_available ?? 0),
          total: Number(item.item_quantity_total ?? 0),
          image: item.item_image || '/images/Netball.png',
          condition: item.item_condition || 'Good',
        }));

        setItems(mappedItems);
      } catch (error) {
        setItems([]);
        setLoadError(error.message || 'Could not fetch items.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const sportOptions = useMemo(
    () => ['All Sports', ...new Set(items.map((item) => item.sport))],
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const textMatch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const sportMatch = sportFilter === 'All Sports' || item.sport === sportFilter;

      const availabilityMatch =
        availabilityFilter === 'All Availability' ||
        (availabilityFilter === 'Available' && item.available > 0) ||
        (availabilityFilter === 'Out of Stock' && item.available === 0);

      const conditionMatch =
        conditionFilter === 'All Conditions' || item.condition === conditionFilter;

      return textMatch && sportMatch && availabilityMatch && conditionMatch;
    });
  }, [items, searchText, sportFilter, availabilityFilter, conditionFilter]);

  const getConditionClass = (condition) => {
    if (condition.toLowerCase() === 'good') return 'good';
    if (condition.toLowerCase() === 'fair') return 'fair';
    return 'needs-repair';
  };

  // Find the original item object by id to ensure _id is included
  const handleReserveClick = (item) => {
    if (item.available > 0) {
      const original = items.find(i => i.id === item.id) || item;
      // If you have the original data array from the backend, use that instead of mapped items
      navigate('/student/items/reserve', { state: { item: original } });
    }
  };

  return (
    <main className="main-item-page">
      <section className="equipment-layout">
        <header className="page-header">
          <button   
            type="button"
            className="back-btn"
            onClick={() => navigate('/student/dashboard')}
            aria-label="Back to student dashboard"
          >
            ← Back to Dashboard
          </button>
          <p className="breadcrumb">Sports Items &gt; Equipment</p>
          <h1>Equipment Reservation</h1>
        </header>

        <div className="filters">
          <input
            className="filter-input"
            type="text"
            placeholder="Search equipment..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <select
            className="filter-select"
            value={sportFilter}
            onChange={(event) => setSportFilter(event.target.value)}
          >
            {sportOptions.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
          >
            <option>All Availability</option>
            <option>Available</option>
            <option>Out of Stock</option>
          </select>

          <select
            className="filter-select"
            value={conditionFilter}
            onChange={(event) => setConditionFilter(event.target.value)}
          >
            <option>All Conditions</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Needs Repair</option>
          </select>
        </div>

        {isLoading && <p>Loading items...</p>}
        {!isLoading && loadError && <p>{loadError}</p>}
        {!isLoading && !loadError && filteredItems.length > 0 && (
          <div className="item-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="equipment-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="equipment-image"
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <div className="equipment-header">
                  <h3>{item.name}</h3>
                  <span className="sport-tag">{item.sport}</span>
                </div>
                <div className="availability-row">
                  <span>Available:</span>
                  <strong>
                    {item.available} / {item.total}
                  </strong>
                </div>
                <div className="availability-track">
                  <span
                    className="availability-fill"
                    style={{
                      width: `${(item.available / item.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="condition-row">
                  <span>Condition:</span>
                  <span className={`condition-badge ${getConditionClass(item.condition)}`}>
                    {item.condition}
                  </span>
                </div>
                <button
                  className={`reserve-btn ${item.available === 0 ? 'disabled-btn' : ''}`}
                  disabled={item.available === 0}
                  onClick={() => handleReserveClick(item)}
                >
                  {item.available > 0 ? 'Reserve Item' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
        )}
        {!isLoading && !loadError && filteredItems.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9aa5be' }}>No items found matching your filters.</p>
        )}
      </section>
    </main>
  );
};

export default StudentItemsPage;
