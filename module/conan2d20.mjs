// Import Modules
import { Utils } from "./utils.js";
import { preloadHandlebarsTemplates } from "./templates.js";

// Import Sheets & Applications
import { Conan2D20Actor } from "./actors/actor.js";
import { Conan2D20ActorSheet } from "./actors/actor-sheet.js";
import { Conan2D20FoeSheet } from "./actors/foe-sheet.js";
import { Conan2D20Item } from "./items/item.js";
import { Conan2D20ItemSheet } from "./items/item-sheet.js";


Hooks.once('init', async function() {
  console.log('Conan2D20 System | Initializing Sytem.');

  game.conan2d20 = {
    Conan2D20Actor,
    Conan2D20Item,
    rollItemMacro
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */

  // Define custom Entity classes
  CONFIG.Actor.entityClass = Conan2D20Actor;
  CONFIG.Item.entityClass = Conan2D20Item;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("conan2d20", Conan2D20ActorSheet, { makeDefault: true });
  Actors.registerSheet("conan2d20", Conan2D20FoeSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("conan2d20", Conan2D20ItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });
  
  // Preload Handlebars Templates
  preloadHandlebarsTemplates();
});

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createConan2D20Macro(data, slot));
   console.log('Conan2D20 System | Sytem is Ready.');
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createConan2D20Macro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.conan2d20.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "conan2d20.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}