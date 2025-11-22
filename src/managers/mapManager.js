/////////////////////////////////////
/// MODULE IMPORTS               ///
/////////////////////////////////////
import { getBeastDefinition } from "../data/beasts.js";
/////////////////////////////////////
/// CONSTANTS & STATE            ///
/////////////////////////////////////
const INITIAL_GRID_WIDTH = 5;
const INITIAL_GRID_HALF = Math.floor(INITIAL_GRID_WIDTH / 2);
let gridHalf = INITIAL_GRID_HALF;
export const NEUTRAL_OWNER = "Unclaimed";

const terrainWeights = [
  { type: "Meadow", weight: 24 },
  { type: "Forest", weight: 16 },
  { type: "Hills", weight: 12 },
  { type: "Beach", weight: 8 },
  { type: "Mountains", weight: 8 },
  { type: "River", weight: 6 },
  { type: "Marsh", weight: 5 },
  { type: "Ocean", weight: 3 },
  { type: "Deep Ocean", weight: 1 },
  { type: "Enfenal Depths", weight: 1 },
  { type: "Crystal Cavern", weight: 1 },
  { type: "Ancient Grove", weight: 1 },
];

const beastFriendlyTerrains = new Set([
  "Meadow",
  "Forest",
  "Hills",
  "Beach",
  "Mountains",
  "River",
  "Marsh",
  "Ocean",
  "Deep Ocean",
  "Enfenal Depths",
  "Crystal Cavern",
  "Ancient Grove",
]);

let mapClearings = [];
const clearingLookup = new Map();
const factionCapitals = new Map();
const coordsToId = new Map();
let nextClearingId = 1;
let oceanSeeded = false;

/////////////////////////////////////
/// HELPERS                       ///
/////////////////////////////////////
function coordKey(row, col) {
  return `${row},${col}`;
}

function resetMapState() {
  mapClearings = [];
  clearingLookup.clear();
  factionCapitals.clear();
  coordsToId.clear();
  nextClearingId = 1;
  oceanSeeded = false;
  gridHalf = INITIAL_GRID_HALF;
}

function createClearing(row, col) {
  const terrain = pickTerrain(row, col);
  const clearing = {
    id: nextClearingId,
    owner: NEUTRAL_OWNER,
    terrain,
    row,
    col,
    structures: [],
    capitalOf: null,
    rarity: terrain === "Crystal Cavern" || terrain === "Ancient Grove" ? terrain : null,
    beast: maybeSpawnBeast(terrain, row, col),
    revealed: false,
  };
  mapClearings.push(clearing);
  clearingLookup.set(clearing.id, clearing);
  coordsToId.set(coordKey(row, col), clearing.id);
  nextClearingId += 1;
  return clearing;
}

function getNeighborCoords(row, col) {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ];
}

function getClearingAt(row, col) {
  const id = coordsToId.get(coordKey(row, col));
  return id ? clearingLookup.get(id) || null : null;
}

function hasAdjacentTerrain(row, col, terrain) {
  return getNeighborCoords(row, col).some(coord => {
    const neighbor = getClearingAt(coord.row, coord.col);
    return neighbor?.terrain === terrain;
  });
}

function pickTerrain(row, col) {
  let choice = weightedPick(terrainWeights);
  if (choice === "Ocean") {
    if (!oceanSeeded) {
      oceanSeeded = true;
    } else if (!hasAdjacentTerrain(row, col, "Ocean")) {
      choice = weightedPick(terrainWeights.filter(entry => entry.type !== "Ocean"));
    }
  }
  if (choice === "Deep Ocean" && !hasAdjacentTerrain(row, col, "Ocean")) {
    choice = "Ocean";
  }
  return enforceWaterRules(choice, row, col);
}

function enforceWaterRules(choice, row, col) {
  const neighbors = getNeighborCoords(row, col)
    .map(coord => getClearingAt(coord.row, coord.col))
    .filter(Boolean);
  const terrainSet = new Set(neighbors.map(n => n.terrain));
  if (choice === "Ocean") {
    const hasBeachNeighbor = terrainSet.has("Beach");
    const invalidNeighbor = [...terrainSet].some(t => t && t !== "Beach" && t !== "Ocean");
    if (!hasBeachNeighbor || invalidNeighbor) {
      return "Beach";
    }
  }
  if (choice === "Beach") {
    const hasOceanNeighbor = terrainSet.has("Ocean");
    if (!hasOceanNeighbor) {
      return "Ocean";
    }
  }
  if (choice === "Deep Ocean" && !terrainSet.has("Ocean")) {
    return "Ocean";
  }
  if (choice !== "Beach" && terrainSet.has("Ocean")) {
    return "Beach";
  }
  return choice;
}

