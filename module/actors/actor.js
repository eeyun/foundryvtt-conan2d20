/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Conan2D20Actor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    if (actorData.type === 'minion') this._prepareMinionData(actorData);
    if (actorData.type === 'toughened') this._prepareToughenedData(actorData);
    if (actorData.type === 'nemesis') this._prepareNemesisData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;

    // Make modifications to data here. 
    // Console.Log('Conan 2D20 | Preparing Character Actor Data');

    //  DMG BONUS
    // Prepare Bonus Melee Damage
    data.attributes.bra.damage = this.identifyBonusDmg(data.attributes.bra.value);
    // Prepare Bonus Ranged Damage
    data.attributes.awa.damage = this.identifyBonusDmg(data.attributes.awa.value);
    // Prepare Bonus Mental Damage
    data.attributes.per.damage = this.identifyBonusDmg(data.attributes.per.value);;

    //  HEALTH
    // Calculate Vigor
    //data.health.vigor.max = data.attributes.bra.value + data.skills.resistance.value;
    data.health.vigor.max = data.attributes.bra.value + data.skills.res.value;
    data.health.vigor.value = data.health.vigor.max;
    // Prepare Resolve
    // Willpower + Discipline.Expertise  
    data.health.resolve.max = data.attributes.wil.value + data.skills.dis.value;
    data.health.resolve.value = data.health.resolve.max;
    //  SET TN for Skills

    // Loop through talents, assign roll modifications
    for (let [key, talents] of Object.entries(data.talents)) {
      //skill.tn = skill.value + data.attributes[key];
    }

    // Loop through skills, assigning TN for checks
    for (let [key, skill] of Object.entries(data.skills)) {
      skill.tn = skill.value + data.attributes[skill.attribute].value;
    }

    // Prepare Upkeep Cost
    // 3 gp + [Standing] - [Renown]
    data.resources.upkeep = 3 + data.background.standing.value - data.background.renown;

    //console.log(data);

    // End Data Preparation
  }

  identifyBonusDmg(attribute) {
    var bonus = 0;
    if (typeof attribute == 'number') {
      if (attribute > 8) {
        switch (attribute) {
          case 9:
            bonus = 1;
            break;
          case 10:
          case 11:
            bonus = 2;
            break;
          case 12:
          case 13:
            bonus = 3;
            break;
          case 14:
          case 15:
            bonus = 4;
            break;
          default:
            bonus = 5;
        }
      }
    } else {
      console.log('Conan 2D20 | Bonus Damage Identification received NaN.')
    }
    return bonus;
  }

  /** @override */
  async createOwnedItem(itemData, options) {

    // Assume NPCs are always proficient with weapons and always have spells prepared
    if (!this.isPC) {
      let t = itemData.type;
      let initial = {};
      if (t === "weapon") initial["data.proficient"] = true;
      if (["weapon", "equipment"].includes(t)) initial["data.equipped"] = true;
      if (t === "spell") initial["data.prepared"] = true;
      mergeObject(itemData, initial);
    }
    return super.createOwnedItem(itemData, options);
  }


  /**
   * Prepare Character type specific data
   */
  _prepareMinionData(actorData) {
    const data = actorData.data;

    // Calculate Vigor from Brawn + Fortitude for an NPC    
    //      data.health.vigor.max = data.attributes.['Brawn'].value + data.skills.['fortitude'];

    /*
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }  */
  }

  _prepareToughenedData(actorData) {
    const data = actorData.data;

    // Calculate Vigor from Brawn + Fortitude for an NPC    
    //      data.health.vigor.max = data.attributes.['Brawn'].value + data.skills.['fortitude'];
  }

  _prepareNemesisData(actorData) {
    const data = actorData.data;

    // Calculate Vigor from Brawn + Fortitude for an NPC    
    //      data.health.vigor.max = data.attributes.['Brawn'].value + data.skills.['fortitude'];
  }

}