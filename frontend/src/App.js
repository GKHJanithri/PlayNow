import React, { useState } from "react";
import MainItemPage from "./Pages/MainItemPage";
import ItemBookingPage from "./Pages/ItemBookingPage";
import ItemHistoryPage from "./Pages/ItemHistoryPage";
import AdminItemsPage from "./Pages/AdminItemsPage";

function App() {
  const [activePage, setActivePage] = useState("main");
  const [selectedItem, setSelectedItem] = useState(null);

  const handleReserveItem = (item) => {
    setSelectedItem(item);
    setActivePage("booking");
  };

  const handleBackToItems = () => {
    setActivePage("main");
  };

  const handleBookingConfirm = () => {
    setActivePage("history");
  };

  const handleOpenHistory = () => {
    setActivePage("history");
  };

  const handleOpenAdmin = () => {
    setActivePage("admin");
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
    return <ItemHistoryPage onBack={handleBackToItems} />;
  }

  if (activePage === "admin") {
    return <AdminItemsPage onBack={handleBackToItems} />;
  }

  return (
    <MainItemPage
      onReserveItem={handleReserveItem}
      onOpenHistory={handleOpenHistory}
      onOpenAdmin={handleOpenAdmin}
    />
  );
}

export default App;
