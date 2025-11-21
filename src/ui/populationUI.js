/////////////////////////////////////
/// MODULE IMPORTS               ///
/////////////////////////////////////
import {
  getPopulation,
  getHousingCapacity,
  getHomeless,
  getHappiness,
  getHealth,
} from "../managers/populationManager.js";

/////////////////////////////////////
/// FUNCTIONS                     ///
/////////////////////////////////////
export function renderPopulationPanel(containerId = "populationPanel") {
  const container = document.getElementById(containerId);
  if (!container) return;
  const population = getPopulation();
  const housing = getHousingCapacity();
  const homeless = getHomeless();
  const happiness = getHappiness();
  const health = getHealth();
  container.innerHTML = `
    <div class="population-row">Population: <strong>${population}</strong></div>
    <div class="population-row">Beds: <strong>${housing}</strong></div>
    <div class="population-row">Homeless: <strong>${homeless}</strong></div>
    <div class="population-row">Happiness: <strong>${happiness}%</strong></div>
    <div class="population-row">Health: <strong>${health}%</strong></div>
  `;
}
