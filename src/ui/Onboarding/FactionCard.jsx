import React from "react";

export default function FactionCard({ faction }) {
  const { name, emoji, overview, palette } = faction;

  return (
    <div
      className="faction-card"
      style={{
        borderColor: palette?.[0] || "#bfa27a",
        boxShadow: `0 4px 10px ${palette?.[1] || "rgba(0,0,0,0.1)"}`,
      }}
    >
      <div className="faction-header">
        <span className="faction-emoji">{emoji}</span>
        <h2 className="faction-name">{name}</h2>
      </div>
      <p className="faction-overview">{overview}</p>
    </div>
  );
}
