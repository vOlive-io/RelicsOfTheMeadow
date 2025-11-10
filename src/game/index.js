import { StateManager } from './stateManager.js';

const state = new StateManager();
state.loadData();

// Example usage:
state.factions['crimson_horde'].addRelic('horn_of_fury');
state.factions['crimson_horde'].traits.prowess += 2;

console.log(state.factions['crimson_horde']);
state.saveGame();


// === Relics of the Meadow: Board Generator === //

const boardElement = document.getElementById("board");

const terrainTypes = [
  { name: "Forest", emoji: "🌲", color: "#3b7a57" },
  { name: "Meadow", emoji: "🌿", color: "#7ec850" },
  { name: "Ruin", emoji: "🏚️", color: "#7d5a4f" },
  { name: "River", emoji: "💧", color: "#4fc3f7" },
  { name: "Mountain", emoji: "⛰️", color: "#8d8c8a" }
];

function generateMap() {
  const clearings = [];
  for (let i = 0; i < 25; i++) {
    const randomTerrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
    clearings.push({
      id: i + 1,
      terrain: randomTerrain.name,
      emoji: randomTerrain.emoji,
      color: randomTerrain.color,
      owner: null
    });
  }
  state.map = clearings; // store it in the game state
  return clearings;
}

function renderBoard(clearings) {
  const board = document.getElementById("board");
  clearings.forEach(clearing => {
    const div = document.createElement("div");
    div.classList.add("clearing");
    div.style.backgroundColor = clearing.color;
    div.innerHTML = `
      <span class="emoji">${clearing.emoji}</span>
      <span class="id">#${clearing.id}</span>
    `;
    div.addEventListener("click", () => handleClearingClick(clearing));
    board.appendChild(div);
  });
}

function handleClearingClick(clearing) {
  const faction = state.factions['crimson_horde']; // example
  alert(`Clearing #${clearing.id}\nTerrain: ${clearing.terrain}`);
  clearing.owner = faction.name;
  console.log(`${faction.name} now controls Clearing #${clearing.id}`);
}

// Create and render the board
const map = generateMap();
renderBoard(map);
