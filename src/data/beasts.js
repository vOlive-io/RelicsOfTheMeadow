export const beastCatalog = [
  {
    type: "Mountain Beast",
    strength: 4,
    health: 120,
    rewards: { mythril: 3, starpetalOre: 1 },
  },
  {
    type: "Deep Leviathan",
    strength: 7,
    health: 200,
    rewards: { mythril: 4, starpetalOre: 2, lumenQuartz: 2, magicalEssence: 1 },
  },
  {
    type: "Beast",
    strength: 3,
    health: 100,
    rewards: { mythril: 2 },
  },
];

export function getBeastDefinition(type) {
  return beastCatalog.find(entry => entry.type === type) || null;
}
