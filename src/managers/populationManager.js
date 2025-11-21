/////////////////////////////////////
/// MODULE IMPORTS               ///
/////////////////////////////////////

/////////////////////////////////////
/// STATE                         ///
/////////////////////////////////////
let population = 20;
let housingCapacity = 20;
let homeless = 0;
let happiness = 60;
let health = 100;

/////////////////////////////////////
/// CONSTANTS                     ///
/////////////////////////////////////
const HAPPINESS_MIN = 0;
const HAPPINESS_MAX = 100;
const HEALTH_MIN = 0;
const HEALTH_MAX = 100;
const KEEP_STARTING_BEDS = 20;

/////////////////////////////////////
/// FUNCTIONS                     ///
/////////////////////////////////////
export function resetPopulationState() {
  population = 20;
  housingCapacity = KEEP_STARTING_BEDS;
  homeless = 0;
  happiness = 60;
  health = HEALTH_MAX;
}

export function getPopulation() {
  return population;
}

export function addPopulation(amount) {
  population = Math.max(0, population + amount);
  updateHomeless();
}

export function setHousingCapacity(capacity) {
  housingCapacity = Math.max(0, capacity);
  updateHomeless();
}

export function getHousingCapacity() {
  return housingCapacity;
}

export function getHomeless() {
  return homeless;
}

export function tickPopulation() {
  updateHomeless();
  if (homeless > 0) {
    const loss = Math.max(1, Math.floor(homeless * 0.05));
    population = Math.max(0, population - loss);
    updateHomeless();
    adjustHappiness(-2);
  } else {
    adjustHappiness(1);
  }
}

export function getHappiness() {
  return happiness;
}

export function adjustHappiness(amount) {
  happiness = Math.min(HAPPINESS_MAX, Math.max(HAPPINESS_MIN, happiness + amount));
}

export function getHealth() {
  return health;
}

export function adjustHealth(amount) {
  health = Math.min(HEALTH_MAX, Math.max(HEALTH_MIN, health + amount));
}

function updateHomeless() {
  homeless = Math.max(0, population - housingCapacity);
}
