// === TURN SYSTEM for Relics of the Meadow === //
// By: Leader of the Pack Rats 🐀💎

// Base turn structure
function executeTurn(faction) {
  console.log(`--- ${faction.name} Turn Begins ---`);
  sunrisePhase(faction);
  afternoonPhase(faction);
  eveningPhase(faction);
  console.log(`--- ${faction.name} Turn Ends ---`);
}

// 🌅 SUNRISE PHASE
function sunrisePhase(faction) {
  console.log("🌅 SUNRISE PHASE");

  // 1. Gather Imports
  faction.imports.forEach(item => faction.inventory.push(item));
  faction.imports = [];
  console.log("Imports gathered!");

  // 2. Set Prowess
  faction.prowess = (faction.unitsOnMap / faction.totalUnits) * 10;

  // 3. Set Economy
  faction.econ = (faction.gold * faction.tradeRoutes.length) / 100;

  // 4. Set Resilience
  faction.resilience = (faction.undisturbedClearings / faction.clearingsRuled) * 10;

  // 5. Morning Faction Abilities
  triggerFactionAbilities(faction, "morning");
}

// ☀️ AFTERNOON PHASE
function afternoonPhase(faction) {
  console.log("☀️ AFTERNOON PHASE");

  // 1. Movement
  let maxMoves = Math.floor(faction.prowess / 2);
  console.log(`You can move up to ${maxMoves} battalions or units this turn.`);

  // 2. Battle/Siege
  let maxBattles = Math.floor(faction.prowess / 2);
  console.log(`You can battle up to ${maxBattles} times.`);

  // Dice battle example:
  function rollBattle(attacker, defender) {
    const attackRoll = Math.max(randDice(), randDice());
    const defendRoll = Math.min(randDice(), randDice());
    console.log(`${attacker.name} rolled ${attackRoll}, ${defender.name} rolled ${defendRoll}`);
    if (attackRoll > defendRoll) defender.unitsOnMap--;
    else attacker.unitsOnMap--;
  }

  // 3. Trade
  // Items placed into trade routes and offers processed separately
  console.log("Trades can now be made.");

  // 4. Alliance draft
  // Placeholder: implement yes/no alliance logic later

  // 5. Afternoon Faction Abilities
  triggerFactionAbilities(faction, "afternoon");
}

// 🌙 EVENING PHASE
function eveningPhase(faction) {
  console.log("🌙 EVENING PHASE");

  // 1. Resolve lingering effects
  resolveStatusEffects(faction);

  // 2. Send out exports
  faction.exports.forEach(item => sendToBuyer(item));
  faction.exports = [];

  // 3. Evening Faction Abilities
  triggerFactionAbilities(faction, "evening");
}

// Utility
function triggerFactionAbilities(faction, phase) {
  faction.abilities
    .filter(a => a.phase === phase)
    .forEach(a => a.activate(faction));
}

function randDice() {
  return Math.floor(Math.random() * 6); // 0–5
}

function resolveStatusEffects(faction) {
  faction.statusEffects.forEach(e => e.resolve());
}

function sendToBuyer(item) {
  console.log(`Exported ${item.name} to ${item.buyer}`);
}
