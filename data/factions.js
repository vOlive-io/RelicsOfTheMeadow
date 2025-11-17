// Faction Data for Relics of the Meadow 🌿

function gainGold(player, amount) {
  if (!amount) return 0;
  if (typeof player?.gainGold === "function") {
    return player.gainGold(amount);
  }
  const current = Math.max(0, player?.gold || 0);
  const next = current + amount;
  player.gold = next;
  return amount;
}

const factionDefinitions = [
// === The Crimson Horde ===
  {
    name: "The Crimson Horde",
    emoji: "🐺",
    overview: "Where they march, the ground remembers blood.",
    fullLore:
      "The Crimson Horde are conquerors driven by vengeance. Formed from the broken remnants of empires lost to betrayal, they rise as one under banners of fury. Their unity is born not of loyalty, but of wrath—a singular purpose to reclaim and avenge what was taken from them. Once forgotten, they are now the nightmare the six great powers hoped never to remember.\n\nIn gameplay, the Horde excels in overwhelming assault and vengeance-based mechanics. When one of their settlements falls, their power surges in response, turning loss into momentum, burning everything to reclaim their pride.",
    abilities: [
      {
        name: "Loot",
        desc: "Ransack conquered territory to swell your war chest.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          const gain = Math.max(20, Math.floor(player.troops * 0.5));
          const added = gainGold(player, gain);
          logEvent(`🐺 Horde forces loot ${added} gold from the fallen.`);
        },
      },
      {
        name: "Raid",
        desc: "Unleash a rapid assault to swell ranks at the cost of morale.",
        cost: { energy: 2, gold: 0 },
        logic: ({ player, logEvent, targetFaction }) => {
          if (!targetFaction) {
            logEvent("🐺 The Horde needs a target to raid.");
            return;
          }
          player.troops += 8;
          player.protection = Math.max(0, player.protection + 1);
          player.happiness = Math.max(0, player.happiness - 1);
          logEvent(`🐺 Raiders strike ${targetFaction.name}! Troops surge, but the people grow uneasy.`);
        },
      },
      {
        name: "Consume",
        desc: "Sacrifice warriors to feed the fury within.",
        cost: { energy: 0, gold: 0 },
        logic: ({ player, logEvent }) => {
          if (player.troops < 5) {
            logEvent("Not enough warriors to consume for vengeance.");
            return;
          }
          player.troops -= 5;
          player.energy += 2;
          player.protection = Math.max(0, player.protection + 1);
          logEvent("🔥 The Horde consumes its own to fuel an unstoppable rage.");
        },
      },
    ],
    startingRelic: "🩸 Horn of Fury",
    defaultTraits: { prowess: "9/10", resilience: "2/10", economy: "4/10" },
    defaultEmojis: { prowess: "🔥🔥🔥🔥🔥", resilience: "🌱", economy: "💰💰" },

    relationships: {
      "Devoured Faith": "neutral",
      "Silken Dominion": "neutral",
      "Meadowfolk Union": "neutral",
      "Jade Empire": "neutral",
      "Mycelial Monarchy": "neutral",
      "Crimson Horde": "self",
    },
    flag: "",
    palette: ["#8B0000", "#4B4B4B", "#000000"],
  },

