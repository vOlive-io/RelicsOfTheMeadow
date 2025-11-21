export const beastCatalog = [
  {
    type: "Mountain Beast",
    strength: 4,
    health: 120,
    rewards: { mythril: 3, starpetalOre: 1, magicalEssence: 10 },
  },
  {
    type: "Deep Leviathan",
    strength: 7,
    health: 200,
    rewards: { mythril: 5, lumenQuartz: 2, magicalEssence: 15 },
  },
  {
    type: "Medeaw Beast",
    strength: 3,
    health: 150,
    rewards: { amberWheat: 2, mythril: 2, magicalEssence: 10 },
  },
];

export function getBeastDefinition(type) {
  return beastCatalog.find(entry => entry.type === type) || null;
}
