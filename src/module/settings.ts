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
    game.settings.register("conan2d20", "playerCounterEdit", {
        name: "Allow Players To Edit Counters",
        hint: "Players will be able to change counter values manually.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    })
    game.settings.register('conan2d20', 'momentum', {                       
        name: 'Momentum',                                    
        scope: 'world',                                                              
        config: false,                                                                
        default: 0,                                                               
        type: Number,                                                               
    });
    game.settings.register('conan2d20', 'doom', {                       
        name: 'Doom',                                    
        scope: 'world',                                                              
        config: false,                                                                
        default: 0,                                                               
        type: Number,                                                               
    });
}
