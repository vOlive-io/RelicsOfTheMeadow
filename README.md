# 🌿 Relics of the Meadow

*A cozy survival sandbox about building, exploring, crafting, and facing ancient Beasts in a living, ever-expanding world.*

Play the GitHub Pages build here:  
👉 https://volive-io.github.io/RelicsOfTheMeadow/

## 🚀 Quick Start

1. Clone the repo (or download the ZIP) and open `index.html` in any modern browser.
2. Click **“Enter the Meadow”** to pick your faction and load the HUD (`src/game/index.html`).
3. Select a clearing on the map, station troops (to reveal nearby tiles), and start exploring.
4. Use the **🔨 Build** action to raise structures and the **🏛️ Gifts** action to manage Keep couriers.
5. Harvest periodically, host Festivals, and hunt Beasts as they appear on the grid.

## 🧩 Core Systems

| System | Details |
| --- | --- |
| **Even 5×5 Grid** | The map always spawns as a balanced 5×5 square. Tiles expand outward as you explore. |
| **Wild → Revealed Clearings** | Every clearing begins as a Wild tile. Station troops (garrisons) to reveal the terrain and earn a dashed border for that outpost. |
| **Gifts & Couriers** | There is no trade with rival nations. Instead, you send offerings via couriers and collect gifts for the Keep. Couriers are limited per turn, and gifts replace the old import system. |
| **Blueprint Research** | Basic blueprints are available immediately. Build a **Library** to unlock large structures, an **Apex Research Laboratory** for “of the Gods” upgrades, and an **Ultra Apex Bastion** for final-tier wonders (Mine Hub, Evergarden, Industry Mill). |
| **Food & Happiness** | Wheat, Fruits, and Meat feed your people. Each turn consumes food based on population; shortages reduce Happiness. Meat comes from the new Pasture line. |
| **Production Tiers** | Non-mine production buildings follow the `Basic → Large → <Name> of the Gods` pattern. Mines keep their own upgrade path, culminating in the Mine Hub once ultra research is achieved. |
| **Beasts & Exploration** | Oceans only form next to Beach tiles, and Deep Oceans require Ocean neighbors. Exploring from a garrison reveals adjacent Wilds, and Beast encounters can be triggered directly from the map. |

## 🕹️ Controls & Flow

- **Station Troops** – Select a clearing and click *Station Troops* to reveal nearby Wild tiles. Garrisoned tiles get a dashed border and unlock “Move Troops” buttons for adjacent clearings.
- **Explore** – Buttons beneath the map let you scout in cardinal directions (costs ⚡1). Newly discovered tiles stay Wild until troops arrive.
- **Build** – Opens the blueprint list (filtered to unlocked tiers). Costs scale with how many copies of a structure you’ve built.
- **Harvest** – Collect output from every production building at once, including event/festival modifiers.
- **Gifts** – Manage couriers and Keep parcels. Dispatch offerings for gold or open gifts waiting at the Keep.
- **Festival** – Spend Fruits and Wheat to temporarily boost happiness and production.
- **Battle** – Move troops into Beast-marked clearings and fight through the dedicated “Battle Beast” button.

## 📁 Project Layout

```
src/
├── data/          # Factions, building definitions, resources, events
├── game/          # Main HUD, bootstrap helpers, older turn prototypes
├── managers/      # Map, crafting, resources, population, events, combat
├── styles/        # Split CSS files (layout, map, panels, buttons, etc.)
├── ui/            # UI helpers (map grid, resource & population panels)
└── utils/         # Shared calculators (derived stats, helpers)
```

## 🛠️ Debug / Dev Notes

- Use the browser console to inspect `player` or to set `window.player = player` for quick cheats during testing.
- `getActiveEvents()` (from `eventManager`) shows which seasonal buffs are running; the ticker at the top of the HUD mirrors the same info.
- Resources remain hidden until you’ve earned them at least once, keeping the HUD tidy. Ore subtypes (Mythril, Gold, Meadowheart Opal, Silktone Obsidian, Starpetal Ore, Lumen Quartz) all live under an “Ores” group in the resource panel.
- Garrisoning is the only way to reveal terrain, so remember to move troops as you expand—especially before engaging Beasts.

Happy building, Keeper! 🌱
