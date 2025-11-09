export class Relic {
  constructor(data) {
    this.name = data.name;
    this.type = data.type;
    this.description = data.description;
    this.faction = data.faction || null;
    this.effects = data.effects || {};
  }

  applyToFaction(faction) {
    // placeholder — later we’ll define how relic abilities alter stats dynamically
    console.log(`Applying ${this.name} to ${faction.name}...`);
  }
}
