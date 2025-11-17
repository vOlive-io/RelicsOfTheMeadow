import { factions as allFactions } from "../../data/factions.js";

// Toggle entries here to enable/disable factions by default.
export const factionSwitches = {
  "The Crimson Horde": true,
  "The Devoured Faith": true,
  "The Jade Empire": true,
  "The Meadowfolk Union": true,
  "The Silken Dominion": true,
  "The Mycelial Monarchy": true,
};

export function setFactionEnabled(name, enabled) {
  if (typeof enabled !== "boolean") return;
  factionSwitches[name] = enabled;
}

export function isFactionEnabled(name) {
  if (!name) return false;
  const flag = factionSwitches.hasOwnProperty(name) ? factionSwitches[name] : true;
  return Boolean(flag);
}

export function getEnabledFactions() {
  return allFactions.filter(f => isFactionEnabled(f.name));
}

if (typeof window !== "undefined") {
  window.factionManager = {
    setFactionEnabled,
    isFactionEnabled,
    getEnabledFactions,
  };
}

export { allFactions };
