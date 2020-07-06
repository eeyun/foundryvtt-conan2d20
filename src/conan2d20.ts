import { CONFIG as CONANCONFIG } from './scripts/config';
import registerSettings from './module/settings';
import loadTemplates from './module/templates';
import registerHandlebarsHelpers from './module/handlebars';
import ItemConan2d20 from './module/item/item';
import ActorConan2d20 from './module/actor/actor';
import { Conan2d20System } from './module/conan2d20-system';
import registerActors from './module/register-actors';
import {registerSheets} from './module/register-sheets';
import {ConanRoll} from './module/system/rolls';
import {CombatDie} from './module/system/dice';

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

    const toLocalize: any = ['attributes', 'skills', 'encumbranceTypes', 'availabilityTypes', 'coverageTypes', 'armorTypes', 'armorQualities', 'weaponGroups', 'weaponTypes', 'weaponSizes', 'weaponRanges', 'weaponReaches', 'weaponQualities', 'actionTypes', 'actionCategories', "naturesTypes", "languages", "talentTypes"];
    for (const o of toLocalize) {
        CONFIG.CONAN[o] = Object.entries(CONFIG.CONAN[o]).reduce((obj, e: any) => {
            obj[e[0]] = game.i18n.localize(e[1]);
            return obj;
        }, {});
    }
});

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
