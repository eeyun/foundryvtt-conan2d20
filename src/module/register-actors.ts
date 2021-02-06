import ActorSheetConan2d20Character from './actor/sheet/character';
import ActorSheetConan2d20NPC from './actor/sheet/npc';

function registerActors() {
  Actors.unregisterSheet('core', ActorSheet);

  // Register Character Sheet
  Actors.registerSheet('conan2d20', ActorSheetConan2d20Character, {
    types: ['character'],
    makeDefault: true,
  });

  Actors.registerSheet('conan2d20', ActorSheetConan2d20NPC, {
    types: ['npc'],
    makeDefault: true,
  });
}

export default registerActors;
