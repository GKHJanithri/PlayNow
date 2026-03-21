import React, { useMemo, useState } from "react";
import "../Utils/Style.css";

function ItemHistoryPage({ reservations, onBack, onReturn }) {
  const [activeTab, setActiveTab] = useState("Active");

  const filteredReservations = useMemo(() => {
    if (activeTab === "Active") {
      return reservations.filter((item) => item.status === "Active");
    }
    if (activeTab === "Returned") {
      return reservations.filter((item) => item.status === "Returned");
    }
    return reservations.filter((item) => item.status !== "Active");
  }, [activeTab, reservations]);

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
                {filteredReservations.length === 0 ? (
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
                            onClick={() => onReturn(reservation.id)}
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
