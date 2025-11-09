import React from "react";
import FactionCard from "./FactionCard";
import "./styles.css";
import factionsData from "../../../data/factions/factions.json"; // adjust if you store separately

export default function OnboardingMenu() {
  return (
    <div className="onboarding-container">
      <h1 className="onboarding-title">Choose Your Faction</h1>
      <div className="faction-grid">
        {factionsData.map((faction) => (
          <FactionCard key={faction.name} faction={faction} />
        ))}
      </div>
      <p className="no-faction">No faction chosen</p>
    </div>
  );
}
