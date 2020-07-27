import { CONFIG } from "../../scripts/config";
import { Conan2d20Dice } from "./rolls";

export class ConanChat {

    static renderRollCard(rollResult, rollData, cardData, type) {
        if (type === 'skill') {
            rollResult.result = CONFIG.rollResults[rollResult.result]
        };

        cardData["flags.data"] = {
            resultData: rollResult,
            title: cardData.title,
            template: cardData.template,
            type,
            rollData
        }

        // TODO: add 3d dice with dice-so-nice
        renderTemplate(cardData.template, rollResult).then(html => {
            ChatMessage.create({
                title: cardData.title,
                content : html,
                "flags.data": cardData["flags.data"],
                // sound : CONFIG.sounds.dice,
                speaker : cardData.speaker,
                flavor : cardData.title
            })
        })
    }
}

// Activate chat listeners defined in rolls
Hooks.on('renderChatLog', (log, html: HTMLDocument, data) => {
    Conan2d20Dice.chatListeners(html)
});

Hooks.on('getChatLogEntryContext', (html: HTMLDocument, options: Array<Object>) => {
    const canApply = li => li.find('.skill-roll-card').length && game.user.isGM;
    const canReroll = function(li) {
        let result = false;
        const message = game.messages.get(li.attr('data-message-id'));

        if (message.data.speaker.actor || game.user.isGM) {
            const actor = game.actors.get(message.data.speaker.actor);
            // @ts-ignore
            if (actor.permission === ENTITY_PERMISSIONS.OWNER && actor.data.type === "character") {
                const card = li.find(".roll-card");
                if (card.length && message.data.flags.data.rollData.reroll === false) {
                    result = true;
                }
            }
        }
        return result;
    };
    const canSpendMomentum = function(li) {
        let result = false;
        const message = game.messages.get(li.attr('data-message-id'));

        if (message.data.speaker.actor || game.user.isGM) {
            const actor = game.actors.get(message.data.speaker.actor);
            // @ts-ignore
            if (actor.permission === ENTITY_PERMISSIONS.OWNER && actor.data.type === "character") {
                const skillcard = li.find(".skill-roll-card");
                if (skillcard.length && message.data.flags.data.resultData.momentumGenerated)
                    result = true;
            }
        }
        return result;
    }
    options.push(
        {
            name: game.i18n.localize("CONAN.CHATOPT.triggerReroll"),
            icon: '<i class="fas fa-dice"></i>',
            condition: canReroll,
            callback: li =>  {
                const message = game.messages.get(li.attr("data-message-id"));
                // @ts-ignore
                game.actors.get(message.data.speaker.actor).triggerReroll(message, message.data.flags.data.type);
            }
        },
        {
            name: game.i18n.localize("CONAN.CHATOPT.momentumSpendImmediate"),
            icon: '<i class="fas fa-plus-square"></i>',
            condition: canSpendMomentum,
            callback: li =>  {
              const message = game.messages.get(li.attr("data-message-id"));
            // @ts-ignore
              game.actors.get(message.data.speaker.actor).momentumSpendImmediate(message,"spendMomentum");
            }
        }
    )
})
