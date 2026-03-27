import React from "react";

function ItemList({ items, onReserveItem }) {
  return (
    <div className="item-grid">
      {items.map((item) => {
        const isAvailable = item.available > 0;
        const availabilityRatio = item.total === 0 ? 0 : (item.available / item.total) * 100;

        return (
          <article key={item.id || item.name} className="equipment-card">
             <img
              src={item.image}
              alt={item.name}
              className="equipment-image" />
              
            <h3>{item.name}</h3>
           <span className="equipment-sport">{item.sport}</span>

            <div className="availability-row" style={{ color: isAvailable ? "#2807ba" : "#d41326" }}>
              <span>Availability</span>
              <strong>
                {item.available} / {item.total}
              </strong>
            </div>

            <div className="availability-track" style={{ backgroundColor: isAvailable ? "#76797b" : "#ed3141" }}>
              <span className="availability-fill" style={{ width: `${availabilityRatio}%`, backgroundColor: isAvailable ? "#f1a008" : "#d41326"    }} ></span>
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
