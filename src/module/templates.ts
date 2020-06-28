export default function() {
    const templatePaths: string[] = [
        'systems/conan2d20/templates/items/item-sheet.html',
        'systems/conan2d20/templates/items/equipment-details.html',
        'systems/conan2d20/templates/items/equipment-sidebar.html',
        'systems/conan2d20/templates/actors/actor-sheet.html',
        'systems/conan2d20/templates/actors/delete-item-dialog.html',
        'systems/conan2d20/templates/actors/tabs/actor-inventory.html',
        'systems/conan2d20/templates/actors/tabs/actor-spells.html',
        'systems/conan2d20/templates/actors/tabs/actor-skills.html',
        'systems/conan2d20/templates/actors/tabs/actor-talents.html',
        'systems/conan2d20/templates/actors/tabs/item-line.html',
        'systems/conan2d20/templates/actors/main/actor-header.html',
        'systems/conan2d20/templates/actors/main/actor-health.html',
        'systems/conan2d20/templates/actors/main/actor-background.html',
        'systems/conan2d20/templates/actors/main/actor-attributes.html'
    ];
    return loadTemplates(templatePaths);
}