// === The Devoured Faith ===
  {
    name: "The Devoured Faith",
    emoji: "🕯️",
    overview: "They worship what devours them. They kneel to the hunger they cannot escape.",
    fullLore:
      "When the Horde’s wrath scorched the land, not all who survived clung to vengeance. Some sought meaning in ruin—and found it in the dark mouths of what came next. The Devoured Faith was born from desperation, a cult that turned surrender into sanctity. They believe the world’s decay is divine and that to be consumed—by plague, by war, by the gods themselves—is to achieve purity.\n\nThe Faith thrives beneath cathedrals of bone and fungus, their hymns echoing in caverns carved by hunger. They trade in despair, offering salvation through sacrifice and control through devotion. Their priests wield relics and rot alike, scavenging from what others leave behind. Rather than wage open war, they drift in after destruction, harvesting whatever remains—land, relics, or lives. Their rituals are quiet and unsettling, transforming ruin into resource.\n\nIn gameplay, they alone can steal relics from other factions, feeding their power through theft and devotion. They earn points by scavenging relics and resources from abandoned or devastated regions, turning desolation into strength. Though their rituals may appear ominous, the Faith are not destroyers—they are the quiet cleanup crew of the fallen world, inheritors of what others abandon. Their obsession with relics, however, corrodes their surroundings, slowly draining their resilience as their faith’s hunger spreads across the land.",
    abilities: [
      {
        name: "Delve",
        desc: "Spend vast energy and coin to unearth forbidden relics.",
        cost: { energy: 4, gold: 120 },
        logic: ({ acquireRelic, logEvent }) => {
          const relic = acquireRelic?.({ reason: "Devoured Faith Delve" });
          if (relic) {
            logEvent(`🕯️ Delve recovered ${relic} from the ashes!`);
          } else {
            logEvent("🕯️ The catacombs held only dust this time.");
          }
        },
      },
      {
        name: "Sanctify",
        desc: "Burn offerings to empower your zealots.",
        cost: { energy: 1, gold: 25 },
        logic: ({ player, logEvent }) => {
          const tithe = gainGold(player, 40);
          player.happiness = Math.max(0, player.happiness - 1);
          logEvent(`🕯️ Sanctification complete. +${tithe} gold flows from fearful believers.`);
        },
      },
      {
        name: "Encamp",
        desc: "Raise a citadel to shield the faithful.",
        cost: { energy: 2, gold: 20 },
        logic: ({ player, logEvent }) => {
          player.protection += 3;
          logEvent("⛪ A new citadel rises, bolstering your protection.");
        },
      },
      {
        name: "Infiltration",
        desc: "Plant agents among buyers of your relics.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          const bonus = Math.max(1, player.declaredWars.length) * 3;
          player.troops += bonus;
          logEvent(`🕯️ Hidden agents muster ${bonus} warriors behind enemy lines.`);
        },
      },
    ],
    startingRelic: "🕯️ Chalice of Ash",
    defaultTraits: { prowess: "6/10", resilience: "6/10", economy: "3/10" },
    defaultEmojis: { prowess: "🔥🔥🔥", resilience: "🌱🌱🌱", economy: "💰" },

    relationships: {
      "Devoured Faith": "self",
      "Silken Dominion": "neutral",
      "Meadowfolk Union": "neutral",
      "Jade Empire": "neutral",
      "Mycelial Monarchy": "neutral",
      "Crimson Horde": "neutral",
    },
    flag: "",
    palette: ["#0F1417", "#C9B037", "#004E59"],
  },

// === The Jade Empire ===
  {
    name: "The Jade Empire",
    emoji: "🐉",
    overview: "Gold flows like a river—and that’s exactly where the Jade Empire sits.",
    fullLore:
      "The Jade Empire thrives on the pulse of trade. To them, profit is not merely power—it is survival. Built upon centuries of mercantile mastery, they dominate diplomacy and commerce alike, holding the world’s economies in their emerald grasp. The frogs, doves, and cranes each serve a distinct role: the frogs are merchants and politicians, the doves handle diplomacy, and the few remaining cranes work as mercenaries protecting the markets.\n\nTheir empire values wealth above all else. If exile promises gold, they will gladly sell peace to the highest bidder. Other factions rely heavily on their networks; should the Jade Empire cut trade with one, others soon follow. This interwoven reliance ensures their control—starvation of supply and alliance alike.\n\nIn gameplay, they dictate trade and diplomacy. The Jade Empire can impose embargoes, grant favor, or manipulate trade to raise or ruin economies. They earn wealth through transactions and alliances, making every move at the table flow through them. Yet their greed makes them vulnerable—should their trade web collapse, so too does their influence.",
    abilities: [
      {
        name: "Taxes",
        desc: "Skim profits from every trade route you touch.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          const gain = 30 + player.alliances.length * 10;
          const tithe = gainGold(player, gain);
          logEvent(`🐉 Imperial tax collectors return with ${tithe} gold.`);
        },
      },
      {
        name: "Diplomats",
        desc: "Dispatch doves to reset the political table.",
        cost: { energy: 2, gold: 30 },
        logic: ({ player, logEvent }) => {
          if (player.declaredWars.length) {
            player.declaredWars = [];
            logEvent("🐉 Diplomatic envoys enforce peace across your wars.");
          } else {
            player.happiness += 1;
            logEvent("🐉 Diplomats forge new accords, boosting morale.");
          }
        },
      },
    ],
    startingRelic: "🐉 Coin of Currents",
    defaultTraits: { prowess: "3/10", resilience: "4/10", economy: "8/10" },
    defaultEmojis: { prowess: "🔥", resilience: "🌱🌱", economy: "💰💰💰💰" },
    relationships: {
      "Devoured Faith": "neutral",
      "Silken Dominion": "neutral",
      "Meadowfolk Union": "neutral",
      "Jade Empire": "self",
      "Mycelial Monarchy": "neutral",
      "Crimson Horde": "neutral",
    },
    flag: "",
    palette: ["#00FF7F", "#20B2AA", "#FFFFFF"],
  },

