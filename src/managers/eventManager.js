/////////////////////////////////////
/// MODULE IMPORTS               ///
/////////////////////////////////////
import { seasonalEvents, festivalDefinition } from "../data/events.js";
import { adjustHappiness } from "./populationManager.js";
import { addResource } from "./resourceManager.js";

/////////////////////////////////////
/// STATE                         ///
/////////////////////////////////////
let activeEvents = [];

/////////////////////////////////////
/// HELPERS                       ///
/////////////////////////////////////
function createEventInstance(definition, source = "world") {
  return {
    ...definition,
    source,
    turnsRemaining: definition.duration,
  };
}

function applyImmediateEffects(event, onUpdate = () => {}) {
  const effects = event.effects || {};
  if (effects.happinessShift) {
    adjustHappiness(effects.happinessShift);
  }
  if (effects.resourceReward) {
    const parts = [];
    Object.entries(effects.resourceReward).forEach(([key, amount]) => {
      if (!amount) return;
      addResource(key, amount);
      parts.push(`${amount} ${key}`);
    });
    if (parts.length) {
      onUpdate(`📦 ${event.name} delivers: ${parts.join(", ")}.`);
    }
  }
}

/////////////////////////////////////
/// API                           ///
/////////////////////////////////////
export function resetEventState() {
  activeEvents = [];
}

export function getActiveEvents() {
  return activeEvents.map(event => ({
    key: event.key,
    name: event.name,
    description: event.description,
    turnsRemaining: event.turnsRemaining,
    source: event.source,
  }));
}

export function advanceEvents(onUpdate = () => {}) {
  activeEvents.forEach(event => {
    event.turnsRemaining -= 1;
  });
  const expired = activeEvents.filter(event => event.turnsRemaining <= 0);
  if (expired.length) {
    expired.forEach(event => {
      if (event.effects?.happinessShift) {
        adjustHappiness(-Math.min(2, event.effects.happinessShift));
      }
      onUpdate(`⏳ ${event.name} has ended.`);
    });
  }
  activeEvents = activeEvents.filter(event => event.turnsRemaining > 0);
}

export function maybeTriggerRandomEvent(onUpdate = () => {}, seasonKey = null) {
  const eligible = seasonalEvents.filter(
    event => !seasonKey || !event.seasons || event.seasons.includes(seasonKey)
  );
  if (!eligible.length) return null;
  const available = eligible.filter(event => !activeEvents.some(active => active.key === event.key));
  const pool = available.length ? available : eligible;
  const definition = pool[Math.floor(Math.random() * pool.length)];
  const existing = activeEvents.find(event => event.key === definition.key);
  if (existing) {
    existing.turnsRemaining = Math.max(existing.turnsRemaining, definition.duration);
    onUpdate(`✨ ${existing.name} intensifies: ${existing.description}`);
    return existing;
  }
  const instance = createEventInstance(definition, "seasonal");
  activeEvents.push(instance);
  applyImmediateEffects(instance, onUpdate);
  onUpdate(`✨ ${instance.name} begins: ${instance.description}`);
  return instance;
}

export function exportEventState() {
  return activeEvents.map(event => ({ ...event }));
}

export function importEventState(state = []) {
  activeEvents = Array.isArray(state) ? state.map(event => ({ ...event })) : [];
}

export function startFestival(onUpdate = () => {}) {
  const instance = createEventInstance(festivalDefinition, "festival");
  activeEvents.push(instance);
  applyImmediateEffects(instance, onUpdate);
  onUpdate(`🎉 ${instance.name} erupts across the realm!`);
  return instance;
}

export function applyEventProductionModifiers(totals = {}) {
  let adjusted = { ...totals };
  activeEvents.forEach(event => {
    const effects = event.effects || {};
    if (effects.productionMultiplier) {
      adjusted = Object.fromEntries(
        Object.entries(adjusted).map(([resource, amount]) => [
          resource,
          Math.round(amount * effects.productionMultiplier),
        ])
      );
    }
    if (effects.resourceMultipliers) {
      Object.entries(effects.resourceMultipliers).forEach(([resource, multiplier]) => {
        if (adjusted[resource]) {
          adjusted[resource] = Math.round(adjusted[resource] * multiplier);
        }
      });
    }
  });
  return adjusted;
}
