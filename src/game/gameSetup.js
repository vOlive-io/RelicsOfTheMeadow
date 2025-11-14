/////////////////////////////////////
///// GAME START HELPERS /////
/////////////////////////////////////
import { calcStartingEnergy } from "../utils/statCalc.js";

export function startPlayerGame({ player, faction, updateDerivedStats, renderHUD, logEvent, handleAction }) {
  applyStartingStats(player, faction);
  player.relics = [faction.startingRelic || "None"];
  player.buildings = [];
  player.declaredWars = [];
  player.alliances = [];
  updateDerivedStats();
  player.energy = calcStartingEnergy(player);
  renderHUD();
  setupActionButtons(handleAction);
  logEvent(`🌿 Welcome, ${faction.name}!`);
}

export function setupActionButtons(handleAction) {
  const actionArea = document.getElementById("actionButtons");
  if (!actionArea) return;
  actionArea.innerHTML = "";
  const actions = [
    { id: "diplomacy", label: "🕊️ Diplomacy" },
    { id: "battle", label: "🛡️ Battle" },
    { id: "build", label: "🔨 Build" },
    { id: "trade", label: "📦 Trade" },
    { id: "collect", label: "💰 Collect Imports" },
    { id: "use-relic", label: "🔮 Use Relic" },
    { id: "faction-abilities", label: "🧠 Abilities" },
  ];
  actions.forEach(a => {
    const btn = document.createElement("button");
    btn.textContent = a.label;
    btn.dataset.action = a.id;
    btn.addEventListener("click", () => handleAction(a.id));
    actionArea.appendChild(btn);
  });
  const endTurnBtn = document.getElementById("endTurnBtn");
  if (endTurnBtn) {
    endTurnBtn.addEventListener("click", () => handleAction("end-turn"));
  }
}

function applyStartingStats(player, faction) {
  player.faction = faction;
  player.gold = parseTraitValue(faction?.defaultTraits?.economy) * 250;
  player.troops = parseTraitValue(faction?.defaultTraits?.prowess) * 10;
  player.happiness = 1;
  player.protection = 1;
  player.imports = Math.floor(Math.random() * 5) + 1;
  player.canTrade = true;
  player.relics = [];
}

function parseTraitValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}
