import React, { useEffect, useState } from "react";
import FactionCard from "./FactionCard";
import { loadFactions } from "../../utils/fileLoader";
import "./OnboardingMenu.css";

export default function OnboardingMenu() {
  const [factions, setFactions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await loadFactions();
      setFactions(data);
    }
    fetchData();
  }, []);

  return (
    <div className="onboarding-container">
      <h1 className="title">Choose Your Faction</h1>
      <div className="faction-grid">
        {factions.map((faction, idx) => (
          <FactionCard key={idx} faction={faction} />
        ))}
      </div>
    </div>
  );
}
