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
  const troopPower = Math.max(1, player.troops) + (player.battleBonus || 0) * 2;
  const beastPower = (beast.strength || 3) * 12;
  const roll = Math.random() * (troopPower + beastPower);
  const victory = roll > beastPower;
  const casualtyFactor = victory ? 0.15 : 0.35;
  const casualties = Math.max(1, Math.round(player.troops * casualtyFactor));
  player.troops = Math.max(0, player.troops - casualties);
  let rewards = null;
  if (victory) {
    announce(`⚔️ ${beast.type || "Beast"} defeated near clearing #${clearing.id}! Lost ${casualties} troops.`);
    rewards = grantSpoils(beast, announce);
  } else {
    announce(
      `💀 ${beast.type || "Beast"} repelled your forces at clearing #${clearing.id}. Lost ${casualties} troops.`
    );
  }
  lastEncounter = {
    clearingId: clearing.id,
    beast: { ...beast },
    victory,
    casualties,
    rewards,
  };
  return { victory, casualties, rewards };
}
