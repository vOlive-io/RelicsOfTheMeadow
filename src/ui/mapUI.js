/////////////////////////////////////
/// MODULE IMPORTS               ///
/////////////////////////////////////
import { getMapClearings, NEUTRAL_OWNER } from "../managers/mapManager.js";

const terrainEmoji = {
  Meadow: "🌿",
  Forest: "🌲",
  Hills: "⛰️",
  Beach: "🏝️",
  Mountains: "🏔️",
  River: "🌊",
  Marsh: "🪵",
  "Crystal Cavern": "💎",
  "Ancient Grove": "🌳",
  Ocean: "🌊",
  "Deep Ocean": "🌊",
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
    tile.style.borderColor =
      typeof getOwnerColor === "function" ? getOwnerColor(clearing.owner) : "#5ba571";
    const structures = Array.isArray(clearing.structures) ? clearing.structures : [];
    const structureText =
      typeof formatStructures === "function"
        ? formatStructures(structures)
        : structures.slice(-2).join(", ") || "—";
    const terrainIcon = clearing.revealed
      ? terrainEmoji[clearing.terrain] || "◻️"
      : "❓";
    tile.innerHTML = `
      <span class="clearing-id">#${clearing.id}</span>
      <span class="clearing-terrain">${terrainIcon}</span>
      <span class="clearing-owner">${
        clearing.revealed
          ? typeof formatOwnerLabel === "function"
            ? formatOwnerLabel(clearing.owner)
            : clearing.owner || "—"
          : "🌲 Wild"
      }</span>
      <span class="clearing-structures">${
        clearing.revealed ? structureText : "Unknown"
      }</span>
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
