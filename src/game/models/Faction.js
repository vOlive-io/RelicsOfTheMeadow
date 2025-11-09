export class Faction {
  constructor(data) {
    this.name = data.name;
    this.overviewLore = data.overviewLore;
    this.fullLore = data.fullLore;
    this.traits = data.traits || { prowess: 0, resilience: 0, economy: 0 };
    this.relationships = data.relationships || {};
    this.relics = data.relics || [];
    this.colorPalette = data.colorPalette || {};
    this.symbol = data.symbol || "";
    this.specialMechanics = data.specialMechanics || {};
  }

  addRelic(relicName) {
    if (!this.relics.includes(relicName)) {
      this.relics.push(relicName);
    }
  }

  removeRelic(relicName) {
    this.relics = this.relics.filter(r => r !== relicName);
  }

  setRelationship(otherFaction, status) {
    this.relationships[otherFaction] = status;
  }
}
