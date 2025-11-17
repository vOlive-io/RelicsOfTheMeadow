import { factions as allFactions } from "../../data/factions.js";

const DISABLED_STORAGE_KEY = "meadow_disabled_factions";
const disabledFactions = new Set();

function loadDisabled() {
  try {
    const stored =
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem(DISABLED_STORAGE_KEY)
        : null;
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      parsed.forEach(name => disabledFactions.add(name));
    }
  } catch (err) {
    console.warn("Unable to load disabled factions:", err);
  }
}

function persistDisabled() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(
      DISABLED_STORAGE_KEY,
      JSON.stringify(Array.from(disabledFactions))
    );
  } catch (err) {
    console.warn("Unable to persist disabled factions:", err);
  }
}

loadDisabled();

export function disableFaction(name) {
  if (!name) return;
  disabledFactions.add(name);
  persistDisabled();
}

export function enableFaction(name) {
  if (!name) return;
  disabledFactions.delete(name);
  persistDisabled();
}

export function setDisabledFactions(list = []) {
  disabledFactions.clear();
  list
    .filter(Boolean)
    .forEach(name => disabledFactions.add(name));
  persistDisabled();
}

export function isFactionEnabled(name) {
  if (!name) return false;
  return !disabledFactions.has(name);
}

export function getEnabledFactions() {
  return allFactions.filter(f => isFactionEnabled(f.name));
}

if (typeof window !== "undefined") {
  window.factionManager = {
    disableFaction,
    enableFaction,
    setDisabledFactions,
    isFactionEnabled,
    getEnabledFactions,
  };
}

export { allFactions };
