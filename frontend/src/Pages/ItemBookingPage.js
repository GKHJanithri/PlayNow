import React, { useState } from "react";
import "../Utils/Style.css";

function ItemBookingPage({ selectedItem, onCancel, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!selectedItem) {
    return (
      <main className="main-item-page">
        <section className="booking-layout">
          <div className="booking-form-card">
            <p>No item selected.</p>
            <button className="confirm-btn" onClick={onCancel}>
              Back to Equipment
            </button>
          </div>
        </section>
      </main>
    );
  }

  const handleSubmit = async () => {
    if (!purpose || !borrowDate || !returnDate) {
      alert("Please fill all required fields.");
      return;
    }

    if (Number(quantity) < 1 || Number(quantity) > selectedItem.available) {
      alert(`Quantity must be between 1 and ${selectedItem.available}.`);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Get student ID from localStorage (assuming it's stored during login)
      const studentId = localStorage.getItem("userId") || "student-" + Date.now();

      const reservationData = {
        item_id: selectedItem.id,
        student_id: studentId,
        item_reservation_date: new Date(borrowDate).toISOString(),
        item_reservation_return_date: new Date(returnDate).toISOString(),
        item_quantity_reserved: Number(quantity),
        item_reservation_purpose: purpose,
      };

      const response = await fetch("http://localhost:5000/itemReservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        throw new Error("Failed to create reservation.");
      }

      const newReservation = {
        id: `RES-${String(Date.now()).slice(-3)}`,
        item: selectedItem.name,
        quantity: Number(quantity),
        borrowDate: new Date(borrowDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric"
        }),
        returnDate: new Date(returnDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric"
        }),
        status: "Active"
      };

      onConfirm(newReservation);
    } catch (submitError) {
      setError(submitError.message || "Could not create reservation.");
      setIsLoading(false);
    }
  };

  return (
    <main className="main-item-page">
      <section className="booking-layout">
        <article className="selected-item-card">
          <div className="selected-item-icon"></div>
          <div>
            <h2>{selectedItem.name}</h2>
            <p>Sport: {selectedItem.sport}</p>
            <strong>{selectedItem.available} items currently available</strong>
          </div>
        </article>

        <article className="booking-form-card">
          <div className="booking-form-grid">
            <div className="form-group">
              <label>Quantity Required</label>
              <input
                type="number"
                min="1"
                max={selectedItem.available}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
              <small>Max available: {selectedItem.available}</small>
            </div>

            <div className="form-group">
              <label>Purpose</label>
              <select value={purpose} onChange={(event) => setPurpose(event.target.value)}>
                <option value="">Select purpose...</option>
                <option value="Practice">Practice</option>
                <option value="Training">Training</option>
                <option value="Match">Match</option>
                <option value="Tournament">Tournament</option>
              </select>
            </div>

            <div className="form-group">
              <label>Borrow Date</label>
              <input
                type="date"
                value={borrowDate}
                onChange={(event) => setBorrowDate(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
              />
            </div>
          </div>

          <div className="booking-note">
            Equipment must be returned in the same condition it was borrowed. Late returns
            may result in borrowing privileges being suspended.
          </div>

          <div className="booking-actions">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating Reservation..." : "Confirm Reservation"}
            </button>
          </div>
          {error && <p className="admin-error">{error}</p>}
        </article>
      </section>
    </main>
  );
}

export default ItemBookingPage;
