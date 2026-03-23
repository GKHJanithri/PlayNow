import React from 'react';

const EventTabs = ({ tabs = [], activeTab, onChange }) => {
  return (
    <div className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`tab-button${activeTab === tab.value ? ' active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default EventTabs;
