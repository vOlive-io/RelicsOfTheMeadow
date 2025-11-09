import React from "react";

export default function FactionCard({ faction }) {
  const { name, emoji, overview, palette } = faction;

  // graceful fallback if palette is missing
  const main = palette?.[0] || "#bfa27a";
  const secondary = palette?.[1] || "#fffaf0";
  const dark = palette?.[2] || "rgba(0,0,0,0.1)";

  return (
    <div
      className="faction-card"
      style={{
        "--card-main": main,
        "--card-secondary": secondary,
        "--card-dark": dark,
        background: `linear-gradient(180deg, ${secondary} 0%, ${dark} 120%)`,
        borderColor: main,
        boxShadow: `0 4px 12px ${dark}55`,
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
