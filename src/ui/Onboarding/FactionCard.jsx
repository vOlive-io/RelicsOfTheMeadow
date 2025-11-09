// src/ui/Onboarding/FactionCard.jsx
import React from "react";

export default function FactionCard({ faction, selected, onClick }) {
  return (
    <div
      className={`faction-card ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <h2>{faction.name}</h2>
      <p>{faction.overview}</p>
    </div>
  );
}
