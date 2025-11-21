export const seasonalEvents = [
  {
    key: "rainstorm",
    name: "Rainstorm",
    duration: 2,
    description: "Boosts wheat and herb output across your realm.",
    effects: {
      resourceMultipliers: { wheat: 1.5, herbs: 1.5 },
      happinessShift: 1,
    },
  },
  {
    key: "harvestMoon",
    name: "Harvest Moon",
    duration: 3,
    description: "All production buildings thrum with extra life.",
    effects: {
      productionMultiplier: 1.25,
      happinessShift: 2,
    },
  },
  {
    key: "bountifulCharm",
    name: "Bountiful Charm",
    duration: 2,
    description: "Fruit trees and logging camps flourish.",
    effects: {
      resourceMultipliers: { fruits: 1.6, logs: 1.4 },
    },
  },
  {
    key: "beastSpawn",
    name: "Beast Stirring",
    duration: 1,
    description: "A roaming beast emerges in a nearby clearing.",
    seasons: ["spring", "summer", "fall", "winter"],
    effects: { spawnBeast: true },
  },
  {
    key: "energySurge",
    name: "Energy Surge",
    duration: 2,
    description: "Your people feel twice as invigorated.",
    seasons: ["spring", "summer", "fall", "winter"],
    effects: { energyGainMultiplier: 2 },
  },
  {
    key: "christmas",
    name: "Christmas",
    duration: 2,
    description: "Festive spirit doubles gifts.",
    seasons: ["winter"],
    effects: { giftMultiplier: 2, happinessShift: 3 },
  },
  {
    key: "thanksgiving",
    name: "Thanksgiving",
    duration: 1,
    description: "Feasts abound, folks are extra hungry—especially for meat.",
    seasons: ["fall"],
    effects: { hungerMultiplier: 3, meatMultiplier: 4, happinessShift: 2 },
  },
  {
    key: "valentines",
    name: "Valentine's Day",
    duration: 1,
    description: "Hearts flutter; fruit platters vanish twice as fast.",
    seasons: ["winter"],
    effects: { fruitMultiplier: 2, happinessShift: 4 },
  },
  {
    key: "halloween",
    name: "Halloween",
    duration: 1,
    description: "Spirits rise; sweets vanish thrice as fast.",
    seasons: ["fall"],
    effects: { sweetsMultiplier: 3, happinessShift: 2 },
  },
  {
    key: "homeDay",
    name: "International Home Day",
    duration: 2,
    description: "Homes feel cozier; morale rises with shelter.",
    seasons: ["spring", "summer", "fall", "winter"],
    effects: { housingHappinessBonus: 2, happinessShift: 2 },
  },
];

export const festivalDefinition = {
  key: "meadowFestival",
  name: "Meadow Festival",
  duration: 2,
  description: "A kingdom-wide celebration that lifts spirits and inspires extra work.",
  effects: {
    productionMultiplier: 1.15,
    happinessShift: 6,
  },
};
