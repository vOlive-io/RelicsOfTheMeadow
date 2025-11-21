export const beastCatalog = [
  {
    type: "Meadow Stag",
    strength: 2,
    health: 80,
    habitats: ["Meadow"],
    rewards: {
      meat: 4,
      herbs: 4,
      magicalEssence: 10,
    },
  },
  {
    type: "Forest Alpha",
    strength: 3,
    health: 100,
    habitats: ["Forest"],
    rewards: {
      meat: 5,
      herbs: 6,
      spices: 2,
      logs: 8,
      magicalEssence: 10,
    },
  },
  {
    type: "Hills Golem",
    strength: 4,
    health: 120,
    habitats: ["Hills"],
    rewards: {
      stone: 18,
      goldOre: 3,
      magicalEssence: 10,
    },
  },
  {
    type: "Mega Crab",
    strength: 4,
    health: 110,
    habitats: ["Beach"],
    rewards: {
      seashells: 6,
      crabMeat: 6,
      seaweed: 6,
      magicalEssence: 10,
    },
  },
  {
    type: "Mountain Beast",
    strength: 4,
    health: 120,
    habitats: ["Mountains"],
    rewards: {
      mythril: 3,
      starpetalOre: 1,
      magicalEssence: 10,
    },
  },
  {
    type: "River Serpent",
    strength: 3,
    health: 100,
    habitats: ["River"],
    rewards: {
      fish: 8,
      herbs: 2,
      magicalEssence: 10,
    },
  },
  {
    type: "Marsh Horror",
    strength: 3,
    health: 90,
    habitats: ["Marsh"],
    rewards: {
      clay: 10,
      herbs: 6,
      magicalEssence: 10,
    },
  },
  {
    type: "Sea Serpent",
    strength: 5,
    health: 150,
    habitats: ["Ocean"],
    rewards: {
      fish: 10,
      pearls: 2,
      lumenQuartz: 1,
      magicalEssence: 10,
    },
  },
  {
    type: "Deep Leviathan",
    strength: 7,
    health: 200,
    habitats: ["Deep Ocean"],
    rewards: {
      fish: 12,
      pearls: 4,
      lumenQuartz: 3,
      magicalEssence: 10,
    },
  },
  {
    type: "Crystal Wyrm",
    strength: 5,
    health: 160,
    habitats: ["Crystal Cavern"],
    rewards: {
      lumenQuartz: 4,
      meadowheartOpal: 2,
      magicalEssence: 10,
    },
  },
  {
    type: "Grove Guardian",
    strength: 4,
    health: 130,
    habitats: ["Ancient Grove"],
    rewards: {
      herbs: 8,
      fruits: 6,
      spices: 4,
      meadowheartOpal: 1,
      magicalEssence: 10,
    },
  },
  {
    type: "Beast",
    strength: 3,
    health: 100,
    habitats: ["Any"],
    rewards: {
      mythril: 2,
      magicalEssence: 10,
    },
  },
];

export function getBeastDefinition(type) {
  return beastCatalog.find(entry => entry.type === type) || null;
}