// === The Meadowfolk Union ===
  {
    name: "The Meadowfolk Union",
    emoji: "🐾",
    overview: "The grass remembers every step, and the earth rises to meet its keepers.",
    fullLore:
      "The Meadowfolk Union are builders, tenders, and dreamers. They thrive on harmony between land and life, weaving a civilization from roots and sunlight. Once scattered across open plains, the Meadowfolk united to resist conquest—not through might, but through unity and patience. They measure time in harvests, not wars, and see prosperity as something cultivated, not taken.\n\nIn gameplay, the Union excels in synergy and growth. They gain strength from cooperation—units that stand together become stronger, and clearings left in peace reward them richly. Their structures and trade routes bloom faster when left undisturbed, turning stability into power. They represent the patient hand of creation in a world obsessed with destruction.",
    abilities: [
      {
        name: "Harmony",
        desc: "Let tranquil lands restore your people.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          player.resilience = Math.min(10, player.resilience + 2);
          player.happiness += 1;
          logEvent("🌾 Harmony blooms, lifting resilience and spirits.");
        },
      },
      {
        name: "Cooperation",
        desc: "Neighbors pool harvests for shared prosperity.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          const gain = 35;
          const added = gainGold(player, gain);
          logEvent(`🌾 Cooperation yields an extra ${added} gold in shared economy.`);
        },
      },
      {
        name: "Regrow",
        desc: "Rebuild a thriving meadow after devastation.",
        cost: { energy: 1, gold: 10 },
        logic: ({ player, logEvent }) => {
          player.protection += 2;
          player.happiness += 1;
          logEvent("🌾 Ruins turn to bloom again. Defenses and joy rise.");
        },
      },
    ],
    startingRelic: "🌾 Heart of Spring",
    defaultTraits: { prowess: "4/10", resilience: "7/10", economy: "5/10" },
    defaultEmojis: { prowess: "🔥🔥", resilience: "🌱🌱", economy: "💰💰" },
    relationships: {
      "Devoured Faith": "neutral",
      "Silken Dominion": "neutral",
      "Meadowfolk Union": "self",
      "Jade Empire": "neutral",
      "Mycelial Monarchy": "neutral",
      "Crimson Horde": "neutral",
    },
    flag: "",
    palette: ["#4CAF50", "#FFD700", "#87CEEB"],
  },

