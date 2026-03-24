import React, { useMemo, useState } from "react";
import ItemList from "../Components/ItemList";
import "../Utils/Style.css";

function MainItemPage({ onReserveItem, onOpenHistory }) {
  const items = useMemo(
    () => [
      {
        name: "Netball",
        sport: "Netball",
        available: 8,
        total: 12,
        condition: "Good"
      },
      {
        name: "Volleyball",
        sport: "Volleyball",
        available: 5,
        total: 10,
        condition: "Good"
      },
      {
        name: "Cricket Bat",
        sport: "Cricket",
        available: 12,
        total: 15,
        condition: "Good"
      },
      {
        name: "Badminton",
        sport: "Badminton",
        available: 9,
        total: 14,
        condition: "Fair"
      },
      {
        name: "Basketball",
        sport: "Basketball",
        available: 0,
        total: 10,
        condition: "Needs Repair"
      },
      {
        name: "Tennis Bat",
        sport: "Tennis",
        available: 4,
        total: 9,
        condition: "Good"
      }
    ],
    []
  );

  const [searchText, setSearchText] = useState("");
  const [sportFilter, setSportFilter] = useState("All Sports");
  const [availabilityFilter, setAvailabilityFilter] = useState("All Availability");
  const [conditionFilter, setConditionFilter] = useState("All Conditions");

  const sportOptions = useMemo(
    () => ["All Sports", ...new Set(items.map((item) => item.sport))],
    [items]
  );

  const handleReserveClick = (item, isAvailable) => {
    if (!isAvailable) {
      return;
    }
    onReserveItem(item);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const textMatch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const sportMatch = sportFilter === "All Sports" || item.sport === sportFilter;

      const availabilityMatch =
        availabilityFilter === "All Availability" ||
        (availabilityFilter === "Available" && item.available > 0) ||
        (availabilityFilter === "Out of Stock" && item.available === 0);

      const conditionMatch =
        conditionFilter === "All Conditions" || item.condition === conditionFilter;

      return textMatch && sportMatch && availabilityMatch && conditionMatch;
    });
  }, [items, searchText, sportFilter, availabilityFilter, conditionFilter]);

  return (
    <main className="main-item-page">
      <section className="equipment-layout">
        <header className="page-header">
          <p className="breadcrumb">SLIIT Sports &gt; Equipment</p>
          <h1>Equipment</h1>
          <button className="history-btn" onClick={onOpenHistory}>
            My Equipment Reservations
          </button>
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

        <ItemList
          items={filteredItems}
          onReserveItem={handleReserveClick}
        />
      </section>
    </main>
  );
}

export default MainItemPage;
