import React from "react";

function ItemList({ items, onReserveItem }) {
  return (
    <div className="item-grid">
      {items.map((item) => {
        const isAvailable = item.available > 0;
        const availabilityRatio = item.total === 0 ? 0 : (item.available / item.total) * 100;

        return (
          <article key={item.name} className="equipment-card">
            <div className="equipment-image-placeholder"></div>

            <div className="equipment-header">
              <h3>{item.name}</h3>
              <span className="sport-tag">{item.sport}</span>
            </div>

            <div className="availability-row">
              <span>Availability</span>
              <strong>
                {item.available} / {item.total}
              </strong>
            </div>

            <div className="availability-track">
              <span className="availability-fill" style={{ width: `${availabilityRatio}%` }}></span>
            </div>

            <div className="condition-row">
              <span>Condition:</span>
              <span className={`condition-badge ${item.condition.toLowerCase().replace(" ", "-")}`}>
                {item.condition}
              </span>
            </div>

            <button
              className={`reserve-btn ${!isAvailable ? "disabled-btn" : ""}`}
              onClick={() => onReserveItem(item, isAvailable)}
              disabled={!isAvailable}
            >
              {!isAvailable ? "Out of Stock" : "Reserve Item"}
            </button>
          </article>
        );
      })}
    </div>
  );
}

export default ItemList;
