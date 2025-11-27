/////////////////////////////////////
/// MODULE IMPORTS               ///
/////////////////////////////////////
import { getMapClearings, NEUTRAL_OWNER } from "../managers/mapManager.js";

const terrainGradients = {
  Meadow: "linear-gradient(135deg, #b9f6cf 0%, #6ac59a 70%)",
  Forest: "linear-gradient(135deg, #0f3d2a 0%, #1f6f50 50%, #2fa36a 100%)",
  Hills: "linear-gradient(135deg, #c9d4a5 0%, #9aa86b 65%, #7f8c55 100%)",
  Mountains: "linear-gradient(135deg, #dfe4ec 0%, #9ca6b7 55%, #6f7b8c 100%)",
  River: "linear-gradient(135deg, #d9f3ff 0%, #9bd2f6 60%, #6eb7e3 100%)",
  Marsh: "linear-gradient(135deg, #c7d7b4 0%, #7a8f6a 60%, #556a4b 100%)",
  "Crystal Cavern": "linear-gradient(135deg, #e1d9ff 0%, #bca6ff 55%, #8d78d9 100%)",
  "Ancient Grove": "linear-gradient(135deg, #d3f5c0 0%, #a9e08a 55%, #6fa95d 100%)",
  Ocean: "linear-gradient(135deg, #f5deb3 0%, #f0c987 55%, #e8b973 100%)",
  "Deep Ocean": "linear-gradient(135deg, #a8d5f5 0%, #5e9fd3 60%, #387ab1 100%)",
  "Enfenal Depths": "linear-gradient(135deg, #d6e4ff 0%, #9ab1ff 55%, #5366ba 100%)",
  unknown: "linear-gradient(135deg, #e8f5e9 0%, #c8d6c6 55%, #9aafa0 100%)",
};
const terrainEmojis = {
  Meadow: "🌿",
  Forest: "🌲",
  Hills: "⛰️",
  Mountains: "🏔️",
  River: "🏞️",
  Marsh: "🦠",
  Ocean: "🏝️",
  "Deep Ocean": "🌊",
  "Enfenal Depths": "🌊",
  "Crystal Cavern": "💎",
  "Ancient Grove": "🌳",
};

/////////////////////////////////////
/// STATE                         ///
/////////////////////////////////////
let gridElement = null;
let tooltipElement = null;
let selectHandler = null;
let tooltipFormatter = null;

/////////////////////////////////////
/// FUNCTIONS                     ///
/////////////////////////////////////
export function initMapUI({ gridElementId, tooltipElementId, onSelect }) {
  gridElement = document.getElementById(gridElementId);
  tooltipElement = document.getElementById(tooltipElementId);
  selectHandler = typeof onSelect === "function" ? onSelect : null;
}

function showTooltip(clearing, event) {
  if (!tooltipElement || typeof tooltipFormatter !== "function") return;
  tooltipElement.innerHTML = tooltipFormatter(clearing);
  tooltipElement.classList.remove("hidden");
  const { clientX, clientY } = event;
  tooltipElement.style.left = `${clientX + 12}px`;
  tooltipElement.style.top = `${clientY + 12}px`;
}

function hideTooltip() {
  if (!tooltipElement) return;
  tooltipElement.classList.add("hidden");
}

export function renderMap({
  selectedClearingId,
  formatOwnerLabel,
  getOwnerColor,
  formatStructures,
  formatTooltip,
  isGarrisoned,
  getTroopCount,
}) {
  if (!gridElement) return;
  tooltipFormatter = formatTooltip || null;
  const clearings = getMapClearings();
  if (!clearings.length) {
    gridElement.innerHTML = '<p class="clearing-empty">No territories mapped yet.</p>';
    return;
  }
  gridElement.innerHTML = "";
  const ordered = [...clearings].sort((a, b) => a.id - b.id);
  const minCol = Math.min(...ordered.map(c => c.col));
  const maxCol = Math.max(...ordered.map(c => c.col));
  const columnCount = Math.max(1, maxCol - minCol + 1);
  gridElement.style.gridTemplateColumns = `repeat(${columnCount}, minmax(64px, 1fr))`;
  ordered.forEach(clearing => {
    const tile = document.createElement("button");
    tile.dataset.id = clearing.id;
    const classes = ["clearing-tile"];
    if (clearing.id === selectedClearingId) classes.push("clearing-selected");
    if (clearing.capitalOf) classes.push("clearing-capital");
    if (clearing.owner && clearing.owner !== NEUTRAL_OWNER) {
      classes.push("clearing-player");
    }
    if (clearing.beast) classes.push("clearing-beast");
    if (!clearing.revealed) classes.push("clearing-hidden");
    if (typeof isGarrisoned === "function" && isGarrisoned(clearing.id)) {
      classes.push("clearing-garrisoned");
    }
    tile.className = classes.join(" ");
    tile.type = "button";
    const background = clearing.revealed ? terrainGradients[clearing.terrain] || terrainGradients.unknown : "";
    tile.style.background = background || "";
    tile.style.backgroundImage = "";
    tile.style.backgroundSize = "";
    tile.style.backgroundPosition = "";
    tile.style.borderColor =
      typeof getOwnerColor === "function" ? getOwnerColor(clearing.owner) : "#5ba571";
    const structures = Array.isArray(clearing.structures) ? clearing.structures : [];
    const structureText =
      typeof formatStructures === "function"
        ? formatStructures(structures)
        : structures.slice(-2).join(", ") || "";
    const terrainEmoji = clearing.revealed ? terrainEmojis[clearing.terrain] || "◻️" : "❔";
    const troops =
      clearing.revealed && typeof getTroopCount === "function" ? getTroopCount(clearing.id) : 0;
    tile.innerHTML = `
      <span class="clearing-terrain corner-icon">${terrainEmoji}</span>
      <span class="clearing-owner">${
        clearing.revealed
          ? typeof formatOwnerLabel === "function"
            ? formatOwnerLabel(clearing.owner)
            : ""
          : "Unrevealed"
      }</span>
      <span class="clearing-structures">${
        clearing.revealed ? structureText : "Unknown"
      }</span>
      ${troops > 0 ? `<span class="clearing-troops">🪖 ${troops}</span>` : ""}
    `;
    tile.addEventListener("click", () => {
      if (selectHandler) selectHandler(clearing.id);
    });
    tile.addEventListener("mouseenter", event => showTooltip(clearing, event));
    tile.addEventListener("mousemove", event => showTooltip(clearing, event));
    tile.addEventListener("mouseleave", hideTooltip);
    gridElement.appendChild(tile);
  });
}
