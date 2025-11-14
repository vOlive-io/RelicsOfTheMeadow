function clampTen(value) {
  return Math.max(0, Math.min(10, value));
}

function applyChanges(player, changes) {
  Object.entries(changes).forEach(([stat, delta]) => {
    if (typeof delta !== "number") return;
    switch (stat) {
      case "gold":
        player.gold += delta;
        break;
      case "energy":
        player.energy = Math.max(0, player.energy + delta);
        break;
      case "troops":
        player.troops = Math.max(0, player.troops + delta);
        break;
      case "happiness":
        player.happiness = Math.max(0, player.happiness + delta);
        break;
      case "protection":
        player.protection = Math.max(0, player.protection + delta);
        break;
      case "resilience":
        player.resilience = clampTen(player.resilience + delta);
        break;
      case "prowess":
        player.prowess = clampTen(player.prowess + delta);
        break;
      default:
        player[stat] = (player[stat] || 0) + delta;
    }
  });
}

const makeLogic = (changes, message) => ({ player, logEvent }) => {
  applyChanges(player, changes);
  if (logEvent) {
    logEvent(message);
  }
};

export const relics = [
  // 🌿 Bane & Friend Relics
  {
    name: "🩸 Bane of the Crimson Horde",
    type: "Bane & Friend",
    effect: "Vengeance bonuses are 25% weaker; lose 2 vengeance slots.",
    logic: makeLogic(
      { protection: 2 },
      "🩸 The Horde’s fury is dampened; their blows glance from your shields."
    ),
  },
  {
    name: "💀 Bane of the Devoured Faith",
    type: "Bane & Friend",
    effect: "They can no longer steal from you or one chosen player you grant divine protection.",
    logic: makeLogic(
      { resilience: 1, happiness: 1 },
      "💀 The Faith recoils, your people feel safe from their rituals."
    ),
  },
  {
    name: "🏯 Bane of the Jade Empire",
    type: "Bane & Friend",
    effect: "You gain 20% of their income; they cannot attack first.",
    logic: makeLogic(
      { gold: 35 },
      "🏯 Trade tariffs siphon wealth from the Jade Empire into your coffers."
    ),
  },
  {
    name: "🌾 Bane of the Meadowfolk Union",
    type: "Bane & Friend",
    effect: "Revolts take 1 extra turn and +10% backfire chance.",
    logic: makeLogic(
      { protection: 1, resilience: 1 },
      "🌾 Meadowfolk unrest falters, reinforcing your defensive patience."
    ),
  },
  {
    name: "🍄 Bane of the Mycelial Monarchy",
    type: "Bane & Friend",
    effect: "Spore growth slows by 75%; cannot convert you.",
    logic: makeLogic(
      { energy: 2 },
      "🍄 Fungal spores recede from your borders, freeing vital energy."
    ),
  },
  {
    name: "🕷️ Bane of the Silken Dominion",
    type: "Bane & Friend",
    effect: "Whenever they steal income, 15% of that total goes to you.",
    logic: makeLogic(
      { gold: 25 },
      "🕷️ Stolen coin clings to your ledgers before the Dominion can pocket it."
    ),
  },
  {
    name: "🩸 Friend of the Crimson Horde",
    type: "Bane & Friend",
    effect: "Vengeance bonuses 25% stronger; +2 slots; shared defenders.",
    logic: makeLogic(
      { troops: 6, protection: 1 },
      "🩸 Horde berserkers rally beside you, bolstering your ranks."
    ),
  },
  {
    name: "💀 Friend of the Devoured Faith",
    type: "Bane & Friend",
    effect: "Both your and their units gain +15% Attack and +15% Morale near each other.",
    logic: makeLogic(
      { troops: 4, resilience: 1 },
      "💀 The Faith’s hymns steady your soldiers’ resolve."
    ),
  },
  {
    name: "🏯 Friend of the Jade Empire",
    type: "Bane & Friend",
    effect: "They gain +10% money and +10% cranes; you gain 10% of their profit.",
    logic: makeLogic(
      { gold: 50 },
      "🏯 Imperial trade winds fill your vaults."
    ),
  },
  {
    name: "🌾 Friend of the Meadowfolk Union",
    type: "Bane & Friend",
    effect: "Revolts have +15% success when supporting you.",
    logic: makeLogic(
      { happiness: 2, resilience: 1 },
      "🌾 Meadowfolk goodwill blossoms in your domain."
    ),
  },
  {
    name: "🍄 Friend of the Mycelial Monarchy",
    type: "Bane & Friend",
    effect: "They cannot convert you; their spores grow +50% faster.",
    logic: makeLogic(
      { resilience: 2 },
      "🍄 Symbiotic spores reinforce your endurance."
    ),
  },
  {
    name: "🕷️ Friend of the Silken Dominion",
    type: "Bane & Friend",
    effect: "You gain 15% of their manipulation income.",
    logic: makeLogic(
      { gold: 30 },
      "🕷️ Whispered debts and secrets turn into coin for you."
    ),
  },

  // 💰 Economy Relics
  {
    name: "🟨 Guildmaster’s Seal",
    type: "Economy",
    effect: "10% increase to all income sources.",
    logic: makeLogic({ gold: 60 }, "🟨 Guild charters swell your income by 10%."),
  },
  {
    name: "🟨 Golden Quill",
    type: "Economy",
    effect: "+15% trade efficiency.",
    logic: makeLogic(
      { gold: 40, energy: 1 },
      "🟨 Signed contracts cut waste, netting gold and focus."
    ),
  },
  {
    name: "🟨 Merchant’s Scale",
    type: "Economy",
    effect: "Resource production increases by 10% across all goods.",
    logic: makeLogic(
      { gold: 35, protection: 1 },
      "🟨 Fair weights yield steadier trade and sturdier caravans."
    ),
  },
  {
    name: "🟨 Vault of Echoes",
    type: "Economy",
    effect: "Store up to 20% of your gold income per turn - cannot be taxed.",
    logic: makeLogic(
      { gold: 50 },
      "🟨 Hidden vaults preserve untouchable reserves."
    ),
  },

  // ⚔️ Prowess Relics
  {
    name: "🟥 Medallion of Valor",
    type: "Prowess",
    effect: "Boosts Prowess by granting extra recruits/unit gain, increasing army size and replenishment rate.",
    logic: makeLogic(
      { troops: 10, prowess: 1 },
      "🟥 Valor medallions inspire a rush of eager recruits."
    ),
  },
  {
    name: "🟥 Banner of Triumph",
    type: "Prowess",
    effect: "+10% battle hits.",
    logic: makeLogic(
      { troops: 5, happiness: 1 },
      "🟥 The triumphant banner rallies warriors to strike true."
    ),
  },
  {
    name: "🟥 Shield of the Unbroken Line",
    type: "Prowess",
    effect: "+10% defense in battle.",
    logic: makeLogic(
      { protection: 3 },
      "🟥 The unbroken line holds; defenses thicken."
    ),
  },
  {
    name: "🟥 General’s Compass",
    type: "Prowess",
    effect: "Once per turn, reposition a single battalion instantly within your controlled territory.",
    logic: makeLogic(
      { energy: 1, troops: 3 },
      "🟥 Tactical insight lets you redeploy forces swiftly."
    ),
  },

  // 🌿 Resilience Relics
  {
    name: "🟩 Stone of Endurance",
    type: "Resilience",
    effect: "Boosts Resilience by improving public morale and tolerance for prolonged campaigns.",
    logic: makeLogic(
      { resilience: 2, happiness: 1 },
      "🟩 The stone’s calm steadies the people."
    ),
  },
  {
    name: "🟩 Heart of the Masses",
    type: "Resilience",
    effect: "+10% restoration or environmental recovery speed.",
    logic: makeLogic(
      { resilience: 1, happiness: 2 },
      "🟩 The hearts of the masses beat with renewed hope."
    ),
  },
  {
    name: "🟩 Everroot Totem",
    type: "Resilience",
    effect: "Reduces post-battle damage penalties by 15%.",
    logic: makeLogic(
      { protection: 2 },
      "🟩 Everroot sap seals wounds across your settlements."
    ),
  },
  {
    name: "🟩 Mirror of Calm Waters",
    type: "Resilience",
    effect: "Once per turn, cancel one negative effect targeting you.",
    logic: makeLogic(
      { energy: 1, happiness: 1 },
      "🟩 The mirror reflects serenity, washing away ill omens."
    ),
  },

  // 🏰 Faction-Specific Relics
  {
    name: "🪨 Ruins of Deception",
    type: "Devoured Faith",
    effect: "Whenever you steal a relic, recruit 1 extra unit and place it anywhere on the map.",
    logic: makeLogic(
      { troops: 4 },
      "🪨 Phantoms from the ruins swell your covert armies."
    ),
  },
  {
    name: "🕸️ Spinner’s Veil",
    type: "Silken Dominion",
    effect: "Reduces diplomacy backlash by 20%; secret pacts form 1 turn faster.",
    logic: makeLogic(
      { happiness: 1, gold: 20 },
      "🕷️ Hidden veils smooth your intrigues and earnings."
    ),
  },
  {
    name: "🌾 Banner of Blooming Fields",
    type: "Meadowfolk Union",
    effect: "New settlements gain +5% population instantly.",
    logic: makeLogic(
      { happiness: 2, gold: 20 },
      "🌾 Blooming fields burst with prosperity."
    ),
  },
  {
    name: "🏯 Imperial Standard",
    type: "Jade Empire",
    effect: "Trade to neutral +10%, allies +25%.",
    logic: makeLogic(
      { gold: 60 },
      "🏯 The imperial standard commands tribute from near and far."
    ),
  },
  {
    name: "🍄 Crown of Spores",
    type: "Mycelial Monarchy",
    effect: "Spores grow 10% faster per colony.",
    logic: makeLogic(
      { resilience: 2, troops: 4 },
      "🍄 The crown bursts with life, reinforcing fungi legions."
    ),
  },
  {
    name: "🩸 Horn of Fury",
    type: "Crimson Horde",
    effect: "Once per advance, roll +2 attack.",
    logic: makeLogic(
      { troops: 6, energy: 1 },
      "🩸 The horn’s blast rallies warriors into a frenzy."
    ),
  },
  {
    name: "🕯️ Chalice of Ash",
    type: "Devoured Faith",
    effect: "Drinking the ash restores zeal at a terrible cost.",
    logic: makeLogic(
      { troops: 3, happiness: -1, resilience: 1 },
      "🕯️ The chalice burns but the faithful stand taller."
    ),
  },
  {
    name: "🐉 Coin of Currents",
    type: "Jade Empire",
    effect: "Flows of trade bend toward the bearer.",
    logic: makeLogic(
      { gold: 45, energy: 1 },
      "🐉 The coin redirects lucrative routes to you."
    ),
  },
  {
    name: "🌾 Heart of Spring",
    type: "Meadowfolk Union",
    effect: "Life erupts wherever the Heart beats.",
    logic: makeLogic(
      { happiness: 2, protection: 1 },
      "🌾 Spring’s heartbeat heals the land."
    ),
  },
];

console.log("✅ Relics are loaded", relics);
