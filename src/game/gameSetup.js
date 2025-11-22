/////////////////////////////////////
///// GAME START HELPERS /////
/////////////////////////////////////
import { calcStartingEnergy } from "../utils/statCalc.js";
import { resetResources } from "../managers/resourceManager.js";
import { resetPopulationState, getHappiness, getHealth } from "../managers/populationManager.js";
import { resetCraftingState } from "../managers/craftingManager.js";

export function startPlayerGame({
  player,
  faction,
  updateDerivedStats,
  renderHUD,
  logEvent,
  handleAction,
  renderFactionAbilities,
}) {
  applyStartingStats(player, faction);
  player.relics = [faction.startingRelic || "None"];
  player.buildings = [];
  player.declaredWars = [];
  player.alliances = [];
  player.keepTithe = 0;
  player.economyBonus = 0;
  player.relicsUsedThisTurn = new Set();
  player.abilitiesUsedThisTurn = new Map();
  player.harvestLimit = 0;
  player.harvestsLeft = 0;
  player.harvestedGoods = {};
  player.harvestedGoodsValue = 0;
  player.giftCouriers = 1;
  player.courierRuns = 1;
  player.extraHarvestGoods = [];
  player.recruitBonus = 0;
  player.energyBonus = 0;
  player.battleBonus = 0;
  player.relicShield = 0;
  player.pendingPeaceOffers = [];
  player.unlockedAbilityTags = new Set();
  player.garrisonedClearings = new Set();
  resetResources();
  resetPopulationState();
  resetCraftingState();
  updateDerivedStats();
  player.energy = calcStartingEnergy(player);
  player.happiness = getHappiness();
  player.health = getHealth();
  setupActionButtons(handleAction);
  renderHUD();
  logEvent(`🌿 Welcome, ${faction.name}!`);
}

export function setupActionButtons(handleAction) {
  const actionArea = document.getElementById("actionButtons");
  if (!actionArea) return;
  actionArea.innerHTML = "";
  const actions = [
    { id: "build", label: "🔨 Build", detail: "Raise new structures.", costLabel: "Varies per structure" },
    { id: "harvest", label: "🌾 Harvest", detail: "Gather crops and supplies.", cost: { energy: 1, gold: 0 } },
    { id: "conquest", label: "🏴 Conquest", detail: "Expand your realm outward.", costLabel: "Costs heavy gold & resources" },
    { id: "gifts", label: "🏛️ Gifts", detail: "Review Keep gifts and couriers.", costLabel: "Requests cost ⚡1 each" },
    { id: "festival", label: "🎉 Festival", detail: "Boost happiness and production briefly.", costLabel: "Consumes fruits & wheat" },
    { id: "collect-gift", label: "📥 Collect Gifts", detail: "Open one shipment instantly.", cost: { energy: 0, gold: 0 } },
    { id: "recruit", label: "🪖 Recruit", detail: "Call fresh troops.", cost: { energy: 2, gold: 40 } },
    { id: "delve", label: "🕳️ Delve Relic", detail: "Spare no expense for a relic.", cost: { energy: 5, gold: 250 } },
    { id: "use-relic", label: "🔮 Use Relic", detail: "Awaken an owned relic.", costLabel: "Varies per relic" },
    { id: "end-turn", label: "🌅 End Turn", detail: "Recover energy & income.", cost: { energy: 0, gold: 0 } },
  ];
  actions.forEach(a => {
    const btn = document.createElement("button");
    btn.classList.add("action-ability-button");
    if (a.id === "end-turn") {
      btn.classList.add("end-turn");
    }
    const label = document.createElement("span");
    label.textContent = a.label;
    label.dataset.defaultText = a.label;
    const detail = document.createElement("small");
    detail.textContent = a.detail ?? "";
    detail.dataset.defaultText = a.detail ?? "";
    btn.appendChild(label);
    btn.appendChild(detail);
    btn.dataset.action = a.id;
    btn.dataset.costEnergy = a.cost?.energy ?? "";
    btn.dataset.costGold = a.cost?.gold ?? "";
    btn.dataset.costCustom = a.costLabel ?? "";
    btn.addEventListener("click", () => handleAction(a.id));
    actionArea.appendChild(btn);
  });
}

function applyStartingStats(player, faction) {
  player.faction = faction;
  player.gold = parseTraitValue(faction?.defaultTraits?.economy) * 10;
  player.troops = parseTraitValue(faction?.defaultTraits?.prowess) * 5;
  player.happiness = 1;
  player.protection = 1;
  player.giftsWaiting = Math.floor(Math.random() * 3) + 1;
  player.relics = [];
  player.keepTithe = 0;
  player.economyBonus = 0;
}

function parseTraitValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}
