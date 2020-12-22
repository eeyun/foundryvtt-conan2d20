import {ConanChat} from "./chat";
import {CONFIG} from "../../scripts/config";
import Conan2d20Actor from '../actor/actor';


export class Conan2d20Dice {
    /**
     * Reference: 
     * @param {number} diceQty          Number of d20 to roll
     * @param {number} tn               The Skill + Attribute to roll under
     * @param {number} focus            The Focus value to roll under for extra successes
     * @param {number} autoSuccess      How many successed to add
     * @param {boolean} trained         Is the skill trained, adds 19 to generate complications if not
     * @param {number} difficulty       Difficulty level of the skill check
     * @param {any} cardData            Data for rendering a chat message on completed roll
     */
    static async calculateSkillRoll(diceQty: number,
                      tn: number,
                      focus: number = 0,
                      trained: boolean = false,
                      difficulty: number = 0,
                      autoSuccess?: number,
                      cardData?: any,
                      fixedrolls?: any) {
        const rollErr = {
            diceQty: "Conan 2D20 | Error in Skill Check, D20 Quantity is not a Number.",
            tn: "Conan 2D20 | Error in Skill Check, Target Number is not a Number.",
            focus: "Conan 2D20 | Error in Skill Check, Focus is not a Number.",
            auto: "Conan 2D20 | Error in Skill Check, Automatic Successes is not a Number.",
            train: "Conan 2D20 | Error in Skill Check, Trained is not a Boolean."
        };
        if (Number.isNaN(diceQty)) {
            throw rollErr.diceQty;
        }
        if (Number.isNaN(tn)) {
            throw rollErr.tn;
        }
        if (Number.isNaN(focus)) {
            throw rollErr.focus;
        }
        if (Number.isNaN(autoSuccess)) {
            throw rollErr.auto;
        }
        if (typeof trained !== "boolean") {
            throw rollErr.train;
        }

        let rollResult = {};
        let successes = 0;
        let crits = 0;
        let momentumGenerated = 0;
        let complications = 0;
        let rolls = [];
        let rollInstance;
        let reroll = false;
        let result;


        if (diceQty === 0) {
            rolls = [];
        } else {
            rollInstance = new Roll(`${diceQty}d20`);
            rolls = rollInstance.roll().terms[0].results;
        }

        let i;
        if (autoSuccess !== undefined && autoSuccess > 0) {
            for (i = 0; i < autoSuccess; i+=1) {
                const successRoll = {result: 1};
                rolls.push(successRoll);
            }
        } else if (fixedrolls !== undefined){
            for (i = 0; i < fixedrolls.length; i+=1) {
                const mergeRoll = {result: fixedrolls[i]};
                rolls.push(mergeRoll);
            }

            reroll = true;
        }

        rolls.forEach(r => {
            if (!(trained)) {
                if (r.result === 19 || r.result === 20)
                    complications+=1;
            } else if (r.result === 20) {
                complications+=1;
            };
            if (r.result <= focus) {
                crits+=1;
            } else if (r.result <= tn) {
                successes+=1
            }
        })

        successes += (crits * 2);

        if (difficulty > 0)
        {
            if (successes >= difficulty)
            {
                momentumGenerated = successes - difficulty;
                result = "success"
            }
            else 
           {
                result = "failure"
            }
        }

        const rollData = {
            tn,
            focus:  focus || 0,
            trained,
            reroll
        };

        rollResult = {
            difficulty,
            successes,
            complications,
            momentumGenerated,
            result,
            rolls
        };
        ConanChat.renderRollCard(rollResult, rollData, cardData, 'skill')
    }

