// src/onboarding/onboarding.js
import { getEnabledFactions } from "../../game/factionManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const factionList = document.getElementById("faction-list");

  const factions = getEnabledFactions();

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
      <button class="select-btn">Pledge to ${faction.name}</button>
    `;

    card.querySelector(".select-btn").addEventListener("click", () => {
      localStorage.setItem("selectedFaction", faction.name);
      localStorage.setItem("chosenFaction", faction.name);
      alert(`You’ve pledged to ${faction.name}! ${faction.emoji}`);
      window.location.href = "../../game/index.html";
    });

    factionList.appendChild(card);
  });
});
