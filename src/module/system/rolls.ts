import {
    ConanChat
} from "./chat.js";
import {
    CombatDie
} from "./dice.js";

export class ConanRoll {
    /**
     * Reference: 
     * @param {number} diceQty          Number of d20 to roll
     * @param {number} tn               The Skill + Attribute to roll under
     * @param {number} focus            The Focus value to roll under for extra successes
     * @param {number} rerolls          How many dice can be rerolled
     * @param {number} autoSuccess      How many successed to add
     * @param {boolean} unskilled       Is the roll unskilled, adds 19 to generate complications
     */
    static async roll(diceQty = 2, tn = 1, focus = 0, rerolls = 0, autoSuccess = 0, unskilled = false) {
        // Validate parameters for invalid values
        if (Number.isNaN(diceQty)) {
            console.log("Conan 2D20 | Error in Skill Check, D20 Quantity, 1st parameter is not a Number.");
        }
        if (Number.isNaN(tn)) {
            console.log("Conan 2D20 | Error in Skill Check, Target Number, 2nd parameter is not a Number.");
        }
        if (Number.isNaN(focus)) {
            console.log("Conan 2D20 | Error in Skill Check, Focus, 3rd parameter is not a Number.");
        }
        if (Number.isNaN(rerolls)) {
            console.log("Conan 2D20 | Error in Skill Check, Rerolls, 4th parameter is not a Number.");
        }
        if (Number.isNaN(autoSuccess)) {
            console.log("Conan 2D20 | Error in Skill Check, Automatic Successes, 5th parameter is not a Number.");
        }
        if (unskilled === true || unskilled === false) {
            console.log("Conan 2D20 | Error in Skill Check, Unskilled, 6th parameter is not a Boolean.");
        }

        /* Code contributed 
         * by @Moo Man#7518 
         * on 2020-07-02 at 10:32 AM 
         * in #system-development of the Foundry Discord

        let successes = 0
        let roll = new Dice(`${num}`d20).roll();
        roll.forEach(r => {
          if (r.roll <= expertise)
            successes++
          if (r.roll <= focus)
            successes++
        })
        */
        let rollResults = {};
        // Roll an amount of D20s equal to qtyD20
        let roll = new Roll(`${qtyD20}d20`);
        if (game.dice3d) {
            await game.dice3d.showForRoll(roll);
        }

        console.log(roll);
        /*
        rollResults[0] = roll.

       let successes: number = 0;
       let complications: number = 0;
       
        // Run through the rolled dice to count successes and complications
        roll.forEach(r => {
            // Count succeses below or equal to TN
            if (r <= tn) {
                successes++;
            }
            if (r <= focus) {
                successes++;
            }
            if (unskilled && r == 19) {
                complications++;
            }
            if (r == 20) {
                complications++;
            }
        });

        */
        let createData = {
            content: roll.toMessage(),
            speaker: Roll.getActorData()
        }

        ChatMessage.create(createData);
        //ConanChat.renderRollCard(roll);
    }

    static async Skillroll(diceQty: number, skill: string, actorData) {
        // Validate parameters for invalid values
        if (Number.isNaN(diceQty)) {
            console.log("Conan 2D20 | Error in Skill Check, D20 Quantity, 1st parameter is not a Number.");
        }
        if (skill.toString()) {
            console.log("Conan 2D20 | Error in Skill Check, Skill, 2nd parameter is not a String.");
        }
        var tn, focus, rerolls, autoSuccess: number = 0;
        var unskilled = true;
        if (actorData.getId(skill).expertise > 0) {
            unskilled = false;
        }

        return this.roll(diceQty, actorData.getId(skill).tn, actorData.getId(skill).focus, actorData.getId(skill).rerolls, actorData.getId(skill).autoSuccess, unskilled);
    }

    /**
     * Roll the Combat Dice required and output to chat the results, damages & effects.
     * @param {number} diceQty
     * @param {object} context
     * @param {jQuery.Event} event
     * @param {function} callback
     */
    static CombatRoll(diceQty: Number = 1, qualities: String[] = null) {
        // Validate parameters for invalid values
        if (Number.isNaN(diceQty)) {
            console.log("Conan 2D20 | Error in Skill Check, Dice Quantity, 1st parameter is not a Number.");
        }
        let combatDice = new CombatDie(diceQty);

        let damages: number = 0;
        let effects: number = 0;

        let rollResults = combatDice.getResultValues();


        rollResults.forEach(r => {
            // Count Damages
            if (r === 1 || r === "Effect") {
                damages++;
            }
            if (r === 2) {
                damages++;
                damages++;
            }
            // Count Effects 
            if (r === "Effect") {
                effects++;
            }
        });

        // concat results
        let results = {
            rollResults,
            damages,
            effects,
            qualities
        };

        // Output Roll results to chat
        ConanChat.renderCombatCard(results, null);

        // return results, damages, effects, {additionnal effects}
        return results;
    }

}