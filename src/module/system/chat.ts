
import { CONFIG } from "../../scripts/config"
export class ConanChat {

    static renderRollCard(rollResult, cardData) {
        rollResult.result = CONFIG.rollResults[rollResult.result]


        renderTemplate(cardData.template, rollResult).then(html => {
            ChatMessage.create({
                content : html,
                //sound : CONFIG.sounds.dice,
                speaker : cardData.speaker,
                flavor : cardData.flavor
            })
        })
    }

    static renderCombatCard(rollResult, cardData) {
        ChatMessage.create({
            content: "Hello"
        });
    }

}