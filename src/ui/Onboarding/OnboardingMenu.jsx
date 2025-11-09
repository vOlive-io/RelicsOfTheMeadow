import React, { useState } from "react";
import "./../../styles.css";
import FactionCard from "./FactionCard.jsx";

const factions = [
  { key: "devoured_faith", name: "The Devoured Faith" },
  { key: "spider_court", name: "The Spider Court" },
  { key: "meadowfolk_union", name: "The Meadowfolk Union" },
  { key: "jade_empire", name: "The Jade Empire" },
  { key: "mycelid_monarchy", name: "The Mycelid Monarchy" },
  { key: "crimson_horde", name: "The Crimson Horde" },
];

export default function OnboardingMenu({ onFactionSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="onboarding-container">
      <h1 className="title">Choose Your Faction</h1>
      <div className="faction-grid">
        {factions.map((f) => (
          <FactionCard
            key={f.key}
            name={f.name}
            selected={selected === f.key}
            onClick={() => {
              setSelected(f.key);
              onFactionSelect(f.key);
            }}
          />
        ))}
      </div>
    </div>
  );
}
