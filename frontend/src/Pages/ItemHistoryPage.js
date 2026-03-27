import React, { useEffect, useMemo, useState } from "react";
import "../Utils/Style.css";

function ItemHistoryPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("Active");
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = useMemo(
    () =>
      process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/$/, "")
        : "http://localhost:5000",
    []
  );

  const toDisplayDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  };

  const getUiStatus = (reservation) => {
    const backendStatus = reservation.item_reservation_status;
    if (backendStatus === "Returned") return "Returned";

    const returnDate = new Date(
      reservation.item_reservation_return_date || reservation.item_reservation_return_time
    );
    if (!Number.isNaN(returnDate.getTime()) && returnDate < new Date()) return "Late";
    return "Active";
  };

  const mappedReservations = useMemo(
    () =>
      reservations.map((reservation) => ({
        id: reservation.item_reservation_id || reservation._id,
        item: reservation.item_id ? `Item #${reservation.item_id}` : "-",
        quantity: reservation.item_quantity_reserved ?? "-",
        borrowDate: toDisplayDate(
          reservation.item_reservation_date || reservation.item_reservation_time
        ),
        returnDate: toDisplayDate(
          reservation.item_reservation_return_date || reservation.item_reservation_return_time
        ),
        status: getUiStatus(reservation)
      })),
    [reservations]
  );

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`${apiBaseUrl}/reservations`);
      if (!response.ok) {
        if (response.status === 404) {
          setReservations([]);
          return;
        }
        throw new Error("Failed to load reservations.");
      }
      const data = await response.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError?.message || "Could not load reservations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReservations = useMemo(() => {
    if (activeTab === "Active") {
      return mappedReservations.filter((item) => item.status === "Active");
    }
    if (activeTab === "Returned") {
      return mappedReservations.filter((item) => item.status === "Returned");
    }
    return mappedReservations.filter((item) => item.status === "Late");
  }, [activeTab, mappedReservations]);

  const handleReturn = async (reservationId) => {
    try {
      setError("");
      const response = await fetch(`${apiBaseUrl}/items/${reservationId}/returnItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_reservation_id: reservationId })
      });

      if (!response.ok) {
        throw new Error("Failed to return item.");
      }
      await fetchReservations();
    } catch (returnError) {
      setError(returnError?.message || "Could not return item.");
    }
  };

  return (
    <main className="main-item-page">
      <section className="history-layout">
        <header className="history-header">
          <h1>My Equipment Reservations</h1>
          <p>Track your borrowed equipment and return dates.</p>
        </header>

        <article className="history-card">
          <div className="history-top">
            <div className="history-tabs">
              <button
                className={`tab-btn ${activeTab === "Active" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("Active")}
              >
                Active
              </button>
              <button
                className={`tab-btn ${activeTab === "Late" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("Late")}
              >
                Late
              </button>
              <button
                className={`tab-btn ${activeTab === "Returned" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("Returned")}
              >
                Returned
              </button>
            </div>

            <button className="confirm-btn" onClick={onBack}>
              Back to Equipment
            </button>
          </div>
          {error && <p className="admin-error">{error}</p>}

          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ITEM</th>
                  <th>QTY</th>
                  <th>BORROW DATE</th>
                  <th>RETURN DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Loading reservations...
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{reservation.id}</td>
                      <td>{reservation.item}</td>
                      <td>{reservation.quantity}</td>
                      <td>{reservation.borrowDate}</td>
                      <td>{reservation.returnDate}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            reservation.status === "Active" ? "status-active" : "status-returned"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td>
                        {reservation.status === "Active" ? (
                          <button
                            className="return-btn"
                            onClick={() => handleReturn(reservation.id)}
                          >
                            Return
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}

export default ItemHistoryPage;
