// src/onboarding/onboarding.js
import {
  getDisplayFactions,
  isFactionEarlyAccess,
} from "../../game/factionManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const factionList = document.getElementById("faction-list");

  const factions = getDisplayFactions();

  if (!factions || !Array.isArray(factions) || !factions.length) {
    factionList.innerHTML = '<p style="color:red;">⚠️ No factions are currently enabled. Use the faction manager to re-enable at least one faction.</p>';
    console.error("No enabled factions available. Use factionManager to enable at least one.");
    return;
  }

  factionList.innerHTML = ""; // clear placeholder

  factions.forEach((faction) => {
    const card = document.createElement("div");
    card.className = "faction-card";
    card.style.border = `3px solid ${faction.palette?.[0] || "#555"}`;
    const earlyAccess = isFactionEarlyAccess(faction.name);

    card.innerHTML = `
      <div class="faction-header">
        <span class="faction-emoji">${faction.emoji || "❓"}</span>
        <h2 class="faction-name">${faction.name}</h2>
      </div>
      <p class="faction-overview">${faction.overview}</p>
      <div class="faction-traits">
        <p>⚔️ <strong>Prowess:</strong> ${faction.defaultEmojis?.prowess ?? "?"}</p>
        <p>🍃 <strong>Resilience:</strong> ${faction.defaultEmojis?.resilience ?? "?"}</p>
        <p>💰 <strong>Economy:</strong> ${faction.defaultEmojis?.economy ?? "?"}</p>
      </div>
      ${
        earlyAccess
          ? '<span class="access-chip">Early Access Preview</span>'
          : ""
      }
      <button class="select-btn">View Details</button>
    `;

    card.querySelector(".select-btn").addEventListener("click", () => {
      openFactionModal(faction, { earlyAccess });
    });

    factionList.appendChild(card);
  });
});

function openFactionModal(faction, { earlyAccess }) {
  const overlay = document.createElement("div");
  overlay.className = "faction-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "faction-modal";

  modal.innerHTML = `
    <button class="faction-modal-close" aria-label="Close">✖</button>
    <div class="modal-header">
      <span class="faction-emoji">${faction.emoji || "❓"}</span>
      <div>
        <h2>${faction.name}</h2>
        <p class="modal-overview">${faction.overview}</p>
      </div>
    </div>
    ${
      earlyAccess
        ? '<p class="modal-badge">Early Access • Not yet selectable</p>'
        : ""
    }
    <div class="modal-lore">
      <h3>Full Lore</h3>
      <p>${(faction.fullLore || "").replace(/\n/g, "<br>")}</p>
    </div>
    <div class="modal-traits">
      <p>⚔️ <strong>Prowess:</strong> ${faction.defaultEmojis?.prowess ?? "?"}</p>
      <p>🍃 <strong>Resilience:</strong> ${faction.defaultEmojis?.resilience ?? "?"}</p>
      <p>💰 <strong>Economy:</strong> ${faction.defaultEmojis?.economy ?? "?"}</p>
    </div>
    <div class="modal-actions">
      <button id="leadFactionBtn" ${earlyAccess ? "disabled" : ""}>
        ${earlyAccess ? "Unavailable" : `Lead this faction`}
      </button>
      <button id="cancelFactionBtn" class="secondary">Close</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeModal = () => {
    document.body.removeChild(overlay);
  };

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  modal.querySelector(".faction-modal-close").addEventListener("click", closeModal);
  modal.querySelector("#cancelFactionBtn").addEventListener("click", closeModal);

  const leadBtn = modal.querySelector("#leadFactionBtn");
  if (!earlyAccess) {
    leadBtn.addEventListener("click", () => {
      localStorage.setItem("selectedFaction", faction.name);
      localStorage.setItem("chosenFaction", faction.name);
      window.location.href = "../../game/index.html";
    });
  }
}