    static async calculateDamageRoll(diceQty: Number = 1, damageType: any, cardData: any, fixedrolls?: any) {
        const damageRollInstance = new Roll(`${diceQty}d6`);
        const damageRolls = damageRollInstance.roll().terms[0].results;
        let reroll = false;
        let damage: number = 0;
        let effects: number = 0;
        let hitLocation: any;

        let i;
        if (fixedrolls !== undefined){
            for (i = 0; i < fixedrolls.length; i+=1) {
                const mergeRoll = {result: fixedrolls[i]};
                damageRolls.push(mergeRoll);
            }
            reroll = true;
        }

        damageRolls.forEach(r => {
            if (r.result === 1) {
                damage += 1;
            } else if (r.result === 2) {
                damage += 2;
            } else if (r.result === 3 || r.result === 4) {
                damage += 0;
            } else {
                damage  += 1;
                effects += 1;
            }
        })

        const locationRollInstance = new Roll('1d20');
        const locationRolls = locationRollInstance.roll().terms[0].results;

        locationRolls.forEach(r => {
            // @ts-ignore
            if (r.result >=1 && r.result <=2) {
                hitLocation = CONFIG.coverageTypes.head;
            } else if (r.result >=3 && r.result <=5) {
                hitLocation = CONFIG.coverageTypes.rarm;
            } else if (r.result >=6 && r.result <=8) {
                hitLocation = CONFIG.coverageTypes.larm;
            } else if (r.result >=9 && r.result <=14) {
                hitLocation = CONFIG.coverageTypes.torso;
            } else if (r.result >=15 && r.result <=17) {
                hitLocation = CONFIG.coverageTypes.rleg;
            } else {
                hitLocation = CONFIG.coverageTypes.lleg;
            }
        })

        const rollData = {
            reroll
        };

        const rollResult = {
            damage,
            damageType,
            effects,
            damageRolls,
            hitLocation
        };

        ConanChat.renderRollCard(rollResult, rollData, cardData, 'damage');
    }

    static async generateDamageRoll(rollData: any, cardData: any, actorData: any) {
        const generatorErr = {
            reload: "Conan 2D20 | Error in Damage Roll, you must enter a number of reloads to spend",
            resource: "Conan 2D20 | Error in Damage Roll, you must select a Reload to spend"
        };

        if (rollData.reloadItem !== '' && rollData.reloadModifier < 1) {
            throw generatorErr.reload;
        } else if (rollData.reloadModifier > 0 && rollData.reloadItem === '') {
            throw generatorErr.resource;
        }

        let baseDamage;
        if (rollData.optionalBaseDmg > 0) {
            baseDamage = Number(rollData.optionalBaseDmg);
        } else {
            baseDamage = Number(rollData.extra.weapon.data.damage.dice || 1);
        };
        const {attackerType} = rollData;
        const damageType = rollData.extra.weapon.data.damage.type;
        const {attackType} = rollData;
        let diceQty = baseDamage + rollData.talentModifier + rollData.reloadModifier;
        let attribute;
        let modifier;

        if (attackType === 'melee') {
            attribute = 'bra';
        } else if (attackType === 'ranged') {
            attribute = 'awa';
        } else {
            attribute = 'per';
        };

        if (actorData.data.attributes[attribute].value <= 8) {
            modifier = 0;
        } else if (actorData.data.attributes[attribute].value === 9) {
            modifier = 1;
        } else if (actorData.data.attributes[attribute].value === 10 || 11) {
            modifier = 2;
        } else if (actorData.data.attributes[attribute].value === 12 || 13) {
            modifier = 3;
        } else if (actorData.data.attributes[attribute].value === 14 || 15) {
            modifier = 4;
        } else if (actorData.data.attributes[attribute].value >= 16) {
            modifier = 5;
        }

        diceQty += modifier;
        if (rollData.momentumModifier > 0) {
            try {
                //  We've disabled this codepaths to make momentum and doom spends
                //  fully manual until we have a sane solution for momentum  handling
                //  when momenutm is generated from a test.
                // if (attackerType === 'npc') {
                //     Conan2d20Actor.spendDoom(rollData.momentumModifier);
                // } else {
                //     Conan2d20Actor.spendMomentum(rollData.momentumModifier);
                // }
                diceQty += rollData.momentumModifier;
                if (rollData.reloadModifier > 0) {
                    try {
                        Conan2d20Actor.spendReload(actorData, rollData.reloadModifier, rollData.reloadItem);
                        diceQty += rollData.reloadModifier;
                        await this.calculateDamageRoll(diceQty, damageType, cardData);
                    }
                    catch(e) {
                        console.log(e);
                        ui.notifications.error(e);
                    }
                } else {
                    await this.calculateDamageRoll(diceQty, damageType, cardData);
                }
            }
            catch (e) {
                console.log(e);
                ui.notifications.error(e);
            }
        } else if (rollData.reloadModifier > 0) {
            try {
                Conan2d20Actor.spendReload(actorData, rollData.reloadModifier, rollData.reloadItem);
                diceQty + rollData.reloadModifier;
                await this.calculateDamageRoll(diceQty, damageType, cardData);
            }
            catch(e) {
                console.log(e);
                ui.notifications.error(e);
            }
        } else {
            await this.calculateDamageRoll(diceQty, damageType, cardData);
        }
    }

