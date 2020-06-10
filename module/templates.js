/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [

    // Actor Sheet Partials
    "systems/conan2d20/templates/actors/includes/actor-header.html",
    "systems/conan2d20/templates/actors/includes/actor-health.html",
    "systems/conan2d20/templates/actors/includes/actor-navigation.html",
    "systems/conan2d20/templates/actors/includes/actor-tabs-background.html",
    "systems/conan2d20/templates/actors/includes/actor-tabs-equipment.html",
    "systems/conan2d20/templates/actors/includes/actor-tabs-weapons.html",
    "systems/conan2d20/templates/actors/includes/actor-tabs-skills.html",
    "systems/conan2d20/templates/actors/includes/actor-tabs-spells.html",
    "systems/conan2d20/templates/actors/includes/actor-tabs-talents.html",

    // Item Sheet Partials
    "systems/conan2d20/templates/items/includes/item-action.html",
    "systems/conan2d20/templates/items/includes/item-activation.html",
    "systems/conan2d20/templates/items/includes/item-description.html"
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};