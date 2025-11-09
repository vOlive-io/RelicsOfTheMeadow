// src/utils/fileLoader.js
// Browser-based loader version for GitHub Pages (uses fetch instead of fs)

export async function loadFactions() {
  const factionFiles = [
    "crimson_horde.json",
    "devoured_faith.json",
    "jade_empire.json",
    "meadowfolk_union.json",
    "mycelid_monarchy.json",
    "spider_court.json",
  ];

  const factions = {};

  for (const file of factionFiles) {
    const key = file.replace(".json", "");
    const res = await fetch(`./data/factions/${file}`);
    const json = await res.json();
    factions[key] = json;
  }

  return factions;
}

export async function loadRelics() {
  const relicCategories = [
    "bane_and_friend",
    "economy",
    "faction_specific",
    "prowess",
    "resilience",
  ];

  const relics = {};

  for (const category of relicCategories) {
    relics[category] = {};
    const folder = `./data/relics/${category}`;

    // You’ll need to list files manually or store filenames in JSON
    // This simple version assumes you’ll add them by hand for now
  }

  return relics;
}