    static async generateSkillRoll(baseDice: number = 2, rollData: any, cardData: any, actorData: any) {
        // TODO: Wire in momentum expenditure check
        const generatorErr = {
            resource: "Conan 2D20 | Error in Skill Check, you must select a resource spend",
            res_count: "Conan 2D20 | Error in Skill Check, you must enter a number of resources to spend",
            bonus_count: "Selection would be greater than 3 Bonus Dice. Not allowed."
        };
        if (rollData.diceModifier > 0 && rollData.diceModifierType === "") {
            throw generatorErr.resource
        } else if (rollData.diceModifierType !== "" && rollData.diceModifier === 0) {
            throw generatorErr.res_count;
        }
        if ((baseDice + rollData.diceModifier) > 5) {
            throw generatorErr.bonus_count;
        } else if ((rollData.diceModifier + rollData.successModifier) > 3) {
            throw generatorErr.bonus_count
        }

        let trained = false;
        let diceQty;
        let doomSpend;

        if (actorData.type === "npc") {
            diceQty = baseDice;
            if (rollData.successModifier > 0) {
                doomSpend = rollData.diceModifier + (rollData.successModifier * 3);
            };
            if (rollData.diceModifier > 0 || doomSpend > 0) {
                try {
                    //  We've disabled this codepath to make momentum and doom spends
                    //  fully manual until we have a sane solution for momentum  handling
                    //  when momenutm is generated from a test.
                    //Conan2d20Actor.spendDoom(doomSpend); 
                    diceQty += rollData.diceModifier;
                    await this.calculateSkillRoll(diceQty, rollData.skill.value, 0, trained, rollData.difficulty, rollData.successModifier, cardData, undefined);
                }
                catch(e) {
                    console.log(e);
                    ui.notifications.error(e);
                }
            } else {
                try {
                    await this.calculateSkillRoll(diceQty, rollData.skill.value, 0, trained, rollData.difficulty, rollData.successModifier, cardData, undefined);
                }
                catch(e) {
                    console.log(e);
                    ui.notifications.error(e);
                }
            }
        } else {
            if (rollData.skill.trained > 0) {
                 trained = true;
            }
            diceQty = baseDice;
            if (rollData.diceModifier > 0) {
                try {
                    if (rollData.diceModifierType === 'momentum') {
                    //  We've disabled these codepaths to make momentum and doom spends
                    //  fully manual until we have a sane solution for momentum  handling
                    //  when momenutm is generated from a test.
                    //    Conan2d20Actor.spendMomentum(rollData.diceModifier); 
                        diceQty += rollData.diceModifier;
                    } else if (rollData.diceModifierType === 'doom') {
                    //    Conan2d20Actor.addDoom(rollData.diceModifier); 
                        diceQty += rollData.diceModifier;
                    }
                    if (rollData.successModifier > 0) {
                        try {
                            Conan2d20Actor.spendFortune(actorData, rollData.successModifier);
                            await this.showFortuneSpendDialog(diceQty, rollData.skill.tn.value, rollData.skill.focus.value, trained, rollData.difficulty, rollData.successModifier, cardData);
                        }
                        catch(e) {
                            console.log(e);
                            ui.notifications.error(e);
                        }
                    } else {
                        await this.calculateSkillRoll(diceQty, rollData.skill.tn.value, rollData.skill.focus.value, trained, rollData.difficulty, rollData.successModifier, cardData, undefined);
                    }
                }
                catch(e) {
                    console.log(e);
                    ui.notifications.error(e);
                }
            } else if (rollData.successModifier > 0) {
                try {
                    Conan2d20Actor.spendFortune(actorData, rollData.successModifier);
                    await this.showFortuneSpendDialog(diceQty, rollData.skill.tn.value, rollData.skill.focus.value, trained, rollData.difficulty, rollData.successModifier, cardData);
                }
                catch(e) {
                    console.log(e);
                    ui.notifications.error(e);
                }
            } else {
                await this.calculateSkillRoll(diceQty, rollData.skill.tn.value, rollData.skill.focus.value, trained, rollData.difficulty, rollData.successModifier, cardData, undefined);
            }
        }
    }