function maybeSpawnBeast(terrain, row, col) {
  if (!beastFriendlyTerrains.has(terrain)) return null;
  if (isNearKeep(row, col, 1)) return null;
  // Elevated spawn chances to make beasts more common on discovery.
  const table = {
    Meadow: { type: "Meadow Stag", chance: 0.15 },
    Forest: { type: "Forest Alpha", chance: 0.2 },
    Hills: { type: "Hills Golem", chance: 0.18 },
    Beach: { type: "Mega Crab", chance: 0.3 },
    Mountains: { type: "Mountain Beast", chance: 0.22 },
    River: { type: "River Serpent", chance: 0.22 },
    Marsh: { type: "Marsh Horror", chance: 0.22 },
    Ocean: { type: "Sea Serpent", chance: 0.3 },
    "Deep Ocean": { type: "Deep Leviathan", chance: 0.45 },
    "Crystal Cavern": { type: "Crystal Wyrm", chance: 0.28 },
    "Ancient Grove": { type: "Grove Guardian", chance: 0.25 },
  };
  const entry = table[terrain];
  if (!entry || Math.random() > entry.chance) return null;
  const def = getBeastDefinition(entry.type);
  if (def) {
    return { type: def.type, strength: def.strength, health: def.health, rewards: def.rewards };
  }
  return null;
}

function weightedPick(list) {
  const total = list.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of list) {
    roll -= item.weight;
    if (roll <= 0) return item.type;
  }
  return list[list.length - 1].type;
}

function assignCapitalPositions(factionOrder) {
  const available = mapClearings.map((_, idx) => idx);
  const placements = new Map();
  const placed = [];
  const centerIndex = available.find(idx => {
    const clearing = mapClearings[idx];
    return clearing.row === 0 && clearing.col === 0;
  });
  factionOrder.forEach((faction, index) => {
    if (!available.length) return;
    let chosenIndex;
    if (index === 0 && typeof centerIndex === "number") {
      chosenIndex = centerIndex;
      available.splice(available.indexOf(centerIndex), 1);
    } else {
      chosenIndex = available.find(idx => placed.every(other => !areIndicesAdjacent(idx, other)));
      if (typeof chosenIndex !== "number") {
        chosenIndex = available[0];
      }
      available.splice(available.indexOf(chosenIndex), 1);
    }
    placements.set(faction.name, chosenIndex);
    placed.push(chosenIndex);
  });
  return placements;
}

function areIndicesAdjacent(idxA, idxB) {
  if (typeof idxA !== "number" || typeof idxB !== "number") return false;
  const clearingA = mapClearings[idxA];
  const clearingB = mapClearings[idxB];
  if (!clearingA || !clearingB) return false;
  return Math.abs(clearingA.row - clearingB.row) + Math.abs(clearingA.col - clearingB.col) === 1;
}

/////////////////////////////////////
/// PUBLIC API                    ///
/////////////////////////////////////
export function initializeMapState(playerFaction, factions = []) {
  resetMapState();
  for (let row = -gridHalf; row <= gridHalf; row += 1) {
    for (let col = -gridHalf; col <= gridHalf; col += 1) {
      createClearing(row, col);
    }
  }
  factions
    .filter(f => f.name !== playerFaction.name)
    .forEach(f => factionCapitals.set(f.name, null));
  const assignments = assignCapitalPositions([playerFaction]);
  const playerIndex = assignments.get(playerFaction.name);
  if (typeof playerIndex === "number") {
    const clearing = mapClearings[playerIndex];
    clearing.owner = playerFaction.name;
    clearing.capitalOf = playerFaction.name;
    clearing.structures = ["Keep"];
    factionCapitals.set(playerFaction.name, clearing.id);
  }
  const startingReveal = [
    { row: 0, col: 0 },
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 },
    { row: -2, col: 0 },
    { row: 2, col: 0 },
    { row: 0, col: -2 },
    { row: 0, col: 2 },
  ];
  startingReveal.forEach(({ row, col }) => {
    const clearing = getClearingAt(row, col);
    if (clearing) clearing.revealed = true;
  });
  return {
    playerClearingId: typeof playerIndex === "number" ? mapClearings[playerIndex]?.id ?? null : null,
  };
}

