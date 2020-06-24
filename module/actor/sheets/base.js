import {CONAN} from '../../../scripts/config.js';

export default class Conan2D20ActorSheet extends ActorSheet {
    /* -------------------------------------------- */
    /* getData Heavily influenced by D&D5E https://gitlab.com/foundrynet/dnd5e/ 
    /* and Simple WorldBuilding System https://gitlab.com/foundrynet/worldbuilding
  /** @override */
  getData() {

    // Basic data
    let isOwner = this.entity.owner;
    const data = {
      owner: isOwner,
      isCharacter: this.entity.data.type === "character",
      isNPC: this.entity.data.type === "npc",
      limited: this.entity.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? "editable" : "locked",
      config: CONFIG.CONAN,
    };

    // The Actor and its Items
    data.actor = duplicate(this.actor.data);
    data.items = this.actor.items.map(i => {
      i.data.labels = i.labels;
      return i.data;
    });
    data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    data.data = data.actor.data;
    data.labels = this.actor.labels || {};
    data.filters = this._filters;

    // Attribute Labels
    for ( let [a, atr] of Object.entries(data.actor.data.attributes)) {
      atr.label = CONFIG.CONAN.attributes[a];
    }

    // Update skill labels
    for ( let [s, skl] of Object.entries(data.actor.data.skills)) {
      skl.attribute = data.actor.data.attributes[skl.attribute].label.substring(0, 3);
      skl.label = CONFIG.CONAN.skills[s];
    }

    // Return data to the sheet
    return data
  }
}