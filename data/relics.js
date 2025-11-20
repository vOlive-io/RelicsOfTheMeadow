const RELIC_ENERGY_COST = 2;

function clampFloor(value) {
  return Math.max(0, Math.floor(value));
}

function addGold(player, amount) {
  if (!amount) return 0;
  if (typeof player?.gainGold === "function") {
    return player.gainGold(amount);
  }
  const next = Math.max(0, (player?.gold || 0) + amount);
  player.gold = next;
  return amount;
}

function gainPercentOfGold(player, percent) {
  const base = Math.max(0, player.gold);
  const gain = Math.max(1, Math.floor(base * percent));
  return addGold(player, gain);
}

function gainPercentOfTithe(player, percent) {
  const base = Math.max(0, player.keepTithe || 0);
  const gain = Math.max(1, Math.floor(base * percent));
  return addGold(player, gain);
}

function boostTroops(player, amount) {
  player.troops = Math.max(0, player.troops + amount);
}

function boostProtection(player, amount) {
  player.protection = Math.max(0, player.protection + amount);
}

function boostHappiness(player, amount) {
  player.happiness = Math.max(0, player.happiness + amount);
}

function rechargeEnergy(player, amount) {
  player.energy = Math.max(0, player.energy + amount);
}

export const relics = [
  // 🌿 Bane & Friend Relics
  {
    name: "🩸 Bane of the Crimson Horde",
    type: "Bane & Friend",
    effect: "Vengeance bonuses are 25% weaker; lose 2 vengeance slots.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostProtection(player, 2);
      boostHappiness(player, 1);
      logEvent("🩸 The Horde’s wrath falters, strengthening your defenses.");
    },
  },
  {
    name: "💀 Bane of the Devoured Faith",
    type: "Bane & Friend",
    effect: "They can no longer steal from you or a chosen ally.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostProtection(player, 1);
      boostHappiness(player, 2);
      logEvent("💀 Sacred wards shield your coffers from the Faith.");
    },
  },
  {
    name: "🏯 Bane of the Jade Empire",
    type: "Bane & Friend",
    effect: "You gain 20% of their income; they cannot attack first.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfGold(player, 0.2);
      logEvent(`🏯 Imperial tariffs funnel ${gain} gold into your treasury.`);
    },
  },
  {
    name: "🌾 Bane of the Meadowfolk Union",
    type: "Bane & Friend",
    effect: "Revolts take longer and risk blowback.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostProtection(player, 1);
      boostTroops(player, 2);
      logEvent("🌾 Meadowfolk unrest falters before your garrisons.");
    },
  },
  {
    name: "🍄 Bane of the Mycelial Monarchy",
    type: "Bane & Friend",
    effect: "Spore growth slows; you resist conversion.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      rechargeEnergy(player, 2);
      boostProtection(player, 1);
      logEvent("🍄 Sterile wards keep spores at bay and restore vitality.");
    },
  },
  {
    name: "🕷️ Bane of the Silken Dominion",
    type: "Bane & Friend",
    effect: "Whenever they steal income, 15% of that total goes to you.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfGold(player, 0.15);
      logEvent(`🕷️ We intercepted webbed coin: +${gain} gold.`);
    },
  },
  {
    name: "🩸 Friend of the Crimson Horde",
    type: "Bane & Friend",
    effect: "Vengeance bonuses 25% stronger; shared defenders.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 6);
      boostProtection(player, 1);
      logEvent("🩸 Horde berserkers bolster your army.");
    },
  },
  {
    name: "💀 Friend of the Devoured Faith",
    type: "Bane & Friend",
    effect: "Nearby armies gain fervor.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 4);
      boostHappiness(player, 1);
      logEvent("💀 Devotion surges as the Faith fights beside you.");
    },
  },
  {
    name: "🏯 Friend of the Jade Empire",
    type: "Bane & Friend",
    effect: "They gain +10% money; you gain 10% of their profit.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfGold(player, 0.1);
      logEvent(`🏯 Keep partners tithe ${gain} gold from their windfalls.`);
    },
  },
  {
    name: "🌾 Friend of the Meadowfolk Union",
    type: "Bane & Friend",
    effect: "Revolts succeed more often when backing you.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostHappiness(player, 2);
      boostProtection(player, 1);
      logEvent("🌾 Meadowfolk support blossoms across your lands.");
    },
  },
  {
    name: "🍄 Friend of the Mycelial Monarchy",
    type: "Bane & Friend",
    effect: "Their spores grow faster but cannot convert you.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 4);
      boostProtection(player, 1);
      logEvent("🍄 Symbiotic tendrils reinforce your warrior lines.");
    },
  },
  {
    name: "🕷️ Friend of the Silken Dominion",
    type: "Bane & Friend",
    effect: "You gain 15% of their manipulation income.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfGold(player, 0.15);
      logEvent(`🕷️ Spider nobles share clandestine profits: +${gain} gold.`);
    },
  },

  // 💰 Economy Relics
  {
    name: "🟨 Guildmaster’s Seal",
    type: "Economy",
    effect: "10% increase to all income sources.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const trade = Math.max(0, (player.keepTithe || 0) * 5);
      const base = Math.max(0, player.gold) + trade;
      const gain = Math.max(5, Math.floor(base * 0.1));
      const added = addGold(player, gain);
      logEvent(`🟨 Guild dues swell your income by ${added} gold.`);
    },
  },
  {
    name: "🟨 Golden Quill",
    type: "Economy",
    effect: "+15% trade efficiency.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfTithe(player, 0.15);
      logEvent(`🟨 Contracts tighten: +${gain} gold from efficient trade.`);
    },
  },
  {
    name: "🟨 Merchant’s Scale",
    type: "Economy",
    effect: "Resource production increases by 10% across all goods.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfGold(player, 0.1);
      boostProtection(player, 1);
      logEvent(`🟨 Fair weights yield ${gain} bonus gold and sturdier couriers.`);
    },
  },
  {
    name: "🟨 Vault of Echoes",
    type: "Economy",
    effect: "Store up to 20% of your gold income per turn—cannot be taxed.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfGold(player, 0.2);
      logEvent(`🟨 Hidden vaults secure ${gain} untouchable gold.`);
    },
  },

  // ⚔️ Prowess Relics
  {
    name: "🟥 Medallion of Valor",
    type: "Prowess",
    effect: "Boosts Prowess by granting extra recruits and replenishment.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 10);
      logEvent("🟥 Valor medallions inspire a rush of eager recruits.");
    },
  },
  {
    name: "🟥 Banner of Triumph",
    type: "Prowess",
    effect: "+10% battle hits.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 5);
      boostHappiness(player, 1);
      logEvent("🟥 The triumphant banner rallies warriors to strike true.");
    },
  },
  {
    name: "🟥 Shield of the Unbroken Line",
    type: "Prowess",
    effect: "+10% defense in battle.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostProtection(player, 3);
      logEvent("🟥 Shield walls tighten, absorbing the enemy’s charge.");
    },
  },
  {
    name: "🟥 General’s Compass",
    type: "Prowess",
    effect: "Once per turn, reposition a battalion instantly within your territory.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 3);
      rechargeEnergy(player, 1);
      logEvent("🟥 Tactical insight lets you redeploy forces swiftly.");
    },
  },

  // 🌿 Resilience Relics
  {
    name: "🟩 Stone of Endurance",
    type: "Resilience",
    effect: "Boosts morale and tolerance for prolonged campaigns.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostProtection(player, 1);
      boostHappiness(player, 2);
      logEvent("🟩 The stone’s calm steadies the people.");
    },
  },
  {
    name: "🟩 Heart of the Masses",
    type: "Resilience",
    effect: "+10% restoration or environmental recovery speed.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfGold(player, 0.1);
      boostHappiness(player, 1);
      logEvent(`🟩 The masses rally, funding ${gain} gold in recovery efforts.`);
    },
  },
  {
    name: "🟩 Everroot Totem",
    type: "Resilience",
    effect: "Reduces post-battle damage penalties by 15%.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostProtection(player, 2);
      boostTroops(player, 2);
      logEvent("🟩 Everroot sap seals the wounds of your army.");
    },
  },
  {
    name: "🟩 Mirror of Calm Waters",
    type: "Resilience",
    effect: "Once per turn, cancel one negative effect targeting you.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      rechargeEnergy(player, 1);
      boostHappiness(player, 1);
      logEvent("🟩 The mirror reflects serenity, washing away ill omens.");
    },
  },

  // 🏰 Faction-Specific Relics
  {
    name: "🪨 Ruins of Deception",
    type: "Devoured Faith",
    effect: "Whenever you steal a relic, recruit 1 extra unit anywhere.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 4);
      boostProtection(player, 1);
      logEvent("🪨 Phantoms from the ruins swell your covert armies.");
    },
  },
  {
    name: "🕸️ Spinner’s Veil",
    type: "Silken Dominion",
    effect: "Reduces diplomacy backlash by 20%; secret pacts form faster.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostHappiness(player, 1);
      const gain = gainPercentOfGold(player, 0.1);
      logEvent(`🕸️ Veiled whispers smooth diplomacy, netting ${gain} gold.`);
    },
  },
  {
    name: "🌾 Banner of Blooming Fields",
    type: "Meadowfolk Union",
    effect: "New settlements gain +5% population instantly.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostHappiness(player, 2);
      boostProtection(player, 1);
      logEvent("🌾 Blooming fields burst with prosperity.");
    },
  },
  {
    name: "🏯 Imperial Standard",
    type: "Jade Empire",
    effect: "Tithes from neutrals +10%, allies +25%.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const allyBonus = (player.alliances?.length || 0) * 0.25;
      const tradePercent = Math.min(0.5, 0.1 + allyBonus);
      const gain = gainPercentOfTithe(player, tradePercent);
      logEvent(`🏯 Imperial honors deliver ${gain} gold from loyal partners.`);
    },
  },
  {
    name: "🍄 Crown of Spores",
    type: "Mycelial Monarchy",
    effect: "Spores grow 10% faster per colony.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 4);
      boostProtection(player, 1);
      logEvent("🍄 The crown bursts with life, reinforcing fungi legions.");
    },
  },
  {
    name: "🩸 Horn of Fury",
    type: "Crimson Horde",
    effect: "Once per advance, roll +2 attack.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 6);
      rechargeEnergy(player, 1);
      logEvent("🩸 The horn’s blast rallies warriors into a frenzy.");
    },
  },
  {
    name: "🕯️ Chalice of Ash",
    type: "Devoured Faith",
    effect: "Drinking the ash restores zeal at a terrible cost.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostTroops(player, 3);
      boostHappiness(player, -1);
      rechargeEnergy(player, 1);
      logEvent("🕯️ The chalice burns but the faithful stand taller.");
    },
  },
  {
    name: "🐉 Coin of Currents",
    type: "Jade Empire",
    effect: "Flows of trade bend toward the bearer.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      const gain = gainPercentOfGold(player, 0.15);
      rechargeEnergy(player, 1);
      logEvent(`🐉 The coin redirects lucrative routes: +${gain} gold.`);
    },
  },
  {
    name: "🌾 Heart of Spring",
    type: "Meadowfolk Union",
    effect: "Life erupts wherever the Heart beats.",
    energyCost: RELIC_ENERGY_COST,
    logic: ({ player, logEvent }) => {
      boostHappiness(player, 2);
      boostProtection(player, 1);
      logEvent("🌾 Spring’s heartbeat heals the land.");
    },
  },
];

console.log("✅ Relics are loaded", relics);
