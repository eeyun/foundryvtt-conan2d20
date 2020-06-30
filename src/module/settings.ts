export default function () {
    game.settings.register('conan2d20', 'worldSchemaVersion', {
        name: 'Actor Schema Version',
        hint: "Records the schema version for Conan2d20 system actor data. (don't modify this unless you know what you are doing)",
        scope: 'world',
        config: true,
        default: 0,
        type: Number,
    });
    game.settings.register('conan2d20', 'defaultTokenSettings', {                       
        name: 'Default Token Settings',                                    
        hint: "Automatically set advised token settings to newly created Actors.",
        scope: 'world',                                                              
        config: true,                                                                
        default: true,                                                               
        type: Boolean,                                                               
    });
}
