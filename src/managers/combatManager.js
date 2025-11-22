/////////////////////////////////////
/// MODULE IMPORTS               ///
/////////////////////////////////////
import { addResource } from "./resourceManager.js";
import { getBeastDefinition } from "../data/beasts.js";

/////////////////////////////////////
/// STATE                         ///
/////////////////////////////////////
let lastEncounter = null;

/////////////////////////////////////
/// HELPERS                       ///
/////////////////////////////////////

function grantSpoils(beast, announce) {
  const def = getBeastDefinition(beast.type);
  const baseRewards = def?.rewards ? { ...def.rewards } : {};
  const rewards = {};
  Object.entries(baseRewards).forEach(([key, amount]) => {
    const gained = Math.floor(Math.random() * amount) + 1;
    if (gained > 0) addResource(key, gained);
    rewards[key] = gained;
  });
  const summary = Object.entries(rewards)
    .map(([key, amount]) => `${amount} ${key}`)
    .join(", ");
  announce(`💎 Spoils recovered: ${summary || "None"}.`);
  return rewards;
}

/////////////////////////////////////
/// API                           ///
/////////////////////////////////////
export function resetCombatState() {
  lastEncounter = null;
}

export function getLastEncounter() {
  return lastEncounter;
}

export function resolveBeastEncounter({ player, clearing, beast, announce }) {
  if (!player || !clearing || !beast) {
    return { victory: false, error: "No beast to confront." };
  }
  const def = getBeastDefinition(beast.type) || {};
  const beastStrength = beast.strength || def.strength || 3;
  if (typeof beast.health !== "number" || Number.isNaN(beast.health)) {
    beast.health = def.health || 120;
  }
  const troopPower = Math.max(1, player.troops) + (player.battleBonus || 0) * 2;
  const beastPower = beastStrength * 12;
  const exchangeTilt = troopPower / Math.max(1, troopPower + beastPower);
  const rawDamage = Math.round(troopPower * (0.35 + Math.random() * 0.45));
  const maxDamage = Math.max(12, Math.floor(beast.health * 0.65));
  const damageDealt = Math.min(rawDamage, maxDamage);
  const healthBefore = beast.health;
  beast.health = Math.max(0, beast.health - damageDealt);

  const casualtyBase = Math.max(1, Math.round((beastPower / 8) * (0.6 + Math.random() * 0.6)));
  const casualties = Math.min(
    player.troops,
    Math.max(1, Math.round(casualtyBase * (1 - exchangeTilt * 0.25)))
  );
  player.troops = Math.max(0, player.troops - casualties);

  const victory = beast.health <= 0;
  let rewards = null;
  if (victory) {
    announce?.(`⚔️ ${beast.type || "Beast"} finally falls! Lost ${casualties} troops.`);
    rewards = grantSpoils(beast, announce || (() => {}));
  } else {
    announce?.(
      `🩸 ${beast.type || "Beast"} is wounded (❤️ ${beast.health} left). Your forces lost ${casualties} troops.`
    );
  }
  lastEncounter = {
    clearingId: clearing.id,
    beast: { ...beast },
    victory,
    casualties,
    rewards,
    damageDealt,
    remainingHealth: beast.health,
    healthBefore,
  };
  return { victory, casualties, rewards, damageDealt, remainingHealth: beast.health };
}
