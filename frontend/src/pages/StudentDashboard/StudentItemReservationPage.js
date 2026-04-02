import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles.css';

const StudentItemReservationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedItem = location.state?.item;

  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  //  handleSubmit added properly
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const studentId = currentUser?._id;

      if (!studentId) {
        setError('User not logged in or missing ID');
        setIsLoading(false);
        return;
      }


      const itemId = selectedItem._id || selectedItem.item_id;
      if (!itemId) {
        setError('Item ID is missing. Cannot reserve.');
        setIsLoading(false);
        return;
      }
      const response = await fetch(
        `http://localhost:5000/items/${itemId}/reserveItem`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            item_id: itemId,
            item_quantity_reserved: Number(quantity),
            item_reservation_return_date: new Date(returnDate).toISOString(),
            item_reservation_purpose: purpose,
          }),
        }
      );

      if (!response.ok) {
        let msg = 'Failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) msg = errorData.message;
        } catch {}
        throw new Error(msg);
      }

      navigate('/student/dashboard');

    } catch (err) {
      setError(err.message || 'Reservation failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedItem) {
    return (
      <main className="main-item-page">
        <section className="booking-layout">
          <div className="booking-form-card">
            <p>No item selected.</p>
            <button className="confirm-btn" onClick={() => navigate('/student/items')}>
              Back to Equipment
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ONLY ONE RETURN
  return (
    <main className="main-item-page">
      <section className="equipment-layout">
        <header className="page-header">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate('/student/items')}
            aria-label="Back to items"
          >
            ← Back to Items
          </button>
          <p className="breadcrumb">Sports Items &gt; Reservation</p>
          <h1>Reserve Equipment</h1>
        </header>

        <section className="booking-layout">
          <article className="selected-item-card">
            {selectedItem.image ? (
              <img src={selectedItem.image} alt={selectedItem.name} className="selected-item-image" />
            ) : (
              <div className="selected-item-icon" aria-hidden="true" />
            )}
            <div>
              <h2>{selectedItem.name}</h2>
              <p>Sport: {selectedItem.sport}</p>
              <strong>{selectedItem.available} items currently available</strong>
            </div>
          </article>

          <article className="booking-form-card">
            <h2>Reserve Equipment</h2>
            <div className="booking-form-grid">
              <div className="form-group">
                <label htmlFor="quantity">Quantity Required</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedItem.available}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
                <small>Max available: {selectedItem.available}</small>
              </div>

              <div className="form-group">
                <label htmlFor="purpose">Purpose</label>
                <select id="purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)}>
                  <option value="">Select purpose...</option>
                  <option value="Practice">Practice</option>
                  <option value="Training">Training</option>
                  <option value="Match">Match</option>
                  <option value="Tournament">Tournament</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="borrowDate">Borrow Date</label>
                <input
                  id="borrowDate"
                  type="date"
                  value={borrowDate}
                  onChange={(event) => setBorrowDate(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="returnDate">Return Date</label>
                <input
                  id="returnDate"
                  type="date"
                  value={returnDate}
                  onChange={(event) => setReturnDate(event.target.value)}
                />
              </div>
            </div>

            <div className="booking-note">
              Equipment must be returned in the same condition it was borrowed. Late returns may result in
              borrowing privileges being suspended.
            </div>

            <div className="booking-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/student/items')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Reservation...' : 'Confirm Reservation'}
              </button>
            </div>
            {error && <p className="admin-error">{error}</p>}
          </article>
        </section>
      </section>
    </main>
  );
};

export default StudentItemReservationPage;