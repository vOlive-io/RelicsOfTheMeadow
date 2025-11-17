import { factions as allFactions } from "../../data/factions.js";

// Toggle entries here to control availability.
// enabled: false removes the faction entirely.
// earlyAccess: true keeps it visible but unplayable for players/bots.
export const factionSettings = {
  "The Crimson Horde": { enabled: true, earlyAccess: false },
  "The Devoured Faith": { enabled: true, earlyAccess: false },
  "The Jade Empire": { enabled: true, earlyAccess: false },
  "The Meadowfolk Union": { enabled: true, earlyAccess: false },
  "The Silken Dominion": { enabled: true, earlyAccess: false },
  "The Mycelial Monarchy": { enabled: true, earlyAccess: false },
};

export function setFactionEnabled(name, enabled) {
  if (typeof enabled !== "boolean") return;
  if (!factionSettings[name]) factionSettings[name] = {};
  factionSettings[name].enabled = enabled;
}

export function setFactionEarlyAccess(name, flag) {
  if (typeof flag !== "boolean") return;
  if (!factionSettings[name]) factionSettings[name] = {};
  factionSettings[name].earlyAccess = flag;
}

export function isFactionEnabled(name) {
  if (!name) return false;
  const entry = factionSettings[name];
  if (!entry) return true;
  return entry.enabled !== false;
}

export function isFactionEarlyAccess(name) {
  if (!name) return false;
  const entry = factionSettings[name];
  return Boolean(entry?.earlyAccess);
}

export function getDisplayFactions() {
  return allFactions.filter(f => isFactionEnabled(f.name));
}

export function getEnabledFactions() {
  return allFactions.filter(
    f => isFactionEnabled(f.name) && !isFactionEarlyAccess(f.name)
  );
}

if (typeof window !== "undefined") {
  window.factionManager = {
    setFactionEnabled,
    setFactionEarlyAccess,
    isFactionEnabled,
    isFactionEarlyAccess,
    getDisplayFactions,
    getEnabledFactions,
  };
}

export { allFactions };
