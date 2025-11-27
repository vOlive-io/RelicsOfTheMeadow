export const buildingDefinitions = [
  ////////////////////////
  // Housing Structures //
  ////////////////////////
  //hovel
   {
    key: "hovel",
    name: "Hovel",
    type: "housing",
    icon: "🪹",
    beds: 3,
    cost: { logs: 15, stone: 15, mythril: 3, },
    blueprintTier: "default",
  },
  //cottage
  {
    key: "cottage",
    name: "Cottage",
    type: "housing",
    icon: "🏡",
    beds: 10,
    cost: { logs: 50, stone: 50, mythril: 25, goldOre: 15, },
    blueprintTier: "default",
  },
  //villa
  {
    key: "villa",
    name: "Villa",
    type: "housing",
    icon: "🏡",
    beds: 25,
    cost: { logs: 150, stone: 100, mythril: 50, goldOre: 25, silktoneObsidian: 10, },
    blueprintTier: "default",
  },
  //longhouse
  {
    key: "longhouse",
    name: "Longhouse",
    type: "housing",
    icon: "🏘️",
    beds: 50,
    cost: { logs: 300, stone: 200, mythril: 100, goldOre: 50, silktoneObsidian: 25, },
    blueprintTier: "library",
  },
  //holdstead
  {
    key: "holdstead",
    name: "Holdstead",
    type: "housing",
    icon: "🏛️",
    beds: 100,
    cost: { logs: 100, stone: 500, mythril: 250, goldOre: 150, silktoneObsidian: 100, lumenQuartz: 50, magicalEssence: 50, },
    upkeep: { logs: 10, mythril: 2 },
    blueprintTier: "library",
  },
  //grand holdstead
  {
    key: "grandHoldstead",
    name: "Grand Holdstead",
    type: "housing",
    icon: "🏛️",
    beds: 250,
    cost: { logs: 1500, stone: 1000, mythril: 500, goldOre: 500, silktoneObsidian: 200, lumenQuartz: 200, magicalEssence: 100, starpetalOre: 20, },
    upkeep: { logs: 10, mythril: 2 },
    blueprintTier: "apex",
  },
  ///////////////////////
  //  Production Line  //
  ///////////////////////
  // Basic Orchard
  {
    key: "basicOrchard",
    name: "Basic Orchard",
    type: "production",
    icon: "🍎",
    produces: { fruits: 8, logs: 2 },
    cost: { logs: 20, meadowheartOpal: 1 },
    supportedTerrains: ["Meadow", "Forest", "Ancient Grove"],
    blueprintTier: "default",
  },
  // Large Orchard
  {
    key: "largeOrchard",
    name: "Large Orchard",
    type: "production",
    icon: "🍊",
    produces: { fruits: 20, logs: 5 },
    cost: { logs: 80, clay: 20, meadowheartOpal: 2 },
    supportedTerrains: ["Meadow", "Forest", "Ancient Grove"],
    blueprintTier: "library",
    upgradeFrom: "basicOrchard",
  },
  // Orchard of the Gods
  {
    key: "orchardOfTheGods",
    name: "Orchard of the Gods",
    type: "production",
    icon: "🍇",
    produces: { fruits: 100, logs: 25, herbs: 10 },
    cost: { logs: 120, clay: 30, goldOre: 6, meadowheartOpal: 3 },
    supportedTerrains: ["Meadow", "Forest", "Ancient Grove"],
    blueprintTier: "apex",
    upgradeFrom: "largeOrchard",
  },

  // Basic Farm
  {
    key: "basicFarm",
    name: "Basic Farm Field",
    type: "production",
    icon: "🌾",
    produces: { wheat: 8 },
    cost: { logs: 40, clay: 10, meadowheartOpal: 1 },
    supportedTerrains: ["Meadow", "River", "Ancient Grove"],
    blueprintTier: "default",
  },
  // Large Farm
  {
    key: "largeFarm",
    name: "Large Farm Field",
    type: "production",
    icon: "🌽",
    produces: { wheat: 16 },
    cost: { logs: 80, clay: 20, meadowheartOpal: 2 },
    supportedTerrains: ["Meadow", "River", "Ancient Grove"],
    blueprintTier: "library",
    upgradeFrom: "basicFarm",
  },
  // Farm of the Gods
  {
    key: "farmOfTheGods",
    name: "Farm Field of the Gods",
    type: "production",
    icon: "🌾",
    produces: { wheat: 26, fruits: 4 },
    cost: { logs: 120, stone: 40, goldOre: 4, meadowheartOpal: 3 },
    supportedTerrains: ["Meadow", "River", "Ancient Grove"],
    blueprintTier: "apex",
    upgradeFrom: "largeFarm",
  },

  // Basic Herb Garden
  {
    key: "basicHerbGarden",
    name: "Basic Herb Garden",
    type: "production",
    icon: "🍃",
    produces: { herbs: 6, spices: 2 },
    cost: { logs: 30, stone: 10, meadowheartOpal: 1 },
    supportedTerrains: ["Meadow", "Forest", "Ancient Grove"],
    blueprintTier: "default",
  },
  // Large Herb Garden
  {
    key: "largeHerbGarden",
    name: "Large Herb Garden",
    type: "production",
    icon: "🥬",
    produces: { herbs: 12, spices: 4 },
    cost: { logs: 60, stone: 20, meadowheartOpal: 2 },
    supportedTerrains: ["Meadow", "Forest", "Ancient Grove"],
    blueprintTier: "library",
    upgradeFrom: "basicHerbGarden",
  },
  // Herb Garden of the Gods
  {
    key: "herbGardenOfTheGods",
    name: "Herb Garden of the Gods",
    type: "production",
    icon: "🌺",
    produces: { herbs: 18, spices: 6, magicalEssence: 2 },
    cost: { logs: 90, stone: 30, goldOre: 3, meadowheartOpal: 3 },
    supportedTerrains: ["Meadow", "Forest", "Ancient Grove"],
    blueprintTier: "apex",
    upgradeFrom: "largeHerbGarden",
  },

  // Basic Pasture
  {
    key: "basicPasture",
    name: "Basic Pasture",
    type: "production",
    icon: "🐑",
    produces: { meat: 6 },
    cost: { logs: 50, stone: 20 },
    supportedTerrains: ["Meadow", "Hills"],
    blueprintTier: "default",
  },
  // Large Pasture
  {
    key: "largePasture",
    name: "Large Pasture",
    type: "production",
    icon: "🐄",
    produces: { meat: 12 },
    cost: { logs: 90, stone: 40, clay: 20 },
    supportedTerrains: ["Meadow", "Hills"],
    blueprintTier: "library",
    upgradeFrom: "basicPasture",
  },
  // Pasture of the Gods
  {
    key: "pastureOfTheGods",
    name: "Pasture of the Gods",
    type: "production",
    icon: "🦬",
    produces: { meat: 18, wheat: 6 },
    cost: { logs: 130, stone: 60, mythril: 2, goldOre: 4 },
    supportedTerrains: ["Meadow", "Hills"],
    blueprintTier: "apex",
    upgradeFrom: "largePasture",
  },


  //Basic Mortar Quarry
  {
    key: "mortarQuarry",
    name: "Basic Mortar Quarry",
    type: "production",
    icon: "🧱",
    produces: { clay: 15 },
    cost: { logs: 90, stone: 140, mythril: 2 },
    supportedTerrains: ["Hills", "River"],
    blueprintTier: "default",
  },
  // Large Mortar Quarry
  {
    key: "largeMortarQuarry",
    name: "Large Mortar Quarry",
    type: "production",
    icon: "🧱",
    produces: { clay: 30, stone: 10 },
    cost: { logs: 130, stone: 200, mythril: 4, clay: 60 },
    supportedTerrains: ["Hills", "River"],
    blueprintTier: "library",
    upgradeFrom: "mortarQuarry",
  },
  // Mortar Quarry of the Gods
  {
    key: "mortarQuarryOfTheGods",
    name: "Mortar Quarry of the Gods",
    type: "production",
    icon: "🧱",
    produces: { clay: 50, stone: 20, magicalEssence: 1 },
    cost: { logs: 180, stone: 260, mythril: 6, clay: 100, goldOre: 6 },
    supportedTerrains: ["Hills", "River"],
    blueprintTier: "apex",
    upgradeFrom: "largeMortarQuarry",
  },

  // Basic Sawmill
  {
    key: "sawmill",
    name: "Basic Sawmill",
    type: "production",
    icon: "🪵",
    produces: { logs: 25 },
    cost: { logs: 50, stone: 50, mythril: 2 },
    supportedTerrains: ["Hills", "River", "Forest", "Ancient Grove"],
    blueprintTier: "default",
  },
  // Large Sawmill
  {
    key: "largeSawmill",
    name: "Large Sawmill",
    type: "production",
    icon: "🪵",
    produces: { logs: 55 },
    cost: { logs: 110, stone: 110, mythril: 6, clay: 30 },
    supportedTerrains: ["Hills", "River", "Forest", "Ancient Grove"],
    blueprintTier: "library",
    upgradeFrom: "sawmill",
  },
  // Sawmill of the Gods
  {
    key: "sawmillOfTheGods",
    name: "Sawmill of the Gods",
    type: "production",
    icon: "🪵",
    produces: { logs: 90, timber: 15 },
    cost: { logs: 160, stone: 160, mythril: 10, clay: 60, goldOre: 6 },
    supportedTerrains: ["Hills", "River", "Forest", "Ancient Grove"],
    blueprintTier: "apex",
    upgradeFrom: "largeSawmill",
  },

  // Basic Fishman's Wharf
  {
    key: "fishmansWharf",
    name: "Basic Fishman's Wharf",
    type: "production",
    icon: "🐟",
    produces: { fish: 10, meat: 2 },
    cost: { logs: 120, stone: 80, clay: 30 },
    supportedTerrains: ["Ocean", "River", "Deep Ocean"],
    blueprintTier: "default",
    waterAccess: true,
  },
  // Large Fishman's Wharf
  {
    key: "largeFishmansWharf",
    name: "Large Fishman's Wharf",
    type: "production",
    icon: "🐟",
    produces: { fish: 20, crabcrabMeat: 10},
    cost: { logs: 160, stone: 120, clay: 60, goldOre: 4 },
    supportedTerrains: ["Ocean", "River", "Deep Ocean"],
    blueprintTier: "library",
    upgradeFrom: "fishmansWharf",
    waterAccess: true,
  },
  // Fishman's Wharf of the Gods
  {
    key: "fishmansWharfOfTheGods",
    name: "Fishman's Wharf of the Gods",
    type: "production",
    icon: "🐟",
    produces: { fish: 32, crabMeat: 6, spices: 3 },
    cost: { logs: 210, stone: 160, clay: 90, goldOre: 10, magicalEssence: 2 },
    supportedTerrains: ["Ocean", "River", "Deep Ocean"],
    blueprintTier: "apex",
    upgradeFrom: "largeFishmansWharf",
    waterAccess: true,
  },

  ////////////////////////////
  //  Specialized Buildings //
  ////////////////////////////
  // Evergarden
  {
    key: "evergarden",
    name: "Evergarden",
    type: "production",
    icon: "🌼",
    produces: { fruits: 18, herbs: 12, wheat: 12 },
    cost: { logs: 200, stone: 80, meadowheartOpal: 5, goldOre: 6 },
    supportedTerrains: ["Meadow", "Ancient Grove"],
    blueprintTier: "ultra",
  },
  // Industry Mill
  {
    key: "industryMill",
    name: "Industry Mill",
    type: "production",
    icon: "🏗️",
    produces: { logs: 25, clay: 25, stone: 25 },
    cost: { logs: 1000, stone: 1000, mythril: 2000, silktoneObsidian: 750, lumenQuartz: 500, starpetalOre: 100, },
    supportedTerrains: ["Meadow", "Hills"],
    blueprintTier: "ultra",
    titheBonus: 10,
  },
  {
    key: "queensDock",
    name: "Queen's Dock",
    type: "production",
    icon: "👑",
    produces: { fish: 24, meat: 6, gold: 35 },
    cost: { logs: 220, stone: 160, clay: 90, goldOre: 12, magicalEssence: 4 },
    supportedTerrains: ["Ocean", "River", "Deep Ocean"],
    blueprintTier: "ultra",
    waterAccess: true,
  },






  // Unorganized Production Buildings


  {
    key: "dock",
    name: "Dock",
    type: "utility",
    icon: "⚓",
    cost: {logs: 90, stone: 60, clay: 20},
    supportedTerrains: ["Ocean", "River"],
    blueprintTier: "default",
    waterAccess: true,
  },

  // Mines
  {
    key: "mineShaft",
    name: "Mine Shaft",
    type: "production",
    icon: "⛏️",
    produces: {stone: 20, mythril: 3, meadowheartOpal: 1, gold: 10 },
    cost: { logs: 60, stone: 80 },
    supportedTerrains: ["Hills", "Mountains", "Crystal Cavern"],
    blueprintTier: "default",
  },
  {
    key: "deepMineShaft",
    name: "Deep Mine Shaft",
    type: "production",
    icon: "⛏️",
    produces: {stone: 50,  mythril: 10, meadowheartOpal: 5, goldOre: 2, gold: 25 },
    cost: { logs: 80, stone: 120, mythril: 4 },
    supportedTerrains: ["Hills", "Mountains", "Crystal Cavern"],
    blueprintTier: "library",
    upgradeFrom: "mineShaft",
  },
  {
    key: "grandMine",
    name: "Grand Mine",
    type: "production",
    icon: "⚒️",
    produces: {stone: 150,  mythril: 25, meadowheartOpal: 25, goldOre: 15,  silktoneObsidian: 15, lumenQuartz: 15, starpetalOre: 1, gold: 45 },
    cost: { logs: 110, stone: 160, mythril: 6, starpetalOre: 2 },
    supportedTerrains: ["Mountains", "Crystal Cavern"],
    blueprintTier: "apex",
    upgradeFrom: "deepMineShaft",
  },
  {
    key: "mineHub",
    name: "Mine Hub",
    type: "production",
    icon: "🏗️",
    produces: {stone: 250,  mythril: 50, meadowheartOpal: 50, goldOre: 25, silktoneObsidian: 20, lumenQuartz: 20, starpetalOre: 2, gold: 75 },
    cost: { logs: 160, stone: 220, mythril: 8, starpetalOre: 6, lumenQuartz: 2 },
    supportedTerrains: ["Mountains", "Crystal Cavern"],
    blueprintTier: "ultra",
    upgradeFrom: "grandMine",
  },

  // Decorations
  {
    key: "statue",
    name: "Statue",
    type: "decoration",
    icon: "🗽",
    happinessBonus: 3,
    cost: { stone: 40, goldOre: 6 },
    blueprintTier: "default",
  },
  {
    key: "fountain",
    name: "Fountain",
    type: "decoration",
    icon: "⛲",
    happinessBonus: 4,
    cost: { stone: 40, clay: 20, mythril: 2, goldOre: 4 },
    blueprintTier: "library",
  },
  {
    key: "banner",
    name: "Banners",
    type: "decoration",
    icon: "🚩",
    happinessBonus: 2,
    cost: { logs: 10, clay: 5, goldOre: 2 },
    blueprintTier: "default",
  },

  // Research Structures
  {
    key: "techLab",
    name: "Tech Lab",
    type: "utility",
    icon: "🧪",
    produces: { magicalEssence: 1},
    cost: {logs: 80, stone: 40, lumenQuartz: 10, mythril: 10},
    blueprintTier: "default",
  },
  {
    key: "library",
    name: "Library",
    type: "utility",
    icon: "📚",
    happinessBonus: 2,
    cost: { logs: 90, stone: 60, lumenQuartz: 2 },
    blueprintTier: "default",
    unlockSets: ["library"],
    courierBonus: 1,
  },
  {
    key: "apexResearch",
    name: "Apex Research Laboratory",
    type: "utility",
    icon: "🔬",
    happinessBonus: 3,
    cost: { logs: 140, stone: 100, lumenQuartz: 4, magicalEssence: 2 },
    blueprintTier: "library",
    unlockSets: ["apex"],
    courierBonus: 1,
  },
  {
    key: "apexBastion",
    name: "Ultra Apex Bastion",
    type: "utility",
    icon: "🏯",
    happinessBonus: 4,
    cost: { logs: 200, stone: 160, lumenQuartz: 6, magicalEssence: 4, mythril: 4 },
    blueprintTier: "apex",
    unlockSets: ["ultra"],
  },
];

export const LIBRARY_UNLOCKS = [
  "largeOrchard",
  "largeFarm",
  "largeHerbGarden",
  "largePasture",
  "deepMineShaft",
  "fountain",
  "villa",
  "largeMortarQuarry",
  "largeSawmill",
  "largeFishmansWharf",
  "apexResearch",
];

export const APEX_UNLOCKS = [
  "orchardOfTheGods",
  "farmOfTheGods",
  "herbGardenOfTheGods",
  "pastureOfTheGods",
  "grandMine",
  "mortarQuarryOfTheGods",
  "sawmillOfTheGods",
  "fishmansWharfOfTheGods",
  "mansion",
  "manor",
  "apexBastion",
];

export const ULTRA_UNLOCKS = ["mineHub", "evergarden", "industryMill", "queensDock"];
