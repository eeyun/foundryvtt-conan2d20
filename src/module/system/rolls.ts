import {ConanChat} from "./chat";
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
    static async skillRoll(diceQty: number,
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
            rolls = rollInstance.roll().parts[0].rolls;
        }

        let i;
        if (autoSuccess !== undefined && autoSuccess > 0) {
            for (i = 0; i < autoSuccess; i+=1) {
                const successRoll = {roll: 1};
                rolls.push(successRoll);
            }
        } else if (fixedrolls !== undefined){
            for (i = 0; i < fixedrolls.length; i+=1) {
                let mergeRoll = {roll: fixedrolls[i]};
                rolls.push(mergeRoll);
            }

            reroll = true;
        }

        rolls.forEach(r => {
            if (!(trained)) {
                if (r.roll === 19 || r.roll === 20)
                    complications+=1;
            } else if (r.roll === 20) {
                complications+=1;
            };
            if (r.roll <= focus) {
                crits+=1;
            } else if (r.roll <= tn) {
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
        ConanChat.renderRollCard(rollResult, rollData, cardData)
    }

    static async generateRoll(baseDice: number = 2, rollData: any, cardData: any, actorData: any) {
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
        const diceQty = baseDice + rollData.diceModifier;
        if (diceQty > 5) {
            throw generatorErr.bonus_count;
        } else if ((rollData.diceModifier + rollData.successModifier) > 3) {
            throw generatorErr.bonus_count
        }
        let trained = false;
        if (rollData.skill.trained > 0) {
             trained = true;
        }
        if (rollData.successModifier > 0) {
            try {
                Conan2d20Actor.spendFortune(actorData, rollData.successModifier);
                await this.showFortuneSpendDialog(diceQty, rollData.skill.tn, rollData.skill.focus.value, trained, rollData.difficulty, rollData.successModifier, cardData);
            }
            catch(e){
                console.log(e);
                ui.notifications.error(e);
            }
        } else {
            await this.skillRoll(diceQty, rollData.skill.tn, rollData.skill.focus.value, trained, rollData.difficulty, rollData.successModifier, cardData, undefined);
        }
    }

    /**
     * Roll the Combat Dice required and output to chat the results, damages & effects.
     * @param {number} diceQty
     * @param {object} context
     * @param {jQuery.Event} event
     * @param {function} callback
     */
    // static combatRoll(diceQty: Number = 1, qualities: String[] = null) {
    //     // Validate parameters for invalid values
    //     if (Number.isNaN(diceQty)) {
    //         console.log("Conan 2D20 | Error in Skill Check, Dice Quantity, 1st parameter is not a Number.");
    //     }
    //     let combatDice = new CombatDie(diceQty);

    //     let damages: number = 0;
    //     let effects: number = 0;

    //     let rollResults = combatDice.getResultValues();


    //     rollResults.forEach(r => {
    //         // Count Damages
    //         if (r === 1 || r === "Effect") {
    //             damages++;
    //         }
    //         if (r === 2) {
    //             damages++;
    //             damages++;
    //         }
    //         // Count Effects 
    //         if (r === "Effect") {
    //             effects++;
    //         }
    //     });

    //     // concat results
    //     let results = {
    //         rollResults,
    //         damages,
    //         effects,
    //         qualities
    //     };

    //     // Output Roll results to chat
    //     ConanChat.renderCombatCard(results, null);

    //     // return results, damages, effects, {additionnal effects}
    //     return results;
    // }

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
                  callback: () => this.skillRoll(diceQty, tn, focus, trained, difficulty, autoSuccess, cardData, undefined),
                },
                no: {
                  label: 'No',
                  callback: () => this.skillRoll(0, tn, focus, trained, difficulty, autoSuccess, cardData, undefined),
                }
              },
              default: 'yes',
            }).render(true);
        });
    }

    static async showSkillRollDialog({dialogData, rollData, cardData, actorData})
    {
        return renderTemplate("systems/conan2d20/templates/apps/roll-dialogue.html", dialogData).then(html => {
            new Dialog({
                content : html,
                title : dialogData.title,
                buttons : {
                    "roll" : {
                        label : "Roll",
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
                                await Conan2d20Dice.generateRoll(2, rollData, cardData, actorData);
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
