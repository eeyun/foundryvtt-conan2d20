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
                      autoSuccess: number = 0, 
                      trained: boolean = false,
                      difficulty: number = 0,
                      cardData?: any) {
        if (Number.isNaN(diceQty)) {
            throw "Conan 2D20 | Error in Skill Check, D20 Quantity is not a Number.";
        }
        if (Number.isNaN(tn)) {
            throw "Conan 2D20 | Error in Skill Check, Target Number is not a Number.";
        }
        if (Number.isNaN(focus)) {
            throw "Conan 2D20 | Error in Skill Check, Focus is not a Number.";
        }
        if (Number.isNaN(autoSuccess)) {
            throw "Conan 2D20 | Error in Skill Check, Automatic Successes is not a Number.";
        }
        if (typeof trained !== "boolean") {
            throw "Conan 2D20 | Error in Skill Check, Trained is not a Boolean.";
        }

        let rollResult = {};
        let successes = 0;
        let crits = 0;
        let momentumGenerated = 0;
        let complications = 0;
        let rolls = [];
        let rollInstance;
        let result;


        if (diceQty == 0) {
            rolls = [];
        } else {
            rollInstance = new Roll(`${diceQty}d20`);
            rolls = rollInstance.roll().parts[0].rolls;
        }

        let i;
        for (i = 0; i < autoSuccess; i++) {
            let successRoll = {roll: 1};
            rolls.push(successRoll);
        } 

        rolls.forEach(r => {
            if (!(trained)) {
                if (r.roll == 19 || r.roll == 20)
                    complications++;
            } else if (r.roll == 20) {
                complications++;
            };
            if (r.roll <= focus) {
                crits++;
            } else if (r.roll <= tn) {
                successes++
            }
        })

        successes = successes + (crits * 2);

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

        rollResult = {
            difficulty,
            successes,
            complications,
            momentumGenerated,
            result,
            rolls
        };

        ConanChat.renderRollCard(rollResult, cardData)
    }

    static async generateRoll(baseDice: number = 2, rollData: any, cardData: any, actorData: any) {
        console.log(rollData);
        if (rollData.diceModifier > 0 && rollData.diceModifierType === "") {
            throw "Conan 2D20 | Error in Skill Check, you must select a resource spend"
        } else if (rollData.diceModifierType !== "" && rollData.diceModifier === 0) {
            throw "Conan 2D20 | Error in Skill Check, you must enter a number of resources to spend"
        }
        var diceQty = baseDice + rollData.diceModifier;
        var trained = false;
        if (rollData.skill.trained > 0) {
             trained = true;
        }
        if (rollData.successModifier > 0) {
            try {
                Conan2d20Actor.spendFortune(actorData, rollData.successModifier);
                await this.showFortuneSpendDialog(diceQty, rollData.skill.tn, rollData.skill.focus.value, rollData.successModifier, trained, rollData.difficulty, cardData);
            }
            catch(e){
                console.log(e);
                ui.notifications.error(e);
            }
        } else {
            await this.skillRoll(diceQty, rollData.skill.tn, rollData.skill.focus.value, rollData.successModifier, trained, rollData.difficulty, cardData);
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
        autoSuccess: number = 0, 
        trained: boolean = false,
        difficulty: number = 0,
        cardData: any) {
        let dialogData;
        let template = 'systems/conan2d20/templates/apps/fortune-roll-dialogue.html';
        return renderTemplate(template, dialogData).then((html) => {
            new Dialog({
              content: html,
              title: "Roll remaining dice?",
              buttons: {
                yes: {
                  label: 'Yes',
                  callback: () => this.skillRoll(diceQty, tn, focus, autoSuccess, trained, difficulty, cardData),
                },
                no: {
                  label: 'No',
                  callback: () => this.skillRoll(0, tn, focus, autoSuccess, trained, difficulty, cardData),
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
                            //@ts-ignore
                            rollData.difficulty = parseInt(template.find('[name="difficulty"]').val() || 0)
                            //@ts-ignore
                            rollData.diceModifierType = template.find('[name="diceModifierType').val() || ''
                            //@ts-ignore
                            rollData.diceModifier = parseInt(template.find('[name="diceModifier"]').val() || 0)
                            //@ts-ignore
                            rollData.successModifier = parseInt(template.find('[name="successModifier"]').val() || 0)
                            try {
                                await Conan2d20Dice.generateRoll(2, rollData, cardData, actorData);
                             }
                            catch (e) {
                                {
                                    console.log(e);
                                    ui.notifications.error(e);
                                }
                            }
                        }
                    }
                }
            }, {classes : ["roll-dialog"]}).render(true)
        })
    }
}