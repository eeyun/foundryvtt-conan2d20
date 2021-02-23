export default function () {
  const templatePaths: string[] = [
    'systems/conan2d20/templates/apps/skill-roll-dialogue.html',
    'systems/conan2d20/templates/apps/damage-roll-dialogue.html',
    'systems/conan2d20/templates/apps/fortune-roll-dialogue.html',
    'systems/conan2d20/templates/items/item-sheet.html',
    'systems/conan2d20/templates/items/armor-details.html',
    'systems/conan2d20/templates/items/armor-sidebar.html',
    'systems/conan2d20/templates/items/display-details.html',
    'systems/conan2d20/templates/items/display-sidebar.html',
    'systems/conan2d20/templates/items/kit-details.html',
    'systems/conan2d20/templates/items/kit-sidebar.html',
    'systems/conan2d20/templates/items/npcaction-details.html',
    'systems/conan2d20/templates/items/npcattack-details.html',
    'systems/conan2d20/templates/items/npcattack-sidebar.html',
    'systems/conan2d20/templates/items/spell-sheet.html',
    'systems/conan2d20/templates/items/talent-details.html',
    'systems/conan2d20/templates/items/talent-sidebar.html',
    'systems/conan2d20/templates/items/transportation-details.html',
    'systems/conan2d20/templates/items/transportation-sidebar.html',
    'systems/conan2d20/templates/items/weapon-details.html',
    'systems/conan2d20/templates/items/weapon-sidebar.html',
    'systems/conan2d20/templates/items/action-details.html',
    'systems/conan2d20/templates/items/action-sidebar.html',
    'systems/conan2d20/templates/items/enchantment-details.html',
    'systems/conan2d20/templates/actors/character-sheet.html',
    'systems/conan2d20/templates/actors/delete-item-dialog.html',
    'systems/conan2d20/templates/actors/tabs/actor-character.html',
    'systems/conan2d20/templates/actors/tabs/actor-actions.html',
    'systems/conan2d20/templates/actors/tabs/actor-inventory.html',
    'systems/conan2d20/templates/actors/tabs/actor-spells.html',
    'systems/conan2d20/templates/actors/tabs/actor-skills.html',
    'systems/conan2d20/templates/actors/tabs/actor-talents.html',
    'systems/conan2d20/templates/actors/tabs/item-line.html',
    'systems/conan2d20/templates/actors/tabs/npcattack-line.html',
    'systems/conan2d20/templates/actors/main/actor-header.html',
    'systems/conan2d20/templates/actors/main/actor-health.html',
    'systems/conan2d20/templates/actors/main/actor-armor.html',
    'systems/conan2d20/templates/actors/main/actor-resources.html',
    'systems/conan2d20/templates/actors/main/actor-details.html',
    'systems/conan2d20/templates/actors/npc/actions.html',
    'systems/conan2d20/templates/actors/npc/attacks.html',
    'systems/conan2d20/templates/actors/npc/attributes.html',
    'systems/conan2d20/templates/actors/npc/fields.html',
    'systems/conan2d20/templates/actors/npc/health.html',
  ];
  return loadTemplates(templatePaths);
}
