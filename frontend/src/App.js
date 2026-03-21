import React, { useState } from "react";
import MainItemPage from "./Pages/MainItemPage";
import ItemBookingPage from "./Pages/ItemBookingPage";
import ItemHistoryPage from "./Pages/ItemHistoryPage";

function App() {
  const [activePage, setActivePage] = useState("main");
  const [selectedItem, setSelectedItem] = useState(null);
  const [reservations, setReservations] = useState([
    {
      id: "RES-001",
      item: "Pro Cricket Bat",
      quantity: 2,
      borrowDate: "Oct 20, 2025",
      returnDate: "Oct 22, 2025",
      status: "Active"
    }
  ]);

  const handleReserveItem = (item) => {
    setSelectedItem(item);
    setActivePage("booking");
  };

  const handleBackToItems = () => {
    setActivePage("main");
  };

  const handleBookingConfirm = (reservation) => {
    setReservations((previous) => [reservation, ...previous]);
    setActivePage("history");
  };

  const handleOpenHistory = () => {
    setActivePage("history");
  };

  const handleReturnReservation = (reservationId) => {
    setReservations((previous) =>
      previous.map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: "Returned" }
          : reservation
      )
    );
  };

  if (activePage === "booking") {
    return (
      <ItemBookingPage
        selectedItem={selectedItem}
        onCancel={handleBackToItems}
        onConfirm={handleBookingConfirm}
      />
    );
  }

  if (activePage === "history") {
    return (
      <ItemHistoryPage
        reservations={reservations}
        onBack={handleBackToItems}
        onReturn={handleReturnReservation}
      />
    );
  }

  return <MainItemPage onReserveItem={handleReserveItem} onOpenHistory={handleOpenHistory} />;
}

export default App;