// === The Silken Dominion ===
  {
    name: "The Silken Dominion",
    emoji: "🕷️",
    overview: "They whisper from the walls, and their webs glisten with secrets and lies.",
    fullLore:
      "Hidden beneath layers of silk and intrigue, the Silken Dominion spins control through manipulation. Where others wage wars with armies, they fight with whispers, contracts, and poisoned promises. Their society is ruled by spider nobles, each vying for influence, spinning webs that bind lesser creatures into servitude or debt. To outsiders, they appear fragmented—yet every web leads back to the throne.\n\nIn gameplay, the Silken Dominion specialize in subterfuge. They drain enemies slowly, stealing resources and corrupting trade. They gain power from the spread of webs across the map, strangling rival economies in the name of the Spider Court. The more territory they weave, the more they entrap the world.",
    abilities: [
      {
        name: "SpinWeb",
        desc: "Extend webs to skim markets and free up caravans.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          const base = 20 + (player.tradePosts || 0) * 5;
          const gain = gainGold(player, base);
          if ((player.tradePosts || 0) > 0) {
            player.tradesRemaining = Math.min(
              player.tradePosts,
              Math.max(0, (player.tradesRemaining || 0) + 1)
            );
          }
          logEvent(`🕷️ New webs glisten with coin. +${gain} gold and a caravan untangles.`);
        },
      },
      {
        name: "Relic Weave",
        desc: "Call on Spinster halls to weave a relic of silk and secrets.",
        cost: { energy: 3, gold: 60 },
        logic: ({ player, logEvent, acquireRelic }) => {
          if (!player.unlockedAbilityTags?.has?.("spinster")) {
            logEvent("🕷️ You need a Spinster's Hut or Mansion to weave relics.");
            return;
          }
          const relic = acquireRelic?.({ reason: "Silken Relic Weave" });
          if (relic) {
            logEvent(`🕷️ Spinner queens unveil the ${relic}!`);
          } else {
            logEvent("🕷️ The looms snap—no relic emerges this time.");
          }
        },
      },
      {
        name: "Entangle",
        desc: "Trap merchants to steal their wares.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          player.imports += 1;
          const spoils = gainGold(player, 12);
          logEvent(`🕷️ Entangled traders surrender an import crate and ${spoils} gold.`);
        },
      },
    ],
    startingRelic: "🕸️ Spinner’s Veil",
    defaultTraits: { prowess: "3/10", resilience: "6/10", economy: "6/10" },
    defaultEmojis: { prowess: "🔥", resilience: "🌱🌱🌱", economy: "💰💰💰" },
    relationships: {
      "Devoured Faith": "neutral",
      "Silken Dominion": "self",
      "Meadowfolk Union": "neutral",
      "Jade Empire": "neutral",
      "Mycelial Monarchy": "neutral",
      "Crimson Horde": "neutral",
    },
    flag: "",
    palette: ["#3B0A45", "#9C27B0", "#C0C0C0"],
  },

// === The Mycelial Monarchy ===
  {
    name: "The Mycelial Monarchy",
    emoji: "🍄",
    overview: "When the old world rots, the new one grows from beneath.",
    fullLore:
      "The Mycelial Monarchy thrives in darkness, spreading unseen through decay and ruin. Born from the fusion of fungus and flesh, their society sees death not as an end, but as fertile ground for renewal. Their rulers, the Sporelords, guide the growth of vast fungal networks that reclaim the fallen world—digesting what once was to fuel what will be.\n\nIn gameplay, they expand relentlessly, spreading spore fields that bolster their resilience and spawn new forces. Where they spread, others falter; poison and rebirth go hand in hand. The Monarchy grows through attrition, favoring endurance and inevitability over direct conquest.",
    abilities: [
      {
        name: "Spread",
        desc: "Extend the spore network.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          player.protection += 1;
          logEvent("🍄 Spores spread, thickening natural defenses.");
        },
      },
      {
        name: "Bloom",
        desc: "Harvest strength from connected spores.",
        cost: { energy: 1, gold: 0 },
        logic: ({ player, logEvent }) => {
          player.resilience = Math.min(10, player.resilience + 2);
          logEvent("🍄 Bloom nourishes your resilience.");
        },
      },
      {
        name: "Rebirth",
        desc: "Raise fungal warriors where foes once fell.",
        cost: { energy: 2, gold: 0 },
        logic: ({ player, logEvent }) => {
          player.troops += 6;
          logEvent("🍄 Fallen ground erupts with reborn Sporelings.");
        },
      },
    ],
    startingRelic: "🍄 Crown of Spores",
    defaultTraits: { prowess: "5/10", resilience: "8/10", economy: "3/10" },
    defaultEmojis: { prowess: "🔥🔥", resilience: "🌱🌱🌱🌱🌱", economy: "💰💰" },   
    relationships: {
      "Devoured Faith": "neutral",
      "Silken Dominion": "neutral",
      "Meadowfolk Union": "neutral",
      "Jade Empire": "neutral",
      "Mycelial Monarchy": "self",
      "Crimson Horde": "neutral",
    },
    flag: "",
    palette: ["#3C1E1E", "#6A994E", "#C9CBA3"],
  },
];

const orderedFactionNames = [
  "The Crimson Horde",
  "The Meadowfolk Union",
  "The Jade Empire",
  "The Devoured Faith",
  "The Silken Dominion",
  "The Mycelial Monarchy",
];

export const factions = orderedFactionNames
  .map(name => factionDefinitions.find(f => f.name === name))
  .filter(Boolean);

console.log("✅ Factions loaded:", factions);
