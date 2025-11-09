import React from "react";

const FactionCard = ({ faction, isSelected, onSelect }) => {
  const [primary, secondary, accent] = faction.palette || [
    "#DDD",
    "#AAA",
    "#000",
  ];

  return (
    <div
      className={`faction-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
      style={{
        borderColor: accent,
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
      }}
    >
      <div className="emoji">{faction.emoji}</div>
      <h2 className="faction-name">{faction.name}</h2>
      <p className="faction-desc">{faction.overview}</p>
    </div>
  );
};

export default FactionCard;
