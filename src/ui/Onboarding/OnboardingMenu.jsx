import React, { useState, useEffect } from "react";
import FactionCard from "./FactionCard.jsx";

const OnboardingMenu = () => {
  const [factions, setFactions] = useState([]);
  const [selectedFaction, setSelectedFaction] = useState(null);

  useEffect(() => {
    const loadFactions = async () => {
      const files = import.meta.glob("/data/factions/*.json", { eager: true });
      const factionList = Object.values(files).map((mod) => mod.default);
      setFactions(factionList);
    };
    loadFactions();
  }, []);

  return (
    <div className="onboarding-screen">
      <h1 className="title">Choose Your Faction</h1>
      <div className="faction-grid">
        {factions.map((faction) => (
          <FactionCard
            key={faction.name}
            faction={faction}
            isSelected={selectedFaction?.name === faction.name}
            onSelect={() => setSelectedFaction(faction)}
          />
        ))}
      </div>
      <p className="selection-status">
        {selectedFaction
          ? `You have chosen: ${selectedFaction.emoji} ${selectedFaction.name}`
          : "No faction chosen"}
      </p>
    </div>
  );
};

export default OnboardingMenu;
