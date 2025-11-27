/////////////////////////////////////
///        MODULE IMPORTS         ///
/////////////////////////////////////
import { factions } from "../../data/factions.js";
import { buildingDefinitions } from "../data/buildings.js";
import { resources as resourceDefinitions } from "../data/resources.js";
import { calcStartingEnergy } from "../utils/statCalc.js";
import { importItems as giftItems } from "../../data/importItems.js";
import { relics as relicLibrary } from "../../data/relics.js";
import { startPlayerGame } from "./gameSetup.js";
import {
  initializeMapState as initializeWorldMap,
  getMapClearings,
  getFactionCapital,
  setFactionCapital,
  getClearingById,
  clearBeastFromClearing,
  exploreFromClearing,
  markClearingRevealed,
  getAdjacentClearingIds,
  NEUTRAL_OWNER,
  expandMap,
  getGridSize,
  exportMapState,
  importMapState,
} from "../managers/mapManager.js";
import { constructBuilding } from "../managers/buildingManager.js";
import {
  hasBlueprint,
  getScaledCostForBlueprint,
  getStructuresInClearing,
  calculateProductionTotals,
  getProductionEntries,
  addResources as depositProducedResources,
  exportCraftingState,
  importCraftingState,
} from "../managers/craftingManager.js";
import {
  hasResources,
  spendResources,
  spendResource,
  getResourceAmount,
  addResource,
  getAllResources,
  exportResourceState,
  importResourceState,
} from "../managers/resourceManager.js";
import {
  getPopulation,
  getHappiness,
  adjustHappiness,
  getHealth,
  adjustHealth,
  addPopulation,
  getHomeless,
  getHousingCapacity,
  tickPopulation,
  exportPopulationState,
  importPopulationState,
} from "../managers/populationManager.js";
import {
  applyEventProductionModifiers,
  getActiveEvents,
  maybeTriggerRandomEvent,
  advanceEvents,
  resetEventState,
  startFestival,
  exportEventState,
  importEventState,
} from "../managers/eventManager.js";
import { resolveBeastEncounter, resetCombatState } from "../managers/combatManager.js";
import { initMapUI, renderMap as renderWorldMap } from "../ui/mapUI.js";
import { renderResourcePanel } from "../ui/resourceUI.js";
import { renderPopulationPanel } from "../ui/populationUI.js";
import { getBeastDefinition } from "../data/beasts.js";
import { isNearKeep } from "../managers/mapManager.js";
console.log("✅ Game JS loaded!");

const relicCatalog = new Map(relicLibrary.map(relic => [relic.name, relic]));
const availableDelveRelics = new Set(relicLibrary.map(relic => relic.name));
const factionLookup = new Map();
factions.forEach(f => {
  factionLookup.set(f.name, f);
});

const harvestableGoods = [
  { key: "wheat", name: "Amber Wheat", emoji: "🌾", value: 18 },
  { key: "herbs", name: "Grove Herbs", emoji: "🌿", value: 20 },
  { key: "timber", name: "Lumber Bundles", emoji: "🪵", value: 24 },
  { key: "supplies", name: "Packed Supplies", emoji: "🎒", value: 22 },
  { key: "ore", name: "Shimmer Ore", emoji: "⛏️", value: 26 },
];
const factionHarvestGoods = {
  "The Crimson Horde": [{ key: "war_spoils", name: "War Spoils", emoji: "🩸", value: 32 }],
  "The Devoured Faith": [{ key: "relic_shard", name: "Relic Shard", emoji: "🕯️", value: 28 }],
  "The Jade Empire": [{ key: "trade_seal", name: "Trade Seal", emoji: "🐉", value: 30 }],
  "The Meadowfolk Union": [{ key: "sun_petals", name: "Sun Petals", emoji: "🌻", value: 24 }],
  "The Silken Dominion": [{ key: "silk_spool", name: "Silk Spool", emoji: "🧵", value: 27 }],
  "The Mycelial Monarchy": [{ key: "spore_bloom", name: "Spore Bloom", emoji: "🍄", value: 29 }],
};
const harvestGoodsMap = new Map();
function registerHarvestGoods(list) {
  list.forEach(good => {
    const existing = harvestGoodsMap.get(good.key) || {};
    const merged = {
      ...existing,
      ...good,
      weight: good.weight ?? existing.weight ?? 1,
    };
    harvestGoodsMap.set(good.key, merged);
  });
}
registerHarvestGoods(harvestableGoods);
Object.values(factionHarvestGoods).forEach(list => registerHarvestGoods(list));
const HARVEST_ENERGY_COST = 1;
const RELIC_DELVE_COST = { energy: 5, gold: 250 };
const RECRUIT_COST = { energy: 2, gold: 40 };
const GIFT_RUN_COST = { energy: 1, gold: 0 };
const ADVANCE_ENERGY_COST = 1;
const BATTLE_ENERGY_COST = 1;
const FESTIVAL_COST = { fruits: 12, wheat: 10 };
const CONQUEST_ENERGY_COST = 3;
const BASE_GOLD_STORAGE = 500;
let selectedClearingId = null;
let turnCounter = 0;
const SEASON_LENGTH = 5;
const seasons = [
  { key: "spring", name: "Spring", hungerMultiplier: 0.9, homelessPenalty: 1 },
  { key: "summer", name: "Summer", hungerMultiplier: 1, homelessPenalty: 1 },
  { key: "fall", name: "Fall", hungerMultiplier: 1.3, homelessPenalty: 1 },
  { key: "winter", name: "Winter", hungerMultiplier: 1.1, homelessPenalty: 1.5 },
];
const seasonAtmosphere = {
  spring: { className: "season-spring", emoji: "🌸", count: 18 },
  summer: { className: "season-summer", emoji: null, count: 0 },
  fall: { className: "season-fall", emoji: "🍂", count: 14 },
  winter: { className: "season-winter", emoji: "❄️", count: 20 },
};
const seasonClassNames = Object.values(seasonAtmosphere)
  .map(entry => entry.className)
  .filter(Boolean);
let currentSeasonIndex = 0;
const WORLD_EVENT_LIMIT = 6;
let worldEventFeed = [];
const WATER_TERRAINS = new Set(["Ocean", "Deep Ocean"]);
const SAVE_KEY = "meadowSaveV1";
const structureEmojiMap = {
  Keep: "🏰",
  "Captured Holdfast": "🏴",
  "Hidden Capital": "🏯",
  "Basic House": "🏠",
  Villa: "🏡",
  Mansion: "🏘️",
  Manor: "🏛️",
  "Basic Orchard": "🍎",
  "Large Orchard": "🍊",
  "Orchard of the Gods": "🍇",
  "Basic Farm Field": "🌾",
  "Large Farm Field": "🌽",
  "Farm Field of the Gods": "🌾",
  "Basic Herb Garden": "🌿",
  "Large Herb Garden": "🥬",
  "Herb Garden of the Gods": "🌺",
  "Basic Pasture": "🐑",
  "Large Pasture": "🐄",
  "Pasture of the Gods": "🦬",
  Evergarden: "🌼",
  "Industry Mill": "🏭",
  "Mortar Quarry": "🧱",
  Sawmill: "🪵",
  Dock: "⚓",
  "Fishman's Wharf": "🐟",
  "Mine Shaft": "⛏️",
  "Deep Mine Shaft": "⛏️",
  "Grand Mine": "⚒️",
  "Mine Hub": "🏗️",
  Statue: "🗽",
  Fountain: "⛲",
  Banners: "🚩",
  "Tech Lab": "🧪",
  Library: "📚",
  "Apex Research Laboratory": "🔬",
  "Ultra Apex Bastion": "🏯",
};
const foodCategoryMap = {
  fruits: "fruits",
  spices: "grains",
  herbs: "grains",
  fish: "meat",
  meat: "meat",
  crabMeat: "meat",
  wheat: "grains",
  seaweed: "grains",
};

function formatStructureName(name) {
  if (!name) return "";
  const emoji = structureEmojiMap[name] || "🏗️";
  return `${emoji} ${name}`;
}

function formatStructureList(structures = []) {
  if (!structures.length) return "";
  const recent = structures.slice(-2).map(formatStructureName);
  const extra = structures.length - recent.length;
  return extra > 0 ? `${recent.join("<br>")} +${extra}` : recent.join("<br>");
}

const resourceLabelMap = Object.fromEntries(
  resourceDefinitions.map(resource => [resource.key, `${resource.icon} ${resource.name}`])
);

function formatResourceTotals(totals = {}) {
  const parts = Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => `${amount} ${resourceLabelMap[key] || key}`);
  return parts.length ? parts.join(", ") : "no resources";
}

function announceWorldEvent(message) {
  worldEventFeed.push({ message, id: Date.now() + Math.random() });
  if (worldEventFeed.length > WORLD_EVENT_LIMIT) {
    worldEventFeed = worldEventFeed.slice(-WORLD_EVENT_LIMIT);
  }
  renderWorldEventFeed();
}

function serializePlayerState() {
  return {
    ...player,
    garrisonedClearings: [...(player.garrisonedClearings || [])],
    relicsUsedThisTurn: [...(player.relicsUsedThisTurn || [])],
    abilitiesUsedThisTurn: [...(player.abilitiesUsedThisTurn || [])],
  };
}

function hydratePlayerState(saved = {}) {
  Object.assign(player, saved);
  player.garrisonedClearings = new Set(saved.garrisonedClearings || []);
  player.relicsUsedThisTurn = new Set(saved.relicsUsedThisTurn || []);
  player.abilitiesUsedThisTurn = new Map(saved.abilitiesUsedThisTurn || []);
  player.pendingPlayerPrompts = saved.pendingPlayerPrompts || [];
}

