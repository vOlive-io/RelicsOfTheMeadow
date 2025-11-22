/////////////////////////////////////
/// MODULE IMPORTS               ///
/////////////////////////////////////
import { resources } from "../data/resources.js";

/////////////////////////////////////
/// STATE                         ///
/////////////////////////////////////
const STARTER_STOCK = {
  logs: 180,
  stone: 140,
  clay: 80,
  meadowheartOpal: 8,
  mythril: 4,
  goldOre: 6,
  fruits: 20,
  wheat: 20,
  meat: 12,
};

let wallet = Object.fromEntries(resources.map(r => [r.key, 0]));
let discoveredResources = new Set();

/////////////////////////////////////
/// HELPERS                       ///
/////////////////////////////////////
function markDiscovered(key) {
  if (!key) return;
  discoveredResources.add(key);
}

/////////////////////////////////////
/// API                           ///
/////////////////////////////////////
export function resetResources() {
  wallet = Object.fromEntries(resources.map(r => [r.key, 0]));
  discoveredResources = new Set();
  Object.entries(STARTER_STOCK).forEach(([key, amount]) => {
    if (wallet.hasOwnProperty(key)) {
      wallet[key] = amount;
      markDiscovered(key);
    }
  });
}

export function addResource(key, amount) {
  if (!wallet.hasOwnProperty(key) || typeof amount !== "number") return;
  wallet[key] = Math.max(0, wallet[key] + amount);
  if (amount > 0) {
    markDiscovered(key);
  }
}

export function spendResource(key, amount) {
  if (!wallet.hasOwnProperty(key) || typeof amount !== "number") return false;
  if (wallet[key] < amount) return false;
  wallet[key] -= amount;
  return true;
}

export function hasResources(cost = {}) {
  return Object.entries(cost).every(([key, amount]) => wallet[key] >= amount);
}

export function spendResources(cost = {}) {
  if (!hasResources(cost)) return false;
  Object.entries(cost).forEach(([key, amount]) => {
    wallet[key] -= amount;
  });
  return true;
}

export function getResourceAmount(key) {
  return wallet[key] ?? 0;
}

export function getAllResources() {
  return { ...wallet };
}

export function getResourceDefinitions() {
  return resources;
}

export function getDiscoveredResources() {
  return new Set(discoveredResources);
}

export function markResourceDiscovered(key) {
  markDiscovered(key);
}

export function exportResourceState() {
  return {
    wallet: { ...wallet },
    discovered: [...discoveredResources],
  };
}

export function importResourceState(state = {}) {
  if (state.wallet) {
    wallet = { ...wallet, ...state.wallet };
  }
  discoveredResources = new Set(state.discovered || []);
}
