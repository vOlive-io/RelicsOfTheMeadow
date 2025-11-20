export function calculateResilience(player) {
  const mood = Math.max(0, player.happiness);
  const defenses = Math.max(0, player.protection);
  const shelterBonus = (player.buildings?.length || 0) * 0.5;
  const resilience = Math.floor((mood + defenses) / 2 + shelterBonus);
  return Math.max(0, resilience);
}

export function calculateEconomy(player) {
  const tradeValue = (player.keepTithe || 0) * 5;
  const economyBonus = (player.economyBonus || 0) * 50;
  const storedGoods = (player.harvestedGoodsValue || 0) * 10;
  const totalWealth = Math.max(0, player.gold + tradeValue + economyBonus + storedGoods);
  const exponentialBump = Math.pow(totalWealth / 200 + 1, 1.15);
  return Math.max(1, Math.floor(exponentialBump));
}

export function calculateProwess(player) {
  const troopPower = Math.max(0, player.troops) / 8;
  const armorPower = Math.max(0, player.protection) / 3;
  const relicBoost = (player.relics?.length || 0) * 0.5;
  return Math.max(1, Math.floor(troopPower + armorPower + relicBoost));
}

function resolveStat(subject, statName) {
  const direct = subject?.[statName];
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;
  if (typeof direct === "string") {
    const parsedDirect = parseInt(direct, 10);
    if (!Number.isNaN(parsedDirect)) return parsedDirect;
  }

  const defaults = subject?.defaultTraits || subject?.faction?.defaultTraits;
  if (defaults) {
    const fallback = defaults[statName];
    if (typeof fallback === "number" && Number.isFinite(fallback)) return fallback;
    if (typeof fallback === "string") {
      const parsedFallback = parseInt(fallback, 10);
      if (!Number.isNaN(parsedFallback)) return parsedFallback;
    }
  }
  return 0;
}

export function calcStartingEnergy(subject) {
  const total = ["prowess", "resilience", "economy"].reduce(
    (sum, stat) => sum + resolveStat(subject, stat),
    0
  );
  const avg = total / 6;
  return Math.max(1, Math.ceil(avg));
}