function saveGameState() {
  try {
    const payload = {
      player: serializePlayerState(),
      map: exportMapState(),
      crafting: exportCraftingState(),
      resources: exportResourceState(),
      population: exportPopulationState(),
      events: exportEventState(),
      worldEventFeed,
      selectedClearingId,
      turnCounter,
      currentSeasonIndex,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed to save game state", err);
  }
}

function loadGameState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data?.player?.faction?.name || data.player.faction.name !== player?.faction?.name) {
      return false;
    }
    hydratePlayerState(data.player);
    importResourceState(data.resources || {});
    importPopulationState(data.population || {});
    importCraftingState(data.crafting || {});
    if (data.map?.mapClearings?.length) {
      importMapState(data.map);
    }
    importEventState(data.events || []);
    worldEventFeed = Array.isArray(data.worldEventFeed) ? data.worldEventFeed : [];
    selectedClearingId = data.selectedClearingId ?? selectedClearingId;
    turnCounter = Number.isFinite(data.turnCounter) ? data.turnCounter : turnCounter;
    currentSeasonIndex = Number.isFinite(data.currentSeasonIndex) ? data.currentSeasonIndex : currentSeasonIndex;
    refreshHarvestAvailability();
    return true;
  } catch (err) {
    console.error("Failed to load saved game", err);
    return false;
  }
}

function renderSeasonalFx(config, seasonKey) {
  const container = document.getElementById("seasonalFx");
  if (!container || !config) return;
  if (container.dataset.season === seasonKey) return;
  container.dataset.season = seasonKey;
  container.innerHTML = "";
  if (!config.emoji || config.count <= 0) {
    container.classList.add("seasonal-fx--inactive");
    return;
  }
  container.classList.remove("seasonal-fx--inactive");
  for (let i = 0; i < config.count; i += 1) {
    const drop = document.createElement("span");
    drop.className = "falling-emoji";
    drop.textContent = config.emoji;
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${6 + Math.random() * 6}s`;
    drop.style.animationDelay = `${Math.random() * 4}s`;
    drop.style.fontSize = `${0.9 + Math.random() * 0.6}rem`;
    drop.style.setProperty("--drift", `${Math.random() * 60 - 30}px`);
    container.appendChild(drop);
  }
}

function applySeasonalTheme() {
  const season = getCurrentSeason();
  const config = seasonAtmosphere[season.key] || seasonAtmosphere.spring;
  const body = document.body;
  if (!body) return;
  seasonClassNames.forEach(cls => body.classList.remove(cls));
  if (config.className) {
    body.classList.add(config.className);
  }
  renderSeasonalFx(config, season.key);
}

function updateSeasonDisplay() {
  const season = getCurrentSeason();
  const display = document.getElementById("seasonDisplay");
  if (display) {
    display.textContent = `Season: ${season.name}`;
  }
}

function getCurrentSeason() {
  return seasons[currentSeasonIndex] || seasons[0];
}

function nextSeason() {
  currentSeasonIndex = (currentSeasonIndex + 1) % seasons.length;
  const season = getCurrentSeason();
  logEvent(`🍃 Season changes to ${season.name}.`);
}

function applyHappinessDelta(delta) {
  adjustHappiness(delta);
  player.happiness = getHappiness();
}

function syncHealth() {
  player.health = getHealth();
}

function aggregateEventEffects() {
  const active = getActiveEvents();
  return active.reduce(
    (acc, event) => {
      const effects = event.effects || {};
      if (effects.energyGainMultiplier) acc.energyGainMultiplier *= effects.energyGainMultiplier;
      if (effects.giftMultiplier) acc.giftMultiplier *= effects.giftMultiplier;
      if (effects.housingHappinessBonus)
        acc.housingHappinessBonus += effects.housingHappinessBonus;
      return acc;
    },
    { energyGainMultiplier: 1, giftMultiplier: 1, housingHappinessBonus: 0 }
  );
}

function calculateConquestCost() {
  const currentSize = getGridSize();
  const expansions = Math.max(0, Math.floor((currentSize - 5) / 2));
  const factor = Math.pow(expansions + 1, 2) + expansions;
  const gold = 600 * factor;
  const resources = {
    logs: 350 * factor,
    stone: 350 * factor,
    clay: 220 * factor,
    mythril: 30 * factor,
    goldOre: 40 * factor,
  };
  return { goldCost: gold, resourcesCost: resources, nextSize: currentSize + 2 };
}

function attemptConquest() {
  const { goldCost, resourcesCost, nextSize } = calculateConquestCost();
  const energyCost = CONQUEST_ENERGY_COST;
  if (player.energy < energyCost) {
    logEvent("⚡ Not enough energy for conquest.");
    return;
  }
  if (!hasResources(resourcesCost)) {
    logEvent("⛏️ Not enough materials for conquest.");
    return;
  }
  if (player.gold < goldCost) {
    logEvent("💰 Not enough gold for conquest.");
    return;
  }
  spendResources(resourcesCost);
  const success = spendEnergyAndGold(
    energyCost,
    goldCost,
    `🏴 Conquest launched toward a ${nextSize}x${nextSize} realm.`,
    () => {
      const result = expandMap(true);
      logEvent(
        `🏴 Conquest succeeds! Realm now ${result.newSize}x${result.newSize} (+${result.createdCount} clearings).`
      );
      renderWorldMap({
        selectedClearingId,
        formatOwnerLabel,
        getOwnerColor,
        formatStructures: formatStructureList,
        formatTooltip: formatClearingTooltip,
        isGarrisoned: id => isClearingGarrisoned(id),
        getTroopCount: id => (isClearingGarrisoned(id) ? player.troops : 0),
      });
    }
  );
  if (!success) {
    logEvent("🚫 Conquest failed to execute.");
  }
}

function calculateFoodCategories() {
  const resources = getAllResources();
  const definitions = resourceDefinitions.reduce((map, r) => {
    map[r.key] = r;
    return map;
  }, {});
  const categories = {
    fruits: { icon: "🍎", total: 0, items: [] },
    sweets: { icon: "🍬", total: 0, items: [] },
    fish: { icon: "🐟", total: 0, items: [] },
    meat: { icon: "🍖", total: 0, items: [] },
    grains: { icon: "🍞", total: 0, items: [] },
  };
  Object.entries(resources).forEach(([key, amount]) => {
    if (!amount) return;
    const category = foodCategoryMap[key];
    if (!category || !categories[category]) return;
    categories[category].total += amount;
    categories[category].items.push({ name: definitions[key]?.name || key, amount });
  });
  return categories;
}

function consumeFoodForPopulation() {
  const population = getPopulation();
  if (population <= 0) return;
  const season = getCurrentSeason();
  const active = getActiveEvents();
  let hungerMultiplier = season.hungerMultiplier || 1;
  let meatMultiplier = 1;
  let fruitMultiplier = 1;
  let sweetsMultiplier = 1;
  active.forEach(event => {
    const effects = event.effects || {};
    if (effects.hungerMultiplier) hungerMultiplier *= effects.hungerMultiplier;
    if (effects.meatMultiplier) meatMultiplier *= effects.meatMultiplier;
    if (effects.fruitMultiplier) fruitMultiplier *= effects.fruitMultiplier;
    if (effects.sweetsMultiplier) sweetsMultiplier *= effects.sweetsMultiplier;
  });
  const foodNeeded = Math.ceil(population * 3 * hungerMultiplier);
  const pantryOrder = ["meat", "crabMeat", "fish", "wheat", "seaweed", "herbs", "spices", "fruits"];
  let remaining = foodNeeded;
  const eaten = new Set();
  pantryOrder.forEach(resource => {
    if (remaining <= 0) return;
    const available = getResourceAmount(resource);
    if (!available) return;
    const category = foodCategoryMap[resource] || "other";
    const catMult =
      category === "meat"
        ? meatMultiplier
        : category === "fruits"
        ? fruitMultiplier
        : category === "sweets"
        ? sweetsMultiplier
        : 1;
    const spend = Math.min(available, Math.ceil(remaining * catMult));
    if (spend > 0) eaten.add(resource);
    spendResource(resource, spend);
    remaining -= Math.min(spend, remaining);
  });
  const balanced = eaten.size >= 2;
  if (remaining > 0) {
    const penalty = Math.max(1, Math.round(remaining * 0.3));
    applyHappinessDelta(-penalty);
    adjustHealth(-8);
    syncHealth();
    logEvent(`🍽️ Food shortage! Missing ${remaining} portions; health and morale dip.`);
  } else if (!balanced) {
    applyHappinessDelta(-1);
    adjustHealth(-2);
    syncHealth();
    logEvent("🍽️ Diet lacked variety; minor grumbling across the realm.");
  } else {
    adjustHealth(2);
    syncHealth();
  }
  const healthNow = getHealth();
  if (healthNow < 35 && population > 0) {
    const losses = Math.max(1, Math.round((35 - healthNow) / 15));
    addPopulation(-losses);
    applyHappinessDelta(-losses);
    logEvent(`🤒 Illness spreads (health ${healthNow}%). ${losses} citizens were lost.`);
  }
}

function welcomeNewSettlers() {
  const happiness = getHappiness();
  if (happiness < 75) return;
  const capacity = getHousingCapacity();
  const population = getPopulation();
  const room = Math.max(0, capacity - population);
  if (room <= 0) return;
  const bonus = Math.max(0, Math.floor((happiness - 70) / 10));
  const arrivals = Math.min(room, Math.max(1, Math.round(population * 0.03) + bonus));
  addPopulation(arrivals);
  logEvent(`🎉 Word spreads of your happy people. ${arrivals} new settlers join your kingdom.`);
}

function handleUnhappyExodus() {
  const happiness = getHappiness();
  if (happiness >= 75) return;
  const population = getPopulation();
  if (population <= 0) return;
  const losses = Math.max(1, Math.round(population * 0.02));
  addPopulation(-losses);
  applyHappinessDelta(-1);
  logEvent(`🚶 Some citizens depart due to low morale (-${losses} population).`);
}

function renderWorldEventFeed() {
  const ticker = document.getElementById("eventTicker");
  if (!ticker) return;
  const active = getActiveEvents();
  const activeMarkup = active.length
    ? `<div class="event-active"><strong>Active Boons:</strong> ${active
        .map(event => `${event.name} (${event.turnsRemaining}t)`)
        .join(", ")}</div>`
    : `<div class="event-active muted">No active events.</div>`;
  const updates =
    worldEventFeed.length > 0
      ? worldEventFeed
          .slice(-WORLD_EVENT_LIMIT)
          .map(entry => `<div class="world-event">${entry.message}</div>`)
          .join("")
      : `<div class="world-event muted">No recent world events.</div>`;
  ticker.innerHTML = `${activeMarkup}${updates}`;
}

function getGoldStorageCapacity(target = player) {
  if (!target) return BASE_GOLD_STORAGE;
  const base = Number.isFinite(target.goldStorageBase) ? target.goldStorageBase : BASE_GOLD_STORAGE;
  const bonus = Number.isFinite(target.goldStorageBonus) ? target.goldStorageBonus : 0;
  return base + bonus;
}

function enforceGoldCapacity(target = player) {
  if (!target) return;
  const cap = getGoldStorageCapacity(target);
  if (target.gold > cap) {
    target.gold = cap;
  }
}

function grantGold(amount, target = player) {
  if (!target || !amount) return 0;
  const cap = getGoldStorageCapacity(target);
  const previous = Math.max(0, target.gold || 0);
  const next = Math.min(cap, previous + amount);
  target.gold = next;
  return next - previous;
}

function getActiveHarvestGoods() {
  const active = new Map();
  const addByKey = key => {
    const good = harvestGoodsMap.get(key);
    if (good) active.set(key, good);
  };
  harvestableGoods.forEach(g => addByKey(g.key));
  const factionExtras = player?.faction ? factionHarvestGoods[player.faction.name] : null;
  if (factionExtras) {
    factionExtras.forEach(g => addByKey(g.key));
  }
  if (player?.extraHarvestGoods?.length) {
    player.extraHarvestGoods.forEach(g => addByKey(g.key));
  }
  return [...active.values()];
}

function getHarvestCatalog() {
  const map = new Map();
  getActiveHarvestGoods().forEach(g => {
    if (!map.has(g.key)) {
      map.set(g.key, g);
    }
  });
  return [...map.values()];
}


/////////////////////////////////////
///      DERIVED STATS & HUD      ///
/////////////////////////////////////
function updateDerivedStats() {
  player.resilience = 0;
  player.economy = 1;
  player.prowess = 0;
}

function renderHUD() {
  if (!player?.faction) return;
  applySeasonalTheme();
  updateSeasonDisplay();
  enforceGoldCapacity();
  const f = player.faction;
  const factionBanner = document.getElementById("factionDisplay");
  factionBanner.textContent = `${f.emoji} ${f.name}`;
  factionBanner.classList.remove("status-ally", "status-war", "status-neutral");
  factionBanner.classList.add("status-neutral");
  player.happiness = getHappiness();
  player.health = getHealth();
  updateDerivedStats();
  const factionList = document.getElementById("factionList");
  if (factionList) factionList.style.display = "none";
  renderFactionAbilities();
  updateActionIndicators();
  renderWorldMap({
    selectedClearingId,
    formatOwnerLabel,
    getOwnerColor,
    formatStructures: formatStructureList,
    formatTooltip: formatClearingTooltip,
    isGarrisoned: id => isClearingGarrisoned(id),
    getTroopCount: id => (isClearingGarrisoned(id) ? player.troops : 0),
  });
  renderResourcePanel();
  renderPopulationPanel();
  renderInventorySidebar();
  renderWorldEventFeed();
  renderMapActions();
  saveGameState();
}

/////////////////////////////////////
///        MAP & CLEARINGS        ///
/////////////////////////////////////
function getOwnerColor(ownerName) {
  if (ownerName === player?.faction?.name) return "#5ba571";
  if (ownerName === NEUTRAL_OWNER) return "#6b705c";
  return factionLookup.get(ownerName)?.palette?.[0] || "#6b705c";
}

function formatOwnerLabel(ownerName) {
  return "";
}

function getSelectedClearing() {
  if (!selectedClearingId) return null;
  return getClearingById(selectedClearingId);
}

function ensureGarrisonContainer() {
  if (!(player.garrisonedClearings instanceof Set)) {
    player.garrisonedClearings = new Set(player.garrisonedClearings || []);
  }
}

function isClearingGarrisoned(clearingId) {
  if (!clearingId) return false;
  ensureGarrisonContainer();
  return player.garrisonedClearings.has(clearingId);
}

function hasWaterAccess(clearingId) {
  const structuresHere = getStructuresInClearing(clearingId);
  return structuresHere.some(struct => struct.waterAccess);
}

function revealClearingAndNeighbors(clearingId) {
  if (!clearingId) return;
  markClearingRevealed(clearingId);
  getAdjacentClearingIds(clearingId).forEach(id => markClearingRevealed(id));
}

function spawnRandomBeast() {
  const clearings = getMapClearings().filter(c => !c.beast && !isNearKeep(c.row, c.col, 1));
  if (!clearings.length) return;
  const target = clearings[Math.floor(Math.random() * clearings.length)];
  const def = getBeastDefinition("Beast") || { type: "Beast", strength: 3, health: 100 };
  target.beast = { type: def.type, strength: def.strength, health: def.health, rewards: def.rewards };
  announceWorldEvent(`🐾 A ${target.beast.type} prowls in a nearby ${target.terrain} clearing!`);
}

function revealClearingIfNearGarrison(clearingId) {
  if (!clearingId) return;
  ensureGarrisonContainer();
  const neighbors = getAdjacentClearingIds(clearingId);
  if (neighbors.some(id => player.garrisonedClearings.has(id))) {
    markClearingRevealed(clearingId);
  }
}

function garrisonClearing(clearingId, { silent = false } = {}) {
  if (!clearingId) return;
  ensureGarrisonContainer();
  if (player.garrisonedClearings.has(clearingId)) return;
  player.garrisonedClearings.add(clearingId);
  revealClearingAndNeighbors(clearingId);
  if (!silent) {
    logEvent(`🪖 Troops now hold the clearing. Nearby wilds reveal themselves.`);
  }
}

function advanceTroops(direction) {
  const clearing = getSelectedClearing();
  if (!clearing) {
    logEvent("🪖 Select a clearing to advance from.");
    return;
  }
  ensureGarrisonContainer();
  if (player.troops <= 0) {
    logEvent("🪖 No troops ready to advance.");
    return;
  }
  if (player.energy < ADVANCE_ENERGY_COST) {
    logEvent("⚡ Not enough energy to advance.");
    return;
  }
  const { clearing: result, discovered } = exploreFromClearing(clearing.id, direction);
  if (!result) {
    logEvent("🪖 Cannot advance that way.");
    return;
  }
  const isWater = WATER_TERRAINS.has(result.terrain);
  if (isWater && !hasWaterAccess(clearing.id)) {
    logEvent("⚓ A dock or wharf is required to move troops onto the water.");
    return;
  }
  spendEnergyAndGold(ADVANCE_ENERGY_COST, 0, null, () => {
    player.garrisonedClearings.delete(clearing.id);
    garrisonClearing(result.id, { silent: true });
    selectedClearingId = result.id;
    player.currentClearingId = result.id;
    const discoveryText = discovered
      ? `discovered a ${result.terrain} clearing.`
      : `entered the clearing.`;
    logEvent(`🪖 Advanced ${direction} and ${discoveryText}`);
    if (result.beast) {
      logEvent(`⚠️ A ${result.beast.type} lurks here.`);
    }
    if (discovered && result.beast) {
      handleBeastEncounter(result, true);
    }
    refreshHarvestAvailability();
    renderHUD();
  });
}

function formatClearingTooltip(clearing) {
  if (!clearing) return "";
  if (!clearing.revealed) {
    return `
      <div><strong>Wild Clearing</strong></div>
      <div>Terrain: Unknown</div>
      <div>Owner: Unknown</div>
      <div>Send troops nearby to reveal.</div>
    `;
  }
  const terrainEmoji =
    {
      Meadow: "🌿",
      Forest: "🌲",
      Hills: "⛰️",
      Mountains: "🏔️",
      River: "🏞️",
      Marsh: "🦠",
      "Crystal Cavern": "💎",
      "Ancient Grove": "🌳",
      Ocean: "🏝️",
      "Deep Ocean": "🌊",
    }[clearing.terrain] || "◻️";
  const owner =
    clearing.owner === NEUTRAL_OWNER
      ? "Unclaimed"
      : clearing.owner === player?.faction?.name
      ? "Your control"
      : clearing.owner || "None";
  const structures = Array.isArray(clearing.structures) && clearing.structures.length
    ? clearing.structures.join(", ")
    : "None";
  const beastLine = clearing.beast
    ? `<div>Beast: ${clearing.beast.type} (⚔️ ${clearing.beast.strength}${
        clearing.beast.health ? ` • ❤️ ${clearing.beast.health}` : ""
      })</div>`
    : "";
  const rarityLine = clearing.rarity ? `<div>Rarity: ${clearing.rarity}</div>` : "";
  return `
    <div><strong>Clearing</strong></div>
    <div>Terrain: ${terrainEmoji} ${clearing.terrain}</div>
    <div>Owner: ${owner}</div>
    ${rarityLine}
    ${beastLine}
    <div>Structures: ${structures}</div>
  `;
}

function evaluateBlueprintAvailability(definition, clearing, structuresHere = null) {
  if (!definition || !clearing) return { canBuild: false, reason: "No clearing selected", cost: {} };
  if (!hasBlueprint(definition.key)) {
    return { canBuild: false, reason: "Blueprint locked", cost: getScaledCostForBlueprint(definition.key) };
  }
  if (clearing.beast) {
    return { canBuild: false, reason: "Beast present", cost: getScaledCostForBlueprint(definition.key) };
  }
  if (definition.supportedTerrains && !definition.supportedTerrains.includes(clearing.terrain)) {
    return { canBuild: false, reason: "Wrong terrain", cost: getScaledCostForBlueprint(definition.key) };
  }
  const structures = structuresHere || getStructuresInClearing(clearing.id);
  const structureCount = Math.max(structures.length, Array.isArray(clearing.structures) ? clearing.structures.length : 0);
  if (!definition.upgradeFrom && structureCount >= 5) {
    return {
      canBuild: false,
      reason: "Clearing full (max 5 structures)",
      cost: getScaledCostForBlueprint(definition.key),
    };
  }
  if (definition.upgradeFrom && !structures.some(structure => structure.key === definition.upgradeFrom)) {
    const previous = buildingDefinitions.find(entry => entry.key === definition.upgradeFrom);
    return {
      canBuild: false,
      reason: `Requires ${previous?.name || "previous tier"} in this clearing`,
      cost: getScaledCostForBlueprint(definition.key),
    };
  }
  const scaledCost = getScaledCostForBlueprint(definition.key);
  if (!hasResources(scaledCost)) {
    return { canBuild: false, reason: "Need materials", cost: scaledCost };
  }
  return { canBuild: true, reason: "", cost: scaledCost };
}

function refreshHarvestAvailability() {
  const hasProduction = getProductionEntries().length > 0;
  if (!hasProduction) {
    player.harvestLimit = 0;
    player.harvestsLeft = 0;
    return;
  }
  if ((player.harvestLimit || 0) === 0) {
    player.harvestLimit = 1;
    player.harvestsLeft = 1;
    return;
  }
  player.harvestsLeft = Math.min(player.harvestsLeft || 0, player.harvestLimit || 0);
}

function renderMapActions() {
  const container = document.getElementById("mapActions");
  if (!container) return;
  const clearing = getSelectedClearing();
  if (!clearing) {
    container.innerHTML = "<p>Select a clearing to explore or engage.</p>";
    return;
  }
  container.innerHTML = "";
  ensureGarrisonContainer();
  const isGarrisoned = isClearingGarrisoned(clearing.id);
  const directions = [
    { id: "north", label: `Advance North (⚡${ADVANCE_ENERGY_COST})` },
    { id: "east", label: `Advance East (⚡${ADVANCE_ENERGY_COST})` },
    { id: "south", label: `Advance South (⚡${ADVANCE_ENERGY_COST})` },
    { id: "west", label: `Advance West (⚡${ADVANCE_ENERGY_COST})` },
  ];
  directions.forEach(dir => {
    const btn = document.createElement("button");
    btn.textContent = dir.label;
    btn.disabled = player.energy < ADVANCE_ENERGY_COST || player.troops <= 0;
    btn.addEventListener("click", () => advanceTroops(dir.id));
    container.appendChild(btn);
  });
  if (clearing.beast) {
    const beastInfo = document.createElement("p");
    const hp = clearing.beast.health ? ` • ❤️ ${clearing.beast.health}` : "";
    beastInfo.textContent = `Beast present: ${clearing.beast.type} (⚔️ ${clearing.beast.strength}${hp})`;
    container.appendChild(beastInfo);
    const beastBtn = document.createElement("button");
    beastBtn.textContent = `Battle Here (⚡${BATTLE_ENERGY_COST})`;
    beastBtn.className = "danger";
    beastBtn.disabled = player.troops <= 0 || player.energy < BATTLE_ENERGY_COST;
    beastBtn.addEventListener("click", () => battleBeastAtClearing(clearing));
    container.appendChild(beastBtn);
  } else {
    const noBattle = document.createElement("button");
    noBattle.textContent = "Battle Unavailable";
    noBattle.disabled = true;
    noBattle.className = "danger";
    container.appendChild(noBattle);
  }

  const conquestCosts = calculateConquestCost();
  const costBox = document.createElement("div");
  costBox.className = "map-conquest-cost";
  const resourceLines = Object.entries(conquestCosts.resourcesCost)
    .map(([key, amount]) => `${resourceLabelMap[key] || key}: ${amount}`)
    .join(" • ");
  costBox.innerHTML = `
    <strong>Next Conquest</strong>
    <div>Realm size: ${conquestCosts.nextSize}x${conquestCosts.nextSize}</div>
    <div>Cost: ⚡ ${CONQUEST_ENERGY_COST} • 💰 ${conquestCosts.goldCost}</div>
    <div>Needs: ${resourceLines}</div>
  `;
  container.appendChild(costBox);
}

function renderInventorySidebar() {
  const container = document.getElementById("inventoryPanel");
  if (!container) return;
  const resourceBuckets = new Map();
  const categoryNames = {
    fruits: "Fruits",
    meat: "Meat",
    fish: "Fish",
    grains: "Grains",
    sweets: "Sweets",
    ores: "Ores",
    materials: "Materials",
    resources: "Resources",
    trophies: "Trophies",
    other: "Other",
  };

  const materialKeys = new Set(["logs", "stone", "clay"]);
  const trophyKeys = new Set(["stagHorns", "golemCore", "emberleafFur", "roothoundFur", "windclawFeathers"]);

  const resourceWallet = getAllResources();
  resourceDefinitions.forEach(def => {
    const amount = resourceWallet[def.key] || 0;
    if (amount <= 0) return;
    let bucket = "other";
    const foodCat = foodCategoryMap[def.key];
    if (def.group === "ore") bucket = "ores";
    else if (foodCat) bucket = foodCat;
    else if (materialKeys.has(def.key)) bucket = "materials";
    else if (trophyKeys.has(def.key)) bucket = "trophies";
    else bucket = "resources";
    if (!resourceBuckets.has(bucket)) resourceBuckets.set(bucket, []);
    resourceBuckets.get(bucket).push({ ...def, amount });
  });

  const resourceSections = [...resourceBuckets.entries()]
    .map(([bucket, items]) => {
      const title = categoryNames[bucket] || bucket;
      const rows = items
        .map(item => `<div class="resource-row"><span>${item.icon}</span><strong>${item.name}</strong><span>${item.amount}</span></div>`)
        .join("");
      return `
        <div class="inventory-subcard">
          <div class="inventory-card-title">${title}</div>
          <div class="resource-list">${rows}</div>
        </div>`;
    })
    .join("");
  const statsPills = [
    { icon: "❤️", label: "Health", value: `${player.health}%`, cls: "stat-pink" },
    { icon: "💖", label: "Happiness", value: `${player.happiness}%`, cls: "stat-pink" },
    { icon: "⚡", label: "Energy", value: `${player.energy} Energy`, cls: "stat-gold" },
    { icon: "🏦", label: "Gold", value: `${player.gold} Gold`, cls: "stat-gold" },
    { icon: "👥", label: "Population", value: getPopulation(), cls: "stat-gold" },
    { icon: "🛏️", label: "Beds", value: getHousingCapacity(), cls: "stat-gold" },
    { icon: "🛡️", label: "Protection", value: player.protection, cls: "stat-red" },
    { icon: "🪖", label: "Troops", value: player.troops, cls: "stat-red" },
  ]
    .map(
      stat => `
      <div class="inventory-pill ${stat.cls || ""}">
        <span>${stat.icon}</span>
        <div>
          <strong>${stat.value}</strong>
          <small>${stat.label}</small>
        </div>
      </div>`
    )
    .join("");
  container.innerHTML = `
    <div class="inventory-section">
      <div class="inventory-card-title">Realm Status</div>
      <div class="inventory-pills">${statsPills}</div>
    </div>
    <div class="inventory-section">
      <div class="inventory-card-title">Resources</div>
      ${resourceSections || "<p class='inventory-empty'>No resources discovered yet.</p>"}
    </div>
  `;
}

function battleBeastAtClearing(clearing) {
  if (!clearing) return;
  if (player.troops <= 0) {
    logEvent("🪖 No troops available to battle.");
    return;
  }
  if (player.energy < BATTLE_ENERGY_COST) {
    logEvent("⚡ Not enough energy to battle.");
    return;
  }
  spendEnergyAndGold(BATTLE_ENERGY_COST, 0, `⚔️ Battle at the clearing.`, () => {
    handleBeastEncounter(clearing, false);
  });
}

function handleBeastEncounter(clearing, autoTriggered = false) {
  if (!clearing?.beast) {
    if (!autoTriggered) logEvent("✨ No beasts stalk that clearing.");
    return;
  }
  if (player.troops <= 0) {
    if (!autoTriggered) logEvent("🪖 No troops available to confront the beast.");
    return;
  }
  if (!autoTriggered) {
    logEvent(`⚔️ You engage the ${clearing.beast.type} in the clearing.`);
  }
  const beastType = clearing.beast?.type || "Beast";
  const result = resolveBeastEncounter({
    player,
    clearing,
    beast: clearing.beast,
    announce: announceWorldEvent,
  });
  if (result?.error) {
    logEvent(result.error);
    return;
  }
  if (result.victory) {
    logEvent(`🏆 The ${beastType} is slain! Lost ${result.casualties} troops.`);
    clearBeastFromClearing(clearing.id);
  } else {
    logEvent(
      `🩸 The ${beastType} is wounded (${result.damageDealt} dmg, ${result.remainingHealth} health left). Lost ${result.casualties} troops.`
    );
  }
  renderHUD();
}

/////////////////////////////////////
///// ABILITIES & RELIC POWERS /////
/////////////////////////////////////
function renderFactionAbilities() {
  const container = document.getElementById("abilityButtons");
  if (!container) return;
  container.innerHTML = "";
  if (!player?.faction) {
    const notice = document.createElement("p");
    notice.textContent = "Select a faction to unlock abilities.";
    container.appendChild(notice);
    return;
  }
  if (!player.faction.abilities?.length) {
    const notice = document.createElement("p");
    notice.textContent = "No special abilities unlocked.";
    container.appendChild(notice);
    return;
  }
  player.faction.abilities.forEach(ability => {
    const energyCost = ability?.cost?.energy ?? 0;
    const goldCost = ability?.cost?.gold ?? 0;
    const btn = document.createElement("button");
    btn.classList.add("action-ability-button");
    btn.title = ability.desc;
    btn.disabled = player.energy < energyCost || player.gold < goldCost;

    const label = document.createElement("span");
    label.textContent = ability.name;
    const cost = document.createElement("small");
    const costParts = [];
    costParts.push(`⚡ ${energyCost}`);
    costParts.push(`💰 ${goldCost}`);
    cost.textContent = costParts.join(" • ");

    btn.appendChild(label);
    btn.appendChild(cost);
    btn.addEventListener("click", () => executeFactionAbility(ability));
    container.appendChild(btn);
  });
}

function executeFactionAbility(ability) {
  if (!ability) return;
  if (!(player.abilitiesUsedThisTurn instanceof Map)) {
    player.abilitiesUsedThisTurn = new Map();
  }
  const abilityKey = ability.id || ability.name;
  const usesSoFar = player.abilitiesUsedThisTurn.get(abilityKey) || 0;
  const maxUses = ability.usesPerTurn ?? 1;
  if (usesSoFar >= maxUses) {
    logEvent(`♻️ ${ability.name} cannot be invoked again this turn.`);
    return;
  }
  const energyCost = ability?.cost?.energy ?? 0;
  const goldCost = ability?.cost?.gold ?? 0;

  const triggerAbility = () => {
    spendEnergyAndGold(energyCost, goldCost, null, () => {
      if (typeof ability.logic === "function") {
        ability.logic({
          player,
          logEvent,
          updateDerivedStats,
          acquireRelic: acquireRandomRelic,
        });
      } else {
        logEvent(`${ability.name} crackles, but no power responds.`);
      }
      player.abilitiesUsedThisTurn.set(abilityKey, usesSoFar + 1);
      updateDerivedStats();
      renderHUD();
    });
  };
  triggerAbility();
}

function showRelicMenu() {
  const ownedRelics = (player.relics || []).filter(name => name && name !== "None");
  if (!ownedRelics.length) {
    logEvent("No relics to activate.");
    return;
  }
  openActionModal("🔮 Relic Vault", body => {
    const grid = document.createElement("div");
    grid.className = "relic-grid";
    ownedRelics.forEach(name => {
      const relic = relicCatalog.get(name);
      if (!relic) return;
      const energyCost = relic.energyCost ?? 1;
      const used = player.relicsUsedThisTurn instanceof Set && player.relicsUsedThisTurn.has(name);
      const canAfford = player.energy >= energyCost;
      const statusText = used ? "Resting" : canAfford ? "Ready to awaken" : "Need more energy";
      const card = document.createElement("button");
      card.className = "relic-card";
      if (used) card.classList.add("spent");
      if (!canAfford) card.classList.add("locked");
      card.disabled = used || !canAfford;
      card.innerHTML = `
        <strong>${name}</strong>
        <p>${relic.effect || relic.type || "No effect listed."}</p>
        <div class="relic-meta">
          <span>${relic.type || "Relic"}</span>
          <span>⚡ ${energyCost}</span>
        </div>
        <div class="card-status">${statusText}</div>
      `;
      if (!card.disabled) {
        card.addEventListener("click", () => {
          closeActionModal();
          activateRelicPower(name);
        });
      }
      grid.appendChild(card);
    });
    body.appendChild(grid);
  });
}

function activateRelicPower(relicName) {
  const relic = relicCatalog.get(relicName);
  if (!relic) {
    logEvent(`${relicName} has no defined power yet.`);
    return;
  }
  if (!(player.relicsUsedThisTurn instanceof Set)) {
    player.relicsUsedThisTurn = new Set();
  }
  if (player.relicsUsedThisTurn.has(relicName)) {
    logEvent(`${relicName} has already been invoked this turn.`);
    return;
  }
  const energyCost = relic.energyCost ?? 1;
  if (player.energy < energyCost) {
    logEvent("⚡ Not enough energy to awaken that relic.");
    return;
  }
  player.energy -= energyCost;
  player.relicsUsedThisTurn.add(relicName);
  if (typeof relic.logic === "function") {
    relic.logic({
      player,
      logEvent,
    });
    updateDerivedStats();
    renderHUD();
  } else {
    logEvent(`${relicName} glows faintly, but nothing happens.`);
  }
}

function markRelicClaimed(relicName) {
  if (!relicName || relicName === "None") return;
  availableDelveRelics.delete(relicName);
}

function grantRelicToPlayer(relicName) {
  if (!relicName) return false;
  if (!player.relics) player.relics = [];
  if (!player.relics.includes(relicName)) {
    player.relics.push(relicName);
  }
  markRelicClaimed(relicName);
  logEvent(`🔮 Acquired ${relicName}!`);
  return true;
}

function acquireRandomRelic(options = {}) {
  const { reason = "delve" } = options;
  const pool = [...availableDelveRelics];
  if (!pool.length) return null;
  const relicName = pool[Math.floor(Math.random() * pool.length)];
  grantRelicToPlayer(relicName);
  return relicName;
}

function hasAvailableDelveRelics() {
  return availableDelveRelics.size > 0;
}

/////////////////////////////////////
///        ACTION MODAL UI        ///
/////////////////////////////////////
let actionModal = null;
let actionModalTitle = null;
let actionModalBody = null;
function openActionModal(title, builder) {
  if (!actionModal || !actionModalBody) return;
  actionModal.classList.add("open");
  if (actionModalTitle) {
    actionModalTitle.textContent = title;
  }
  actionModalBody.innerHTML = "";
  if (typeof builder === "function") {
    builder(actionModalBody);
  }
}

function closeActionModal() {
  if (actionModal) {
    actionModal.classList.remove("open");
  }
  if (actionModalBody) {
    actionModalBody.innerHTML = "";
  }
}

/////////////////////////////////////
///         ACTION ROUTER         ///
/////////////////////////////////////
function handleAction(action) {
  switch (action) {
    case "build":
      buildMenu();
      break;
    case "harvest":
      harvestCrops();
      break;
    case "festival":
      startFestivalAction();
      break;
    case "recruit":
      recruitTroops();
      break;
    case "delve":
      attemptRelicDelve();
      break;
    case "use-relic":
      showRelicMenu();
      break;
    case "conquest":
      attemptConquest();
      break;
    case "end-turn":
      endTurn();
      break;
  }
  renderHUD();
}
/////////////////////////////////////
///     ECONOMY & LOG HELPERS     ///
/////////////////////////////////////
function harvestCrops() {
  const limit = player.harvestLimit || 0;
  if (player.harvestsLeft <= 0) {
    logEvent("🌱 The fields need rest. Wait until next turn to harvest again.");
    return;
  }
  const { totals } = calculateProductionTotals();
  if (!Object.keys(totals).length) {
    logEvent("🌾 Your production buildings have nothing ready to collect.");
    return;
  }
  const adjustedTotals = applyEventProductionModifiers(totals);
  const eventBoosts = getActiveEvents();
  const eventText = eventBoosts.length
    ? ` Boosted by ${eventBoosts.map(event => event.name).join(", ")}.`
    : "";
  spendEnergyAndGold(HARVEST_ENERGY_COST, 0, null, () => {
    depositProducedResources(adjustedTotals);
    player.harvestsLeft = Math.max(0, player.harvestsLeft - 1);
    logEvent(
      `🌾 Harvest collected ${formatResourceTotals(adjustedTotals)} (${player.harvestsLeft}/${limit} harvests left).${eventText}`
    );
    grantLegacyHarvestCrate();
    recalcHarvestedGoodsValue();
    renderResourcePanel();
  });
}

function grantLegacyHarvestCrate() {
  const goodsPool = getActiveHarvestGoods();
  if (!goodsPool.length) return;
  const totalWeight = goodsPool.reduce((sum, good) => sum + (good.weight || 1), 0);
  let roll = Math.random() * totalWeight;
  let bounty = goodsPool[0];
  for (const good of goodsPool) {
    roll -= good.weight || 1;
    if (roll <= 0) {
      bounty = good;
      break;
    }
  }
  if (!player.harvestedGoods) player.harvestedGoods = {};
  player.harvestedGoods[bounty.key] = (player.harvestedGoods[bounty.key] || 0) + 1;
  logEvent(`📦 Bonus crate recovered: ${bounty.emoji} ${bounty.name}.`);
}

function startFestivalAction() {
  if (!hasResources(FESTIVAL_COST)) {
    logEvent("🎉 You need more fruits and wheat to host a festival.");
    return;
  }
  if (!spendResources(FESTIVAL_COST)) {
    logEvent("🎉 Supplies vanished before the festivities could begin.");
    return;
  }
  startFestival(announceWorldEvent);
  logEvent("🎊 Festival preparations begin across the realm.");
  renderResourcePanel();
  renderHUD();
}

function sendGiftCourier(selectedKey, onSuccess) {
  if (player.giftCouriers <= 0) {
    logEvent("🏚️ You need to establish a courier before requesting gifts.");
    return;
  }
  if (player.courierRuns <= 0) {
    logEvent("🚫 All courier runs have been used this turn.");
    return;
  }
  if (!selectedKey) {
    logEvent("❌ Choose goods to send first.");
    return;
  }
  const available = player.harvestedGoods[selectedKey] || 0;
  if (available <= 0) {
    logEvent("🌾 No harvested goods ready to send.");
    return;
  }
  const good = harvestGoodsMap.get(selectedKey);
  if (!good) {
    logEvent("❌ Unknown goods cannot be offered.");
    return;
  }
  const economyMultiplier = 1;
  const courierStrength = 1 + player.giftCouriers * 0.15;
  const goldEarned = Math.round(good.value * economyMultiplier * courierStrength);
  spendEnergyAndGold(
    GIFT_RUN_COST.energy,
    GIFT_RUN_COST.gold,
    `🎁 Sent ${good.emoji} ${good.name} to the Keep.`,
    () => {
      player.harvestedGoods[selectedKey] = Math.max(
        0,
        (player.harvestedGoods[selectedKey] || 0) - 1
      );
      player.courierRuns = Math.max(0, player.courierRuns - 1);
      recalcHarvestedGoodsValue();
      const addedGold = grantGold(goldEarned);
      const capNote = addedGold < goldEarned ? " (overflow to reserve)" : "";
      logEvent(
        `💹 Couriers return with ${addedGold} gold${capNote} (Couriers ×${courierStrength.toFixed(
          2
        )}).`
      );
      if (typeof onSuccess === "function") onSuccess();
      renderHUD();
    }
  );
}

function openGiftCrate(onSuccess) {
  if (player.giftsWaiting <= 0) {
    logEvent("📭 No gifts have arrived!");
    return;
  }
  const giftItem = giftItems[Math.floor(Math.random() * giftItems.length)];
  const boosts = giftItem.statBoosts || {};
  const resources = giftItem.resourceRewards || {};
  spendEnergyAndGold(
    0,
    0,
    null,
    () => {
      player.giftsWaiting = Math.max(0, player.giftsWaiting - 1);
      if (boosts.happiness) applyHappinessDelta(boosts.happiness);
      if (boosts.protection) player.protection += boosts.protection;
      if (boosts.troops) player.troops += boosts.troops;
      if (boosts.energy) player.energy += boosts.energy;
      Object.entries(resources).forEach(([key, amount]) => addResource(key, amount));
      const parts = [];
      parts.push(`🎁 ${giftItem.name}`);
      if (giftItem.price) {
        const addedGold = grantGold(giftItem.price);
        parts.push(`+${addedGold} gold`);
      }
      const bonusNames = [];
      if (boosts.happiness) bonusNames.push(`+${boosts.happiness} happiness`);
      if (boosts.protection) bonusNames.push(`+${boosts.protection} protection`);
      if (boosts.troops) bonusNames.push(`+${boosts.troops} troops`);
      if (boosts.energy) bonusNames.push(`+${boosts.energy} energy`);
      Object.entries(resources).forEach(([key, amount]) => bonusNames.push(`+${amount} ${key}`));
      const detail = bonusNames.length ? ` (${bonusNames.join(", ")})` : "";
      logEvent(`${parts.join(" ")}${detail}`);
      if (typeof onSuccess === "function") onSuccess();
      renderHUD();
    }
  );
}

function recruitTroops() {
  const recruits = Math.max(1, 3 + (player.recruitBonus || 0));
  spendEnergyAndGold(
    RECRUIT_COST.energy,
    RECRUIT_COST.gold,
    `🪖 Recruited ${recruits} fresh troops.`,
    () => {
      player.troops += recruits;
    }
  );
}

function attemptRelicDelve() {
  if (!hasAvailableDelveRelics()) {
    logEvent("🕳️ There are no undiscovered relics left to delve.");
    return;
  }
  spendEnergyAndGold(
    RELIC_DELVE_COST.energy,
    RELIC_DELVE_COST.gold,
    "🕳️ Crews descend into forgotten ruins...",
    () => {
      const relic = acquireRandomRelic({ reason: "delve" });
      if (relic) {
        logEvent(`🔮 Unearthed ${relic} during the delve!`);
      } else {
        logEvent("🥀 The expedition returned empty-handed.");
      }
      renderHUD();
    }
  );
}

function showInventoryPanel() {
  openActionModal("📦 Inventory Ledger", body => {
    const info = document.createElement("div");
    info.className = "inventory-info";
    const categories = calculateFoodCategories();
    const categoryMarkup = Object.entries(categories)
      .map(([label, data]) => {
        const items = data.items
          .map(entry => `<div class="food-item">• ${entry.name}: ${entry.amount}</div>`)
          .join("");
        return `<div class="food-category"><strong>${data.icon} ${label}: ${data.total}</strong>${items ? `<div class="food-items">${items}</div>` : ""}</div>`;
      })
      .join("");
    info.innerHTML = `
      <div>🎁 Gifts waiting: <strong>${player.giftsWaiting}</strong></div>
      <div>🌾 Harvests left: <strong>${player.harvestsLeft}/${player.harvestLimit || 0}</strong></div>
      <div>📦 Courier runs left: <strong>${player.courierRuns}/${player.giftCouriers || 0}</strong></div>
      <div>🕊️ Couriers hired: <strong>${player.giftCouriers || 0}</strong></div>
      <div>🏦 Gold Storage: <strong>${player.gold}/${getGoldStorageCapacity()}</strong></div>
      <div class="food-breakdown">${categoryMarkup}</div>
    `;
    const goodsGrid = document.createElement("div");
    goodsGrid.className = "inventory-goods";
    getHarvestCatalog().forEach(g => {
      const item = document.createElement("div");
      item.className = "inventory-good";
      item.innerHTML = `<span>${g.emoji}</span>
        <div>
          <strong>${g.name}</strong>
          <small>${(player.harvestedGoods && player.harvestedGoods[g.key]) || 0} crate(s)</small>
        </div>`;
      goodsGrid.appendChild(item);
    });
    body.appendChild(info);
    body.appendChild(goodsGrid);
  });
}

function showGiftModal() {
  openActionModal("🏛️ Keeper's Gifts", body => {
    renderGiftContent(body);
  });
}

function renderGiftContent(container) {
  container.innerHTML = "";
  const summary = document.createElement("div");
  summary.className = "inventory-info commerce-info";
  summary.innerHTML = `
    <div>🕊️ Couriers: <strong>${player.giftCouriers || 0}</strong></div>
    <div>📦 Runs left: <strong>${player.courierRuns}/${player.giftCouriers || 0}</strong></div>
    <div>📦 Goods stored: <strong>${getTotalHarvestedGoods()}</strong></div>
    <div>🎁 Gifts waiting: <strong>${player.giftsWaiting}</strong></div>
  `;
  container.appendChild(summary);
  const quickTip = document.createElement("p");
  quickTip.className = "commerce-note";
  quickTip.textContent = "Tip: use 📥 Collect Gifts in the main action list for instant deliveries.";
  container.appendChild(quickTip);
  if (player.faction && factionHarvestGoods[player.faction.name]) {
    const note = document.createElement("p");
    note.className = "commerce-note";
    const names = factionHarvestGoods[player.faction.name].map(g => g.name).join(", ");
    note.textContent = `${player.faction.emoji} Specialty harvests active: ${names}.`;
    container.appendChild(note);
  }

  const exportsSection = document.createElement("section");
  exportsSection.className = "commerce-section";
  exportsSection.innerHTML = "<h3>Send Offerings</h3>";
  const exportable = getHarvestCatalog().filter(
    good => (player.harvestedGoods && player.harvestedGoods[good.key]) > 0
  );
  if (!exportable.length) {
    const emptyNote = document.createElement("p");
    emptyNote.className = "commerce-note";
    emptyNote.textContent = "No goods are ready. Harvest fields to create stockpiles.";
    exportsSection.appendChild(emptyNote);
  } else {
    const goodsGrid = document.createElement("div");
    goodsGrid.className = "inventory-goods";
    const economyMultiplier = 1;
    const courierStrength = 1 + (player.giftCouriers || 0) * 0.15;
    exportable.forEach(good => {
      const count = (player.harvestedGoods && player.harvestedGoods[good.key]) || 0;
      const payout = Math.round(good.value * economyMultiplier * courierStrength);
      const card = document.createElement("div");
      card.className = "inventory-good commerce-good";
      card.innerHTML = `
        <span>${good.emoji}</span>
        <div>
          <strong>${good.name}</strong>
          <small>${count} crate(s)</small>
          <small>≈ ${payout} gold</small>
        </div>
      `;
      const button = document.createElement("button");
      button.textContent = `Dispatch Courier (⚡${GIFT_RUN_COST.energy})`;
      const disabled =
        player.giftCouriers <= 0 ||
        player.courierRuns <= 0 ||
        count <= 0 ||
        player.energy < GIFT_RUN_COST.energy;
      button.disabled = disabled;
      button.addEventListener("click", () => sendGiftCourier(good.key, () => renderGiftContent(container)));
      card.appendChild(button);
      goodsGrid.appendChild(card);
    });
    exportsSection.appendChild(goodsGrid);
  }
  if (player.giftCouriers <= 0) {
    const note = document.createElement("p");
    note.className = "commerce-note";
    note.textContent = "Construct more civic hubs to attract couriers.";
    exportsSection.appendChild(note);
  }

  const importSection = document.createElement("section");
  importSection.className = "commerce-section";
  importSection.innerHTML = "<h3>Gifts for the Keep</h3>";
  const importInfo = document.createElement("p");
  importInfo.textContent = "Collect parcels from loyal subjects for random boons.";
  importSection.appendChild(importInfo);
  const importBtn = document.createElement("button");
  importBtn.textContent =
    player.giftsWaiting > 0 ? `Collect Gift (${player.giftsWaiting} waiting)` : "No gifts ready";
  importBtn.disabled = player.giftsWaiting <= 0;
  importBtn.addEventListener("click", () => openGiftCrate(() => renderGiftContent(container)));
  importSection.appendChild(importBtn);
  const importHelp = document.createElement("p");
  importHelp.className = "commerce-note";
  importHelp.textContent = "Gifts can include troops, happiness, protection, and gold.";
  importSection.appendChild(importHelp);

  const splitWrapper = document.createElement("div");
  splitWrapper.className = "commerce-split";
  const leftColumn = document.createElement("div");
  leftColumn.className = "commerce-column";
  const rightColumn = document.createElement("div");
  rightColumn.className = "commerce-column";
  leftColumn.appendChild(exportsSection);
  rightColumn.appendChild(importSection);
  splitWrapper.appendChild(leftColumn);
  splitWrapper.appendChild(rightColumn);
  container.appendChild(splitWrapper);
}

function recalcHarvestedGoodsValue() {
  const total = Object.entries(player.harvestedGoods || {}).reduce((sum, [key, count]) => {
    const good = harvestGoodsMap.get(key);
    if (!good) return sum;
    return sum + good.value * count;
  }, 0);
  player.harvestedGoodsValue = total;
}

function getTotalHarvestedGoods() {
  return Object.values(player.harvestedGoods || {}).reduce((sum, count) => sum + count, 0);
}

function canPayActionCost(btn) {
  const energyCost = Number(btn?.dataset?.costEnergy || 0);
  const goldCost = Number(btn?.dataset?.costGold || 0);
  if (energyCost && player.energy < energyCost) return false;
  if (goldCost && player.gold < goldCost) return false;
  return true;
}

function hasBuildableOptions() {
  const clearing = getSelectedClearing();
  if (!clearing) return false;
  const structuresHere = getStructuresInClearing(clearing.id);
  return buildingDefinitions.some(def => evaluateBlueprintAvailability(def, clearing, structuresHere).canBuild);
}

function canHarvestNow() {
  const limit = player.harvestLimit || 0;
  if (!limit || player.harvestsLeft <= 0) return false;
  return getProductionEntries().length > 0;
}

function hasGiftOpportunity() {
  const hasGifts = player.giftsWaiting > 0;
  const canSend =
    (player.giftCouriers || 0) > 0 &&
    (player.courierRuns || 0) > 0 &&
    getTotalHarvestedGoods() > 0;
  return hasGifts || canSend;
}

function hasUsableRelic() {
  return (player.relics || []).some(name => name && name !== "None");
}

function formatActionCost(btn) {
  const custom = btn?.dataset?.costCustom;
  if (custom) return custom;
  const energy = Number(btn?.dataset?.costEnergy || 0);
  const gold = Number(btn?.dataset?.costGold || 0);
  const parts = [];
  if (energy) parts.push(`⚡${energy}`);
  if (gold) parts.push(`💰${gold}`);
  return parts.length ? parts.join(" • ") : "Free";
}

function updateActionIndicators() {
  document.querySelectorAll("#actionButtons button").forEach(btn => {
    const actionId = btn.dataset.action;
    const labelEl = btn.querySelector("span");
    const detailEl = btn.querySelector("small");
    if (!detailEl) return;
    if (labelEl?.dataset?.defaultText && !labelEl.textContent) {
      labelEl.textContent = labelEl.dataset.defaultText;
    }
    const costText = `Cost: ${formatActionCost(btn)}`;
    const baseDetail = detailEl.dataset.defaultText || "";
    let detailText = baseDetail ? `${costText} • ${baseDetail}` : costText;
    let canUse = canPayActionCost(btn);

  switch (actionId) {
      case "harvest":
        if (labelEl) {
          labelEl.textContent = `🌾 Harvest (${player.harvestsLeft}/${player.harvestLimit || 0})`;
        }
        detailText += ` • Production sites: ${getProductionEntries().length}`;
        if (!canHarvestNow()) {
          detailText += " • Build production structures to unlock harvests.";
          canUse = false;
        }
        break;
      case "build":
        if (!selectedClearingId) {
          detailText += " • Select a clearing on the map.";
          canUse = false;
        } else if (!hasBuildableOptions()) {
          detailText += " • No structures available for that clearing.";
          canUse = false;
        }
        break;
      case "festival":
        detailText += " • Costs fruits & wheat";
        if (!hasResources(FESTIVAL_COST)) {
          detailText += " • Need more supplies.";
          canUse = false;
        }
        break;
      case "delve":
        if (labelEl) {
          labelEl.textContent = `🕳️ Delve (${availableDelveRelics.size} unclaimed)`;
        }
        if (!hasAvailableDelveRelics()) {
          detailText += " • Vaults exhausted.";
          canUse = false;
        }
        break;
      case "recruit":
        detailText += ` • Gain ${Math.max(1, 3 + (player.recruitBonus || 0))} troops`;
        break;
      case "use-relic": {
        const ownedRelics = (player.relics || []).filter(name => name && name !== "None").length;
        detailText += ` • Relics owned: ${ownedRelics}`;
        if (!ownedRelics) {
          detailText += " • No relics available.";
          canUse = false;
        }
        break;
      }
      case "end-turn":
        detailText = "Recover energy, refresh harvests and trade missions.";
        break;
      default:
        break;
    }
    detailEl.textContent = detailText;
    btn.disabled = !canUse;
  });
}

function buildMenu() {
  const clearing = getSelectedClearing();
  if (!clearing) {
    logEvent("📍 Select a clearing on the map before building.");
    return;
  }
  const structuresHere = getStructuresInClearing(clearing.id);

  // DEBUG: list all blueprints and why they are not buildable (temporary)
  console.groupCollapsed("DEBUG: build options for clearing", clearing.id);
  buildingDefinitions.forEach(def => {
    const info = evaluateBlueprintAvailability(def, clearing, structuresHere);
    console.log(`${def.name || def.key}: canBuild=${info.canBuild} reason="${info.reason}" cost=`, info.cost);
  });
  console.groupEnd();
  openActionModal(`🔨 Build in this Clearing`, body => {
    const summary = document.createElement("p");
    summary.textContent = `Terrain: ${clearing.terrain}${clearing.rarity ? ` • ${clearing.rarity}` : ""} • Structures: ${structuresHere.length}/5`;
    summary.className = "clearing-summary";
    body.appendChild(summary);
    const typeOrder = ["housing", "production", "utility", "research", "commerce", "military", "culture", "other"];
    const labelMap = {
      housing: "Housing",
      production: "Production",
      utility: "Utility",
      research: "Research",
      commerce: "Commerce",
      military: "Military",
      culture: "Culture",
      other: "Other",
    };
    const grouped = new Map();
    buildingDefinitions.forEach(def => {
      if (!hasBlueprint(def.key)) return;
      const type = def.type || "other";
      if (!grouped.has(type)) grouped.set(type, []);
      grouped.get(type).push(def);
    });
    const orderedTypes = [...typeOrder, ...grouped.keys().filter(k => !typeOrder.includes(k))];
    orderedTypes.forEach(type => {
      const defs = grouped.get(type);
      if (!defs || !defs.length) return;
      const header = document.createElement("h4");
      header.textContent = labelMap[type] || type;
      body.appendChild(header);
      const grid = document.createElement("div");
      grid.className = "build-grid";
      defs.forEach(def => {
        const { canBuild, reason, cost } = evaluateBlueprintAvailability(def, clearing, structuresHere);
        const card = document.createElement("button");
        card.className = "build-card";
        card.disabled = !canBuild;
        card.innerHTML = `
          <strong>${def.icon || "🏗️"} ${def.name}</strong>
          <p>${def.type === "housing" ? `+${def.beds || 0} beds` : def.produces ? formatProductionOutput(def) : ""}</p>
          ${renderTerrainSupport(def)}
          <div class="build-cost">${renderCostLines(cost)}</div>
          ${reason && !canBuild ? `<small class="build-locked">${reason}</small>` : ""}
        `;
        if (canBuild) {
          card.addEventListener("click", () => {
            closeActionModal();
            executeConstruction(def, clearing);
          });
        }
        grid.appendChild(card);
      });
      body.appendChild(grid);
    });
  });
}

function formatProductionOutput(definition) {
  if (!definition?.produces) return "";
  return Object.entries(definition.produces)
    .map(([key, amount]) => `${resourceLabelMap[key] || key}: +${amount}`)
    .join("<br>");
}

function renderTerrainSupport(definition) {
  if (!definition.supportedTerrains) return "";
  return `<small>Terrains: ${definition.supportedTerrains.join(", ")}</small>`;
}

function renderCostLines(cost = {}) {
  if (!Object.keys(cost).length) return "Cost: —";
  return Object.entries(cost)
    .map(([resource, amount]) => `${resourceLabelMap[resource] || resource}: ${amount}`)
    .join("<br>");
}

function executeConstruction(definition, clearing) {
  const result = constructBuilding({ clearingId: clearing.id, blueprintKey: definition.key });
  if (!result.success) {
    logEvent(`🚫 Could not build ${definition.name}: ${result.reason || "unknown issue"}.`);
    return;
  }
  if (!Array.isArray(player.buildings)) player.buildings = [];
  player.buildings.push(definition.name);
  logEvent(`${definition.icon || "🏗️"} Built ${definition.name} in the clearing.`);
  if (definition.courierBonus) {
    player.giftCouriers = Math.max(0, (player.giftCouriers || 0) + definition.courierBonus);
    player.courierRuns = player.giftCouriers;
    logEvent(`🕊️ Courier capacity increased to ${player.giftCouriers}.`);
  }
  if (definition.titheBonus) {
    player.keepTithe = Math.max(0, (player.keepTithe || 0) + definition.titheBonus);
    logEvent(`🏦 Keep tithes grow by ${definition.titheBonus}.`);
  }
  if (definition.type === "production") {
    refreshHarvestAvailability();
  }
  renderHUD();
}

function spendEnergyAndGold(energyCost, goldCost, msg, onSuccess) {
  if (player.energy < energyCost) {
    logEvent("⚡ Not enough energy!");
    return false;
  }
  if (player.gold < goldCost) {
    logEvent("💰 Not enough gold!");
    return false;
  }
  player.energy -= energyCost;
  player.gold -= goldCost;
  if (msg) {
    logEvent(msg);
  }
  if (onSuccess) {
    onSuccess();
  }
  return true;
}
function logEvent(msg) {
  const log = document.getElementById("event-log");
  const entry = document.createElement("p");
  entry.textContent = msg;
  entry.classList.add("log-entry");
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function queuePlayerPrompt(prompt) {
  if (!Array.isArray(player.pendingPlayerPrompts)) {
    player.pendingPlayerPrompts = [];
  }
  if (
    prompt.type &&
    prompt.faction &&
    player.pendingPlayerPrompts.some(p => p.type === prompt.type && p.faction === prompt.faction)
  ) {
    return;
  }
  player.pendingPlayerPrompts.push(prompt);
}

function showNextPlayerPrompt() {
  if (!Array.isArray(player.pendingPlayerPrompts) || !player.pendingPlayerPrompts.length) return;
  const prompt = player.pendingPlayerPrompts[0];
  openActionModal(prompt.title, body => {
    const message = document.createElement("p");
    message.textContent = prompt.message;
    body.appendChild(message);
    const controls = document.createElement("div");
    controls.className = "commerce-section";
    const acceptBtn = document.createElement("button");
    acceptBtn.textContent = prompt.acceptLabel || "Accept";
    acceptBtn.addEventListener("click", () => {
      prompt.onAccept?.();
      player.pendingPlayerPrompts.shift();
      closeActionModal();
      showNextPlayerPrompt();
    });
    const declineBtn = document.createElement("button");
    declineBtn.textContent = prompt.declineLabel || "Decline";
    declineBtn.addEventListener("click", () => {
      prompt.onDecline?.();
      player.pendingPlayerPrompts.shift();
      closeActionModal();
      showNextPlayerPrompt();
    });
    controls.appendChild(acceptBtn);
    controls.appendChild(declineBtn);
    body.appendChild(controls);
  });
}

function endTurn() {
  const effects = aggregateEventEffects();
  const restored = Math.round(calcStartingEnergy(player) * effects.energyGainMultiplier);
  player.energy += restored;
  logEvent(`🌙 Turn ended. Recovered ${restored} energy (total ${player.energy}).`);
  if (player.keepTithe) {
    const income = grantGold(player.keepTithe);
    const overflowNote = income < player.keepTithe ? " Your vaults overflow." : "";
    logEvent(`📦 Keep tithes delivered ${income} gold.${overflowNote}`);
  }
  if (player.relicsUsedThisTurn?.clear) {
    player.relicsUsedThisTurn.clear();
  } else {
    player.relicsUsedThisTurn = new Set();
  }
  if (player.abilitiesUsedThisTurn?.clear) {
    player.abilitiesUsedThisTurn.clear();
  } else {
    player.abilitiesUsedThisTurn = new Map();
  }
  player.harvestsLeft = player.harvestLimit || 0;
  player.courierRuns = player.giftCouriers || 0;
  player.giftsWaiting = Math.round((Math.floor(Math.random() * 3) + 1) * effects.giftMultiplier);
  tickPopulation();
  consumeFoodForPopulation();
  advanceEvents(announceWorldEvent);
  const triggered = maybeTriggerRandomEvent(announceWorldEvent, getCurrentSeason().key);
  if (triggered?.effects?.spawnBeast) {
    spawnRandomBeast();
  }
  turnCounter += 1;
  if (turnCounter % SEASON_LENGTH === 0) {
    nextSeason();
  }
  const season = getCurrentSeason();
  const homeless = getHomeless();
  if (homeless > 0 && season.homelessPenalty > 1) {
    const penalty = Math.max(1, Math.round(homeless * 0.02 * season.homelessPenalty));
    applyHappinessDelta(-penalty);
    logEvent(`❄️ Seasonal hardship hits the homeless (-${penalty} happiness).`);
  }
  welcomeNewSettlers();
  handleUnhappyExodus();
  refreshHarvestAvailability();
  renderHUD();
  showNextPlayerPrompt();
}

/////////////////////////////////////
///// PLAYER STATE & INIT /////
/////////////////////////////////////
let player = {
  faction: null,
  energy: 0,
  gold: 0,
  goldStorageBase: BASE_GOLD_STORAGE,
  goldStorageBonus: 0,
  troops: 0,
  happiness: 0,
  health: 100,
  protection: 0,
  giftsWaiting: 0,
  relics: [],
  buildings: [],
  keepTithe: 0,
  economyBonus: 0,
  relicsUsedThisTurn: new Set(),
  abilitiesUsedThisTurn: new Map(),
  harvestsLeft: 0,
  harvestLimit: 0,
  harvestedGoods: {},
  harvestedGoodsValue: 0,
  giftCouriers: 1,
  courierRuns: 1,
  extraHarvestGoods: [],
  recruitBonus: 0,
  energyBonus: 0,
  battleBonus: 0,
  relicShield: 0,
  pendingPlayerPrompts: [],
  unlockedAbilityTags: new Set(),
  garrisonedClearings: new Set(),
  gainGold(amount) {
    return grantGold(amount, this);
  },
};
document.addEventListener("DOMContentLoaded", () => {
  actionModal = document.getElementById("actionModal");
  actionModalTitle = document.getElementById("actionModalTitle");
  actionModalBody = document.getElementById("actionModalBody");
  const closeActionBtn = document.getElementById("closeActionModal");
  if (closeActionBtn) {
    closeActionBtn.addEventListener("click", closeActionModal);
  }
  if (actionModal) {
    actionModal.addEventListener("click", event => {
      if (event.target === actionModal) {
        closeActionModal();
      }
    });
  }
  initMapUI({
    gridElementId: "clearingGrid",
    tooltipElementId: "clearingTooltip",
    onSelect: id => {
      selectedClearingId = id;
      const c = getClearingById(id);
      if (c && c.owner === player.faction.name) {
        garrisonClearing(id, { silent: true });
      }
      renderHUD();
    },
  });
  const playableFactions = factions.filter(f => f.playable !== false && !f.earlyAccess);
  const chosen = localStorage.getItem("chosenFaction");
  const fallbackFaction = playableFactions[0] || factions[0];
  const faction =
    playableFactions.find(f => f.name === chosen) ||
    fallbackFaction;
  startGame(faction);
  initResetButton();
}); 
function startGame(faction) {
  resetEventState();
  resetCombatState();
  worldEventFeed = [];
  startPlayerGame({
    player,
    faction,
    updateDerivedStats,
    renderHUD,
    logEvent,
    handleAction,
    renderFactionAbilities,
  });
  const { playerClearingId } = initializeWorldMap(faction, [faction]);
  selectedClearingId = playerClearingId ?? null;
  player.currentClearingId = selectedClearingId;
  player.garrisonedClearings = new Set();
  if (playerClearingId) {
    garrisonClearing(playerClearingId, { silent: true });
  }
  player.goldStorageBase = BASE_GOLD_STORAGE;
  player.goldStorageBonus = 0;
  enforceGoldCapacity();
  const loaded = loadGameState();
  refreshHarvestAvailability();
  renderHUD();
  renderWorldEventFeed();
  if (!loaded) {
    markRelicClaimed(faction.startingRelic);
    player.extraHarvestGoods = [];
    player.pendingPlayerPrompts = [];
  }
}

function initResetButton() {
  const btn = document.getElementById("resetGameBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  });
}
