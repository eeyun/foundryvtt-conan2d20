import { CONFIG as CONANCONFIG } from './scripts/config';
import registerSettings from './module/settings';
import loadTemplates from './module/templates';
import registerHandlebarsHelpers from './module/handlebars';
import ItemConan2d20 from './module/item/item';
import ActorConan2d20 from './module/actor/actor';
import { Conan2d20System } from './module/conan2d20-system';
import registerActors from './module/register-actors';
import {registerSheets} from './module/register-sheets';
import Counter from "./module/system/counter"

require('./styles/conan2d20.scss');

Hooks.once('init', () => {
    console.log('Conan2d20 | Initializing Robert E. Howard\'s Conan 2D20 System');

    CONFIG.CONAN = CONANCONFIG;

    for (const k in CONFIG.CONAN) {
        if (Object.prototype.hasOwnProperty.call(CONFIG.CONAN, k)) {
        CONFIG[k] = CONFIG.CONAN[k];
        }
    }

    CONFIG.Item.entityClass = ItemConan2d20;
    CONFIG.Actor.entityClass = ActorConan2d20;
    CONFIG.CONAN.Counter = new Counter();

    registerSettings();
    loadTemplates();
    registerActors();
    registerSheets();
    registerHandlebarsHelpers();
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */
/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once('setup', () => {

   (window as any).Conan2d20 = new Conan2d20System();

    const toLocalize: any = [
        'attributes', 'skills', 'encumbranceTypes', 'availabilityTypes', 'coverageTypes',
        'armorTypes', 'armorQualities', 'weaponGroups', 'weaponTypes', 'weaponSizes',
        'weaponRanges', 'weaponReaches', 'weaponQualities', 'actionTypes', 'actionCategories',
        'naturesTypes', 'languages', 'talentTypes', 'skillRollResourceSpends', 'rollDifficultyLevels',
        'rollResults', 'actionCounts', 'kitTypes', 'conditionTypes', 'expertiseFields'
    ];

    const noSort: any = [
        'availabilityTypes', 'rollDifficultyLevels', 'weaponSizes'
    ];

    for ( let o of toLocalize ) {
    const localized = Object.entries(CONFIG.CONAN[o]).map(e => {
        // @ts-ignore
        return [e[0], game.i18n.localize(e[1])];
    });
    if ( !noSort.includes(o) ) localized.sort((a, b) => a[1].localeCompare(b[1]));
    CONFIG.CONAN[o] = localized.reduce((obj, e) => {
        obj[e[0]] = e[1];
        return obj;
    }, {});
  }
});

Hooks.on("ready", () => {
    CONFIG.CONAN.Counter.render(true)

    // @ts-ignore
    game.socket.on("system.conan2d20", event => {
        if (event.type == "setCounter" && game.user.isGM)
        {
            Counter.setCounter(event.payload.value, event.payload.type)
        }

        if (event.type == "updateCounter")
        {
            CONFIG.CONAN.Counter.render(true)
        }
    })
})

// On rendering a chat message, if it contains item data (from a posted item), make draggable with the data transfer set to that item data.
Hooks.on("renderChatMessage", (msg, html, data) => {
    if (hasProperty(data, "message.flags.conan2d20.itemData"))
    {
        html[0].addEventListener("dragstart", (ev) => {
            ev.dataTransfer.setData("text/plain", JSON.stringify({type : "item-drag", payload: data.message.flags.conan2d20.itemData}))
        })
    }
})

Hooks.on('preCreateActor', (actor: any, dir: any) => {
    if (game.settings.get('conan2d20', 'defaultTokenSettings')) {
    // Set wounds, and display name visibility
        mergeObject(actor, {
          'token.bar1': { attribute: 'health.physical.value' }, // Default Bar 1 to Wounds
          'token.bar2': { attribute: 'health.mental.value' }, // Default Bar 1 to Wounds
          'token.displayName': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER, // Default display name to be on owner hover
          'token.displayBars': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER, // Default display bars to be on owner hover
          'token.disposition': CONST.TOKEN_DISPOSITIONS.HOSTILE, // Default disposition to hostile
          'token.name': actor.name, // Set token name to actor name
        });

        // Default characters to HasVision = true and Link Data = true
        if (actor.type == 'character') {
          actor.token.vision = true;
          actor.token.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
          actor.token.actorLink = true;
        }
    }
});