    static async showFortuneSpendDialog(diceQty: number,
        tn: number,
        focus: number = 0,
        trained: boolean = false,
        difficulty: number = 0,
        autoSuccess: number = 0,
        cardData: any) {
        let dialogData;
        const template = 'systems/conan2d20/templates/apps/fortune-roll-dialogue.html';
        return renderTemplate(template, dialogData).then((html) => {
            new Dialog({
              content: html,
              title: "Roll remaining dice?",
              buttons: {
                yes: {
                  label: 'Yes',
                  callback: () => this.calculateSkillRoll(diceQty, tn, focus, trained, difficulty, autoSuccess, cardData, undefined),
                },
                no: {
                  label: 'No',
                  callback: () => this.calculateSkillRoll(0, tn, focus, trained, difficulty, autoSuccess, cardData, undefined),
                }
              },
              default: 'yes',
            }).render(true);
        });
    }

    static async showDamageRollDialog({dialogData, rollData, cardData, actorData}) {
        return renderTemplate("systems/conan2d20/templates/apps/damage-roll-dialogue.html", dialogData).then(html => {
            new Dialog({
                content: html,
                title: dialogData.title,
                buttons: {
                    "roll" : {
                        label : "Roll Damage",
                        callback : async (template) => {
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.optionalBaseDmg = Number(template.find('[name="baseDamage"]').val() || 0)
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.attackType = Number(template.find('[name="attackType"]').val() || 0)
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.momentumModifier = Number(template.find('[name="momentumModifier"]').val() || 0)
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.reloadModifier = Number(template.find('[name="reloadModifier"]').val() || 0)
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.reloadItem = template.find('[name="reloadItem"]').val() || ''
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.talentModifier = Number(template.find('[name="talentModifier"]').val() || 0)
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.attackerType = dialogData.modifiers.attacker;
                            try {
                                await Conan2d20Dice.generateDamageRoll(rollData, cardData, actorData);
                            }
                            catch (e) {
                                console.log(e);
                                ui.notifications.error(e);
                            }
                        }
                    }
                }
            }, {classes : ["roll-dialog"]}).render(true)
        })
    }

    static async showSkillRollDialog({dialogData, rollData, cardData, actorData})
    {
        return renderTemplate("systems/conan2d20/templates/apps/skill-roll-dialogue.html", dialogData).then(html => {
            new Dialog({
                content : html,
                title : dialogData.title,
                buttons : {
                    "roll" : {
                        label : "Roll Skill",
                        callback : async (template) => {
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.difficulty = Number(template.find('[name="difficulty"]').val() || 0)
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.diceModifierType = template.find('[name="diceModifierType').val() || ''
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.diceModifier = Number(template.find('[name="diceModifier"]').val() || 0)
                            /* eslint no-param-reassign: "error" */
                            // @ts-ignore
                            rollData.successModifier = Number(template.find('[name="successModifier"]').val() || 0)
                            try {
                                let baseDice = 2;
                                if (dialogData.modifiers.actorType === 'npc') {
                                    if (actorData.data.isMinion) {
                                        baseDice = 1;
                                    } 
                                }
                                await Conan2d20Dice.generateSkillRoll(baseDice, rollData, cardData, actorData);
                             }
                            catch (e) {
                                console.log(e);
                                ui.notifications.error(e);
                            }
                        }
                    }
                }
            }, {classes : ["roll-dialog"]}).render(true)
        })
    }

    /**
    * Activate event listeners using the chat log html.
    * @param html {HTML}  Chat log html
    */
    static async chatListeners(html:any)
    {
        // Custom entity clicks
        html.on("click", ".reroll", ev =>
        {
            const button = $(ev.currentTarget);
            // @ts-ignore
            const messageId = button.parents('.message').attr("data-message-id");
            const message = game.messages.get(messageId);

            const rolls = [];
            $(message.data.content).children('.roll').each(function() {
                rolls.push( $( this ).text().trim() );
            });
        })
        html.on("click", ".roll-list-entry", ev =>
        {
            const target = $(ev.currentTarget);
            const messageId = target.parents('.message').attr('data-message-id');
            const message = game.messages.get(messageId);

            if (message.data.speaker.actor || game.user.isGM) {
                const actor = game.actors.get(message.data.speaker.actor);
                // @ts-ignore
                if (actor.permission === ENTITY_PERMISSIONS.OWNER && actor.data.type === "character") {
                    if (message.data.flags.data.rollData.reroll === false) {
                        // @ts-ignore
                        target.toggleClass("selected");

                        const newHtml = target.parents().children('.message-content').html();
                        message.update({content: newHtml});
                    }
                }
            }
        });
    }
}
