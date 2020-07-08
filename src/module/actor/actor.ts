/**
 * Extend the base Actor class to implement additiona logic specialized for Conan2d20
 */
import { CONFIG } from "../../scripts/config";
import CharacterData from './character';

export default class Conan2d20Actor extends Actor {
    /**
     * Augment the basic actor data with additional dynamic data
     */
    prepareData() {
        super.prepareData();

        // Get the Actor's data object
        const actorData = this.data;
        const { data } = actorData;
        
        // Prepare Character data
        if (actorData.type === 'character') this._prepareCharacterData(actorData);
        else if (actorData.type === 'npc') this._prepareNPCData(data);
        
    // Return the prepared Actor data
        return actorData;
  }

  /* -------------------------------------------- */

  /**
  * Prepare Character type specific data
  */
    _prepareCharacterData(actorData) {
        const {data} = actorData;
        const character = new CharacterData(data, this.items);

        // DMG BONUS
        // Melee Bonus
        data.attributes.bra.damage = this.identifyBonusDmg(data.attributes.bra.value);

        // Ranged Bonus
        data.attributes.awa.damage = this.identifyBonusDmg(data.attributes.awa.value);

        // Mental Bonus
        data.attributes.per.damage = this.identifyBonusDmg(data.attributes.per.value);

        // Health
        // Calculate Vigor
        data.health.physical.max = data.attributes.bra.value + data.skills.res.expertise.value - data.health.physical.fatigue;
        if (data.health.physical.value === null) {
            data.health.physical.value = data.attributes.bra.value + data.skills.res.expertise.value;
        } else if (data.health.physical.value > data.health.physical.max) {
            data.health.physical.value = data.health.physical.max;
        } else if (data.health.physical.value < 0) {
            data.health.physical.value = 0;
        }
        
        // Calculate Resolve
        data.health.mental.max = data.attributes.wil.value + data.skills.dis.expertise.value - data.health.mental.despair;
        if (data.health.mental.value === null) {
            data.health.mental.value = data.attributes.wil.value + data.skills.dis.expertise.value;
        } else if (data.health.mental.value > data.health.mental.max) {
            data.health.mental.value = data.health.mental.max;
        } else if (data.health.mental.value < 0) {
            data.health.mental.value = 0;
        }

        // Set TN for Skills
         for (let [key, skl] of Object.entries(data.skills)) {
            // @ts-expect-error
            // ^~~~~~~~~~~~~~~^ error: "Unused '@ts-expect-error' directive.(2339)"
            skl.tn = skl.expertise.value + data.attributes[skl.attribute].value;
        }

        // Prepare Upkeep Cost
        data.resources.upkeep.value = 3 + data.background.standing.value - data.background.renown;
        if (data.resources.upkeep.value < 0 ) {
            data.resources.upkeep.value = 0;
        }

        // Experience
        data.resources.xp.value = character.exp;

        // Fortune
        data.resources.fortune.value = data.resources.fortune.value;

        // Renown
        data.background.renown = data.background.renown;

        // Standing
        data.background.standing.value = data.background.standing.value;
    }

  /* -------------------------------------------- */

  /**
   * Prepare Character type specific data
   */
    _prepareNPCData(actorData) {
         const {data} = actorData;
        // const character = new CharacterData(data, this.items);

         return data;
    }

    identifyBonusDmg(attribute) {
        let bonus = 0;
        if (typeof attribute === 'number') {
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
          console.log('Conan 2D20 | Bonus Damage Identification received NaN.');
        }
        return bonus;
    }

  static spendFortune(actorData, fortuneSpend) {
    let newValue = actorData.data.resources.fortune.value - fortuneSpend;
      if (newValue < 0) {
          let error = "Fortune spend would exceed available fortune points."
          throw error;
      } else {
        actorData.data.resources.fortune.value = newValue;
        game.actors.get(actorData._id).update(actorData);
      }
  }

  setupSkill(skill) {
    let dialogData = {
        title : CONFIG.skills[skill],
        modifiers : this.getModifiers("skill", skill),
        template : "systems/conan2d20/templates/apps/roll-dialogue.html",
    },
        cardData = {
            template : "systems/conan2d20/templates/chat/skill-roll-card.html",
            flavor : `${CONFIG.skills[skill]}`,
            speaker : {
                alias : this.data.name
            }
        },
        rollData = {
            skill : this.data.data.skills[skill],
        }

    //let rollResult = await DegenesisDice.rollAction(rollData)
    return {dialogData, cardData, rollData}
  }

  getModifiers(type: String, specifier: Object) {
    let difficultyLevels = CONFIG.skillRollDifficultyLevels;
    let diceModSpends = CONFIG.skillRollResourceSpends;
    let mod = {
        difficulty: difficultyLevels,
        diceModifier : diceModSpends,
        successModifier : 0,
    }
    return mod
  }
}
