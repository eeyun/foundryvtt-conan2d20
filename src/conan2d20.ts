import {CONFIG as CONANCONFIG} from './scripts/config';
import registerSettings from './module/settings';
import loadTemplates from './module/templates';
import registerHandlebarsHelpers from './module/handlebars';
import ItemConan2d20 from './module/item/item';
import ActorConan2d20 from './module/actor/actor';
import registerActors from './module/register-actors';
import registerSheets from './module/register-sheets';
import Counter from './module/system/counter';
import CombatDie from './module/system/dice';

require('./styles/conan2d20.scss');

Hooks.once('init', () => {
  console.log("Conan2d20 | Initializing Robert E. Howard's Conan 2D20 System");

  CONFIG.CONAN = CONANCONFIG;

  for (const k in CONFIG.CONAN) {
    if (Object.prototype.hasOwnProperty.call(CONFIG.CONAN, k)) {
      CONFIG[k] = CONFIG.CONAN[k];
    }
  }

  CONFIG.Item.entityClass = ItemConan2d20;
  CONFIG.Actor.entityClass = ActorConan2d20;
  CONFIG.CONAN.Counter = new Counter();
  CONFIG.CONAN.Dice = {CombatDie};

  registerSettings();
  loadTemplates();
  registerActors();
  registerSheets();
  registerHandlebarsHelpers();

  game.conan2d20 = {
    config: CONANCONFIG,
  };
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */
/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once('setup', () => {
  for (const obj in game.conan2d20.config) {
    if ({}.hasOwnProperty.call(game.conan2d20.config, obj)) {
      for (const el in game.conan2d20.config[obj]) {
        if ({}.hasOwnProperty.call(game.conan2d20.config[obj], el)) {
          if (typeof game.conan2d20.config[obj][el] === 'string') {
            game.conan2d20.config[obj][el] = game.i18n.localize(
              game.conan2d20.config[obj][el]
            );
          }
        }
      }
    }
  }
});

Hooks.on('ready', () => {
  CONFIG.CONAN.Counter.render(true);

  CONFIG.Dice.terms.p = CombatDie;

  // @ts-ignore
  game.socket.on('system.conan2d20', event => {
    if (event.type === 'setCounter' && game.user.isGM) {
      Counter.setCounter(event.payload.value, event.payload.type);
    }

    if (event.type === 'updateCounter') {
      CONFIG.CONAN.Counter.render(true);
    }
  });
});

Hooks.on('preCreateChatMessage', (data, options, user) => {
  if (!data.roll) return;
  const roll = JSON.parse(data.roll);

  // Go through each term, sum the 'effect' results
  data['flags.conan2d20.effects'] = roll.terms.reduce((total, term) => {
    if (term.class !== 'CombatDie') return total;
    return (
      total +
      term.results.reduce((effects, result) => {
        return effects + (result.effect ? 1 : 0);
      }, 0)
    );
  }, 0);
});

// On rendering a chat message, if it contains item data (from a posted item), make draggable with the data transfer set to that item data.
Hooks.on('renderChatMessage', (msg, html, data) => {
  if (hasProperty(data, 'message.flags.conan2d20.itemData')) {
    html[0].addEventListener('dragstart', ev => {
      ev.dataTransfer.setData(
        'text/plain',
        JSON.stringify({
          type: 'item-drag',
          payload: data.message.flags.conan2d20.itemData,
        })
      );
    });
  }
  if (getProperty(msg, 'data.flags.conan2d20.effects')) {
    html
      .find('h4.dice-total')
      .append(
        ` (${msg.data.flags.conan2d20.effects} <img class="effect-total" src='systems/conan2d20/assets/dice/phoenix/phoenix-black.png'>)`
      );
  }
});

Hooks.on('preCreateActor', (actor: any, dir: any) => {
  if (game.settings.get('conan2d20', 'defaultTokenSettings')) {
    // Set wounds, and display name visibility
    mergeObject(actor, {
      'token.bar1': {attribute: 'health.physical.value'}, // Default Bar 1 to Wounds
      'token.bar2': {attribute: 'health.mental.value'}, // Default Bar 1 to Wounds
      'token.displayName': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER, // Default display name to be on owner hover
      'token.displayBars': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER, // Default display bars to be on owner hover
      'token.disposition': CONST.TOKEN_DISPOSITIONS.HOSTILE, // Default disposition to hostile
      'token.name': actor.name, // Set token name to actor name
    });

    // Default characters to HasVision = true and Link Data = true
    if (actor.type === 'character') {
      actor.token.vision = true;
      actor.token.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
      actor.token.actorLink = true;
    }
  }
});

Hooks.once('diceSoNiceReady', dice3d => {
  dice3d.addSystem(
    {id: 'conan2d20black', name: 'Conan 2d20 - Black'},
    'default'
  );
  dice3d.addSystem({id: 'conan2d20white', name: 'Conan 2d20 - White'}, false);

  dice3d.addDicePreset({
    type: 'd20',
    labels: [
      'systems/conan2d20/assets/dice/phoenix/phoenix-black.png',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
    ],
    /* eslint-disable-next-line no-sparse-arrays */
    bumpMaps: [
      'systems/conan2d20/assets/dice/phoenix/phoenixBump.png',
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
    ],
    system: 'conan2d20black',
  });

  dice3d.addDicePreset({
    type: 'd20',
    labels: [
      'systems/conan2d20/assets/dice/phoenix/phoenix-white.png',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
    ],
    /* eslint-disable-next-line no-sparse-arrays */
    bumpMaps: [
      'systems/conan2d20/assets/dice/phoenix/phoenixBump.png',
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
    ],
    system: 'conan2d20white',
  });

  dice3d.addDicePreset({
    type: 'dp',
    labels: [
      'systems/conan2d20/assets/dice/combat/black/Combat1.png',
      'systems/conan2d20/assets/dice/combat/black/Combat2.png',
      'systems/conan2d20/assets/dice/combat/black/Combat3.png',
      'systems/conan2d20/assets/dice/combat/black/Combat4.png',
      'systems/conan2d20/assets/dice/combat/black/Combat5.png',
      'systems/conan2d20/assets/dice/combat/black/Combat6.png',
    ],
    bumpMaps: [
      'systems/conan2d20/assets/dice/combat/black/Combat1.png',
      'systems/conan2d20/assets/dice/combat/black/Combat2.png',
      'systems/conan2d20/assets/dice/combat/black/Combat3.png',
      'systems/conan2d20/assets/dice/combat/black/Combat4.png',
      'systems/conan2d20/assets/dice/combat/black/Combat5.png',
      'systems/conan2d20/assets/dice/combat/black/Combat6.png',
    ],
    system: 'conan2d20black',
  });

  dice3d.addDicePreset({
    type: 'dp',
    labels: [
      'systems/conan2d20/assets/dice/combat/white/Combat1.png',
      'systems/conan2d20/assets/dice/combat/white/Combat2.png',
      'systems/conan2d20/assets/dice/combat/white/Combat3.png',
      'systems/conan2d20/assets/dice/combat/white/Combat4.png',
      'systems/conan2d20/assets/dice/combat/white/Combat5.png',
      'systems/conan2d20/assets/dice/combat/white/Combat6.png',
    ],
    bumpMaps: [
      'systems/conan2d20/assets/dice/combat/white/Combat1.png',
      'systems/conan2d20/assets/dice/combat/white/Combat2.png',
      'systems/conan2d20/assets/dice/combat/white/Combat3.png',
      'systems/conan2d20/assets/dice/combat/white/Combat4.png',
      'systems/conan2d20/assets/dice/combat/white/Combat5.png',
      'systems/conan2d20/assets/dice/combat/white/Combat6.png',
    ],
    system: 'conan2d20white',
  });
});