export function getMapClearings() {
  return mapClearings;
}

export function getGridSize() {
  return gridHalf * 2 + 1;
}

export function getClearingCount() {
  return mapClearings.length;
}

export function isNearKeep(row, col, radius = 1) {
  const keepCoords = [...factionCapitals.values()]
    .map(id => getClearingById(id))
    .filter(Boolean);
  return keepCoords.some(keep => Math.max(Math.abs(row - keep.row), Math.abs(col - keep.col)) <= radius);
}

export function getClearingById(id) {
  return clearingLookup.get(id) || null;
}

export function getFactionCapital(factionName) {
  return factionCapitals.get(factionName) || null;
}

export function getFactionCapitals() {
  return factionCapitals;
}

export function setFactionCapital(factionName, clearingId) {
  factionCapitals.set(factionName, clearingId);
}

export function deleteFactionCapital(factionName) {
  factionCapitals.delete(factionName);
}

export function placeStructureOnMap(ownerName, structureName, preferredClearingId = null) {
  if (!ownerName || !structureName || !mapClearings.length) return;
  const owned = mapClearings.filter(clearing => clearing.owner === ownerName);
  if (!owned.length) return;
  let target;
  if (preferredClearingId) {
    target = owned.find(c => c.id === preferredClearingId);
  }
  if (!target) {
    owned.sort((a, b) => {
      const aCap = a.capitalOf === ownerName ? 0 : 1;
      const bCap = b.capitalOf === ownerName ? 0 : 1;
      if (aCap !== bCap) return aCap - bCap;
      return (a.structures?.length || 0) - (b.structures?.length || 0);
    });
    target = owned[0];
  }
  if (!target.structures) target.structures = [];
  target.structures.push(structureName);
}

export function exploreFromClearing(clearingId, direction) {
  const origin = getClearingById(clearingId);
  if (!origin) return { clearing: null, discovered: false };
  const offsets = {
    north: { row: -1, col: 0 },
    south: { row: 1, col: 0 },
    east: { row: 0, col: 1 },
    west: { row: 0, col: -1 },
  };
  const delta = offsets[direction?.toLowerCase()] || null;
  if (!delta) return { clearing: null, discovered: false };
  const targetRow = origin.row + delta.row;
  const targetCol = origin.col + delta.col;
  const existing = getClearingAt(targetRow, targetCol);
  if (existing) return { clearing: existing, discovered: false };
  const clearing = createClearing(targetRow, targetCol);
  return { clearing, discovered: true };
}

export function markClearingRevealed(clearingId) {
  const clearing = getClearingById(clearingId);
  if (clearing) {
    clearing.revealed = true;
  }
}

export function getAdjacentClearingIds(clearingId) {
  const clearing = getClearingById(clearingId);
  if (!clearing) return [];
  return getNeighborCoords(clearing.row, clearing.col)
    .map(({ row, col }) => getClearingAt(row, col))
    .filter(Boolean)
    .map(neighbor => neighbor.id);
}

export function clearBeastFromClearing(clearingId) {
  const clearing = getClearingById(clearingId);
  if (clearing) {
    clearing.beast = null;
  }
}

export function expandMap(revealNew = true) {
  const newHalf = gridHalf + 1;
  const created = [];
  for (let row = -newHalf; row <= newHalf; row += 1) {
    for (let col = -newHalf; col <= newHalf; col += 1) {
      const onEdge = Math.abs(row) === newHalf || Math.abs(col) === newHalf;
      if (!onEdge) continue;
      if (getClearingAt(row, col)) continue;
      const clearing = createClearing(row, col);
      if (revealNew && clearing) clearing.revealed = true;
      created.push(clearing.id);
    }
  }
  gridHalf = newHalf;
  return { createdCount: created.length, newSize: getGridSize(), created };
}
