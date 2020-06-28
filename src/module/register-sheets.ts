import { ItemSheetConan2d20 } from './item/sheet';

export function registerSheets() {
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('conan2d20', ItemSheetConan2d20, { makeDefault: true });    
}

