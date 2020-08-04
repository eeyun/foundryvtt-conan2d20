/**
 * Extend the base Actor class to implement additiona logic specialized for Conan2d20
 */
import { CONFIG } from '../../scripts/config';
import { Conan2d20Dice } from '../system/rolls';
import Counter from '../system/counter';
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

        if (data.qualities !== undefined) {
            const map = {};
            for (const [t,] of Object.entries(map)) {
                const quality = data.qualities[t];
                if (quality === undefined) continue;
            }
        }
        
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
         for (const [s, skl] of Object.entries(data.skills)) {
            // @ts-expect-error
            // ^~~~~~~~~~~~~~~^ error: "Unused '@ts-expect-error' directive.(2339)"
            skl.tn.value = skl.expertise.value + data.attributes[skl.attribute].value;
            if (data.skills[s].expertise.value > 0) {
                data.skills[s].trained = true;
            }
        }

        // Prepare Upkeep Cost
        data.resources.upkeep.value = 3 + data.background.standing.value - data.background.renown;
        if (data.resources.upkeep.value < 0 ) {
            data.resources.upkeep.value = 0;
        }

		// Automatic Actions
		data.actions = [];

		// Attacks
		{
			(actorData.items ?? []).filter(
                (item) => item.type === 'weapon' || item.type === 'display').forEach((item) => {			
				const action : any =  {};
                action.imageUrl = item.img;
                action.name = item.name;
        		action.type = 'attack';
        		const flavor = this.getAttackDescription(item);
        		action.description = flavor.description;
        		action.success = flavor.success;
                if (item.type === 'weapon') {
        		    action.qualities = [
                        { name: 'attack', label: game.i18n.localize(CONFIG.attacks[item.type])},
                        { name: 'weaponType', label: CONFIG.weaponTypes[item.data.weaponType]},
                        { name: 'weapongroup', label: CONFIG.weaponGroups[item.data.group] ?? ''}].concat(
                        (item?.data?.qualities?.value).map((quality) => {
        		        	const key = CONFIG.weaponQualities[quality] ?? quality;
                            if (key.value) {
        		        	    return { name: quality, label: `${game.i18n.localize(key.label)}(${key.value})`, description: CONFIG.qualitiesDescriptions[key.type] || ''}
        		            } 	
        		        	return { name: quality, label: `${game.i18n.localize(key.label)}`, description: CONFIG.qualitiesDescriptions[key.type] || ''};
                        })
        		    );
                } else if (item.type === 'display') {
        		    action.qualities = [
                        { name: 'attack', label: game.i18n.localize(CONFIG.attacks[item.type])}].concat(
        		    	(item?.data?.qualities?.value).map((quality) => {
        		        	const key = CONFIG.weaponQualities[quality] ?? quality;
                            if (key.value) {
        		        	    return { name: quality, label: `${game.i18n.localize(key.label)}(${key.value})`, description: CONFIG.qualitiesDescriptions[key.type] || ''};
        		            } 	
        		        	return { name: quality, label: `${game.i18n.localize(key.label)}`, description: CONFIG.qualitiesDescriptions[key.type] || '' };
        		      	})
                    );
                }
                action.attack = {};
                action.attack.id = item._id;
                action.attack.type = item.type;
                data.actions.push(action);
            });
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
         const npc = new CharacterData(data, this.items);
         return npc;
    }

    static addDoom(doomSpend) {
        Counter.changeCounter(+`${doomSpend}`, "doom");
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

    static spendMomentum(momentumSpend) {
        const newValue = game.settings.get("conan2d20", "momentum") - momentumSpend;
        if (newValue <  0) {
            const error = "Momentum spend would exceed available momentum points."
            throw error;
        } else {
            Counter.changeCounter(-`${momentumSpend}`, "momentum");
        }
    }

    static spendReload(actorData,  reloadSpend, reloadItem) {
        const newValue = actorData.items.find(i => i._id === reloadItem).data.uses.value - reloadSpend;
        if (newValue < 0) {
            const error = "Resource spend would exceed available reloads."
            throw error;
        } else {
            /* eslint-disable-next-line no-param-reassign */
            actorData.items.find(i => i._id === reloadItem).data.uses.value = newValue;
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
        if ( type === 'skill') {
            /* eslint-disable-next-line prefer-template */
            // @ts-ignore
            html += `${game.i18n.format("CONAN.skillRerollText",{character:`<b>${this.name}</b>`})}<br>`;
        } else if (type === 'damage') {
            /* eslint-disable-next-line prefer-template */
            // @ts-ignore
            html += `${game.i18n.format("CONAN.damageRerollText",{character:`<b>${this.name}</b>`})}<br>`;
        }

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

        if (type === 'skill') {
            Conan2d20Dice.calculateSkillRoll(diceQty, msgdata.rollData.tn, msgdata.rollData.focus, msgdata.rollData.trained, msgdata.resultData.difficulty, undefined, cardData, norolls);
        } else if (type === 'damage') {
            Conan2d20Dice.calculateDamageRoll(diceQty, msgdata.resultData.damageType, cardData, norolls);
        }
    }

    momentumSpendImmediate(message, type) {
        const {data} = message.data.flags;
        console.log("Placeholder Immediate momentum spend");
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
            template : "systems/conan2d20/templates/apps/skill-roll-dialogue.html",
        };
        const rollData = {
            skill : this.data.data.skills[skill],
        };
        const cardData = this._setupCardData("systems/conan2d20/templates/chat/skill-roll-card.html", CONFIG.skills[skill])
        return {dialogData, cardData, rollData}
    }

    /**
     * Setup a Weapons Test.
     * 
     * Probably the most complex test in the game.
     */
    setupWeapon(weapon: any, options: [] = []) {
        const title = `${game.i18n.localize("Damage Roll")} - ${weapon.name}`;
        const dialogData = {
            title,
            modifiers : this._getModifiers("damage", weapon),
            template : "systems/conan2d20/templates/apps/damage-roll-dialogue.html",
        };
        if (options.length) {
            // @ts-ignore
            dialogData.options = options
        }
        const cardData = this._setupCardData("systems/conan2d20/templates/chat/damage-roll-card.html", title);

        const rollData = {
            target : 0,
            hitLocation : true,
            extra : {
                weapon,
            }
        };
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

	getAttackDescription(item) {
  		const flavor = {
  	  		description: 'CONAN.attack.default.description',
  	  	  	success: 'CONAN.attack.default.success',
  	  	};
  	  	if ((item?.data?.qualities?.value).includes('improvised')) {
  	  	 flavor.description = 'CONAN.attacks.improvised.description';
  	  	 	flavor.success = 'CONAN.attacks.improvised.success';
  	  	} else if (item?.data?.weaponType === 'melee') {
  	  		flavor.description = 'CONAN.attacks.melee.description';
  	  	  	flavor.success = 'CONAN.attacks.melee.success';
  	  	} else if (item?.data?.weaponType === 'ranged') {
  	  		flavor.description = 'CONAN.attacks.ranged.description';
  	  	  	flavor.success = 'CONAN.attacks.ranged.success';
  	  	} else if (item?.data?.damage?.type === 'mental') {
			flavor.description = `${item?.data?.description?.value}`;
			flavor.success = 'CONAN.attacks.display.success';
		}
  	  	return flavor;
  	}

  	_getModifiers(type: String, specifier: any) {
        let mod;
        if (type === 'skill') {
  	  	    const difficultyLevels = CONFIG.rollDifficultyLevels;
  	  	    const diceModSpends = CONFIG.skillRollResourceSpends;
  	  	    mod = {
  	  	        difficulty: difficultyLevels,
  	  	        diceModifier : diceModSpends,
  	  	        successModifier : 0,
  	  	    }
  	  	    return mod
        } ;
        if (type === 'damage') {
            const attackTypes = CONFIG.weaponTypes;
            let wType: String;
            let bDamage: Object;
            if (specifier.type === 'display') {
                wType = 'display';
            } else if (specifier.type === 'weapon') {
                wType = specifier.data.weaponType;
            }
            mod = {
                attackType: attackTypes,
                weaponType: wType,
                momentumModifier: 0,
                reloadModifier: 0,
                talentModifier: 0,
            }
            if (specifier.data.damage.dice === 'x') {
                mod = mergeObject(mod, {baseDamage: specifier.data.damage.dice});
            };
            return mod
        };
  	}

     /**
     * @param {string[]} rollNames
     * @return {string[]}
     */
    getRollOptions(rollNames) {
        const flag = this.getFlag(game.system.id, 'rollOptions') ?? {};
        return rollNames.flatMap(rollName =>
        // convert flag object to array containing the names of all fields with a truthy value
        Object.entries(flag[rollName] ?? {}).reduce((opts, [key, value]) => opts.concat(value ? key : []), [])
            ).reduce((unique, option) => {
            // ensure option entries are unique
            return unique.includes(option) ? unique : unique.concat(option);
        }, []);
    }

    

}
