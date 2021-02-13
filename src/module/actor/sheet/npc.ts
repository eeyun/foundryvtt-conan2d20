import ActorSheetConan2d20 from './base';

class ActorSheetConan2d20NPC extends ActorSheetConan2d20 {
  static get defaultOptions() {
    const options = super.defaultOptions;
    mergeObject(options, {
      classes: options.classes.concat(['conan2d20', 'actor', 'npc-sheet']),
      width: 460,
      height: 680,
      resizable: false,
      scrollY: ['.sheet-content'],
    });
    return options;
  }

  get template() {
    const path = 'systems/conan2d20/templates/actors/';
    if (!game.user.isGM && this.actor.limited)
      return `${path}readonly-npc-sheet.html`;
    return `${path}npc-sheet.html`;
  }

  getData() {
    const sheetData = super.getData();
    sheetData.flags = sheetData.actor.flags;

    // Update expertise fields labels
    if (sheetData.data.skills !== undefined) {
      for (const [s, skl] of Object.entries(
        sheetData.data.skills as Record<any, any>
      )) {
        skl.label = CONFIG.CONAN.expertiseFields[s];
      }
    }

    sheetData.actor.data.isMinion = this.npcIsMinion();
    sheetData.actor.data.isToughened = this.npcIsToughened();
    sheetData.actor.data.isNemesis = this.npcIsNemesis();
    sheetData.npcCategories = CONFIG.CONAN.npcCategories;
    sheetData.skills = CONFIG.CONAN.expertiseFields;

    return sheetData;
  }

  _prepareItems(actorData) {
    const attacks = {
      npcattack: {label: 'NPC Attack', items: []},
    };

    const actions = {
      abilities: {
        label: game.i18n.localize('CONAN.npcActionTypes.abilities'),
        actions: [],
      },
      doom: {
        label: game.i18n.localize('CONAN.npcActionTypes.doom'),
        actions: [],
      },
    };

    // Get Attacks
    for (const i of actorData.items) {
      i.img = i.img || CONST.DEFAULT_TOKEN;

      if (Object.keys(attacks).includes(i.type)) {
        if (i.type === 'npcattack') {
          let item;
          try {
            item = this.actor.getOwnedItem(i._id);
            i.chatData = item.getChatData({secrets: this.actor.owner});
          } catch (err) {
            console.log(
              `Conan 2D20 System | NPC Sheet | Could not load item ${i.name}`
            );
          }
          attacks[i.type].items.push(i);
        }
      } else if (i.type === 'npcaction') {
        const actionType = i.data.actionType || 'npcaction';
        actions[actionType].actions.push(i);
      }

      if (i.type !== 'npcattack' && i.type !== 'npcaction') {
        // Invalid Items
        console.log('Invalid item for non-player characters!');
        this.actor.deleteOwnedItem(i._id);
      }
    }

    actorData.actions = actions;
    actorData.attacks = attacks;
  }

  npcIsNemesis() {
    const actorData = duplicate(this.actor.data);
    const traits = getProperty(actorData.data, 'categories.value') || [];
    for (const trait of traits) {
      if (trait === 'nemesis') return true;
    }
    return false;
  }

  npcIsMinion() {
    const actorData = duplicate(this.actor.data);
    const traits = getProperty(actorData.data, 'categories.value') || [];
    for (const trait of traits) {
      if (trait === 'minion') return true;
    }
    return false;
  }

  npcIsToughened() {
    const actorData = duplicate(this.actor.data);
    const traits = getProperty(actorData.data, 'categories.value') || [];
    for (const trait of traits) {
      if (trait === 'toughened') return true;
    }
    return false;
  }
}

export default ActorSheetConan2d20NPC;
