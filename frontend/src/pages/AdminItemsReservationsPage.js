import React, { useEffect, useState } from 'react';
import '../styles.css';
import axios from 'axios'; // Uncomment and configure if using real API

const STATUS_COLORS = {
  Reserved: '#1a73e8',
  Returned: '#16a34a',
  Late: '#dc2626',
  Collected: '#f5a623',
};

const STATUS_OPTIONS = ['Reserved', 'Returned', 'Late', 'Collected'];

const AdminItemReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulated fetch - replace with real API call
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('http://localhost:5000/api/items/allReservations')
      .then(res => {
        console.log("DATA:", res.data); // Debug log
        setReservations(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to fetch reservations');
        setLoading(false);
      });
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setReservations((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, item_reservation_status: newStatus } : r
      )
    );
    axios.patch(`http://localhost:5000/api/items/allReservations/${id}`, { status: newStatus })
      .then(res => {
        // Optionally, show a success message or refetch data
        // setReservations((prev) => prev.map(r => r._id === id ? res.data : r));
      })
      .catch(() => {
        // Optionally, show an error message
      });
  };

  // Helper to get status (auto-detect late)
  const getStatus = (r) => {
    const today = new Date();
    const returnDate = new Date(r.item_reservation_return_date);
    if (r.item_reservation_status?.toLowerCase() === 'collected') return 'Collected';
    if (r.item_reservation_status?.toLowerCase() === 'returned') return 'Returned';
    if (returnDate < today) return 'Late';
    return 'Reserved';
  };

  const filteredReservations =
    filter === 'All'
      ? reservations
      : reservations.filter(
          (r) => getStatus(r).toLowerCase() === filter.toLowerCase()
        );

  return (
    <div className="main-item-page equipment-layout">
      <button
        className="back-btn"
        style={{ marginBottom: 18 }}
        onClick={() => window.history.back()}
      >
        ← Back
      </button>
      <div className="page-header">
        <h1>Manage Item Reservations</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label htmlFor="status-filter" style={{ fontWeight: 500 }}>Filter by Status:</label>
          <select
            id="status-filter"
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="All">All</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-card" style={{ marginTop: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Reserved Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Error: {error}</td></tr>
            ) : filteredReservations.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No reservations found.</td></tr>
            ) : (
              filteredReservations.map((r) => (
                <tr key={r._id}>
                  <td>{r.student_id}</td>
                  <td>{r.item_name}</td>
                  <td>{r.item_quantity_reserved}</td>
                  <td>{r.item_reservation_date ? new Date(r.item_reservation_date).toLocaleDateString() : ''}</td>
                  <td>{r.item_reservation_return_date ? new Date(r.item_reservation_return_date).toLocaleDateString() : ''}</td>
                  <td>
                    <span
                      style={{
                        background: STATUS_COLORS[getStatus(r)],
                        color: '#fff',
                        borderRadius: 8,
                        padding: '4px 12px',
                        fontWeight: 600,
                        fontSize: 13,
                        display: 'inline-block',
                      }}
                    >
                      {getStatus(r)}
                    </span>
                  </td>
                  <td>
                    <select
                      className="filter-select"
                      value={r.item_reservation_status || ''}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                      style={{ minWidth: 110 }}
                    >
                      <option value="" disabled>Select status</option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminItemReservationsPage;
