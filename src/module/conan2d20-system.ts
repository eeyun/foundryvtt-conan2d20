import { DB } from './system/db';

declare var Conan: Conan2d20System;

type Conan2d20Localization = Localization & {fallback: any}

export class Conan2d20System {
    DB: any;
    CONFIG: any;

    constructor() {
        console.log('Conan2d20 System | Initializing static content database');
        let translated = game.i18n.translations.CONAN;
        if (game.i18n._fallback.CONAN !== undefined) {                       
            translated = mergeObject(game.i18n._fallback.CONAN, translated); 
        };
	    this.DB = mergeObject(DB, translated); //static content
	    this.CONFIG = CONFIG.CONAN; //shorthand
    }
}
