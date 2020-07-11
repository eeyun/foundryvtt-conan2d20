/**
 * Extend the base Actor class to implement additiona logic specialized for Conan2d20
 */
import { CONFIG } from "../../scripts/config";
import { Conan2d20Dice } from "../system/rolls";
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
         for (const [, skl] of Object.entries(data.skills)) {
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
        const newValue = actorData.data.resources.fortune.value - fortuneSpend;
        if (newValue < 0) {
            const error = "Fortune spend would exceed available fortune points."
            throw error;
        } else {
            /* eslint-disable-next-line no-param-reassign */
            actorData.data.resources.fortune.value = newValue;
            game.actors.get(actorData._id).update(actorData);
        }
    }

    triggerReroll(message: any, type) {
        const msgdata = message.data.flags.data;
        const rerolls = [];
        $(message.data.content).children('.roll.selected').each(function() {
            rerolls.push( $( this ).text().trim() );
        });

        const norolls = [];
        $(message.data.content).children('.roll:not(.selected)').each(function() {
            norolls.push( Number($( this ).text().trim()) );
        });

        const diceQty = rerolls.length;

        let html = `<h3 class="center"><b>${game.i18n.localize("CONAN.skillRerollActivate")}</b></h3>`;
        if ( type === "reroll")
            /* eslint-disable-next-line prefer-template */
            // @ts-ignore
            html += `${game.i18n.format("CONAN.skillRerollText",{character:'<b>'+this.name+'</b>'})}<br>`;

        const chatData = {
            user: game.user._id,
            rollMode: "reroll",
            content: html
        };

        // @ts-ignore
        ChatMessage.create(chatData);

        const cardData = {
            title: `${msgdata.title} Re-Roll`,
            speaker: {
                alias: message.data.speaker.alias,
                actor: message.data.speaker.actor
            },
            template: msgdata.template,
            flags: {img: this.data.token.randomImg ? this.data.img : this.data.token.img}
        };
        Conan2d20Dice.skillRoll(diceQty, msgdata.rollData.tn, msgdata.rollData.focus, msgdata.rollData.trained, msgdata.resultData.difficulty, undefined, cardData, norolls);
    }

    momentumSpendImmediate(message, type) {
        const data = message.data.flags.data;
        console.log("Placeholder Immediate momentum spend");
        console.log(data);
    }

  /**
   * Setup a Skill Test.
   *
   * Skill tests are fairly simple but there are a number of validations that
   * need to be made including the handling of fortune and doom/momentum
   */
  setupSkill(skill) {
    const dialogData = {
        title : CONFIG.skills[skill],
        modifiers : this._getModifiers("skill", skill),
        template : "systems/conan2d20/templates/apps/roll-dialogue.html",
    };
    const rollData = {
            skill : this.data.data.skills[skill],
    };
    const cardData = this._setupCardData("systems/conan2d20/templates/chat/skill-roll-card.html", CONFIG.skills[skill])

    return {dialogData, cardData, rollData}
  }

  _setupCardData(template: string, title: string) {
      const cardData = {
          title: `${title} Test`,
          speaker: {
              alias: this.data.token.name,
              actor: this.data._id
          },
          template,
          flags: {img: this.data.token.randomImg ? this.data.img : this.data.token.img}
      }

      if (this.token) {
              cardData.speaker.alias = this.token.data.name;
                  // @ts-ignore
              cardData.speaker.token = this.token.data._id;
                  // @ts-ignore
              cardData.speaker.scene = canvas.scene._id
              cardData.flags.img = this.token.data.img;
      } else {
          const speaker = ChatMessage.getSpeaker()
          if (speaker.actor === this.data._id)
              {
                  cardData.speaker.alias = speaker.alias
                  // @ts-ignore
                  cardData.speaker.token = speaker.token
                  // @ts-ignore
                  cardData.speaker.scene = speaker.scene
                  cardData.flags.img = speaker.token ? canvas.tokens.get(speaker.token).data.img : cardData.flags.img
              }
      }
      return cardData
  }

  _getModifiers(type: String, specifier: Object) {
    const difficultyLevels = CONFIG.skillRollDifficultyLevels;
    const diceModSpends = CONFIG.skillRollResourceSpends;
    const mod = {
        difficulty: difficultyLevels,
        diceModifier : diceModSpends,
        successModifier : 0,
    }
    return mod
  }
}
