import React, { useEffect, useState } from "react";
import FactionCard from "./FactionCard";

export default function OnboardingMenu() {
  const [factions, setFactions] = useState([]);
  const [selectedFaction, setSelectedFaction] = useState(null);

  useEffect(() => {
    // Load JSONs dynamically (mocked for now — swap with fetch later)
    import("../../../data/factions/crimson_horde.json").then((m) =>
      setFactions((f) => [...f, m.default])
    );
    import("../../../data/factions/devoured_faith.json").then((m) =>
      setFactions((f) => [...f, m.default])
    );
    import("../../../data/factions/jade_empire.json").then((m) =>
      setFactions((f) => [...f, m.default])
    );
    import("../../../data/factions/meadowfolk_union.json").then((m) =>
      setFactions((f) => [...f, m.default])
    );
    import("../../../data/factions/mycelid_monarchy.json").then((m) =>
      setFactions((f) => [...f, m.default])
    );
    import("../../../data/factions/spider_court.json").then((m) =>
      setFactions((f) => [...f, m.default])
    );
  }, []);

  const handleSelect = (faction) => {
    setSelectedFaction(faction);
  };

  const handleConfirm = () => {
    if (!selectedFaction) return;
    console.log("Chosen Faction:", selectedFaction.name);
    // later: send to backend or stateManager
  };

  return (
    <div className="min-h-screen bg-[#f7f0d5] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 drop-shadow-lg">
        Choose Your Faction
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {factions.map((f, idx) => (
          <FactionCard
            key={idx}
            faction={f}
            selected={selectedFaction}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <button
        disabled={!selectedFaction}
        onClick={handleConfirm}
        className={`mt-10 px-6 py-3 text-lg font-semibold rounded-lg transition-all
          ${selectedFaction ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}
          text-white shadow-lg`}
      >
        {selectedFaction ? `Join the ${selectedFaction.name}` : "Select a Faction"}
      </button>
    </div>
  );
}
