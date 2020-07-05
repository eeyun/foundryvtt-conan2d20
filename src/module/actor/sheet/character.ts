import ActorSheetConan2d20 from './base';
import { C2_Utility } from '../../../scripts/utility';
import { data } from 'jquery';

class ActorSheetConan2d20Character extends ActorSheetConan2d20 { 
    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            classes: options.classes.concat(['conan2d20', 'sheet', 'actor', 'pc', 'character-sheet']),
            width: 700,
            height: 800,
            tabs: [{ navSelector: ".sheet-navigation", contentSelector: ".sheet-content", initial: "character" }]
        });
        return options;
    }

    get template() {
        const path = 'systems/conan2d20/templates/actors/';
        if (!game.user.isGM && this.actor.limited) return `${path}readonly-sheet.html`;
        return `${path}actor-sheet.html`;
    }

    getData() {
        const sheetData = super.getData();

        // Update wounded icon
        sheetData.data.health.physical.wounds = C2_Utility.addDots(duplicate(sheetData.data.health.physical.wounds), sheetData.data.health.physical.wounds.max);

        // Update traumatized icon
        sheetData.data.health.mental.traumas = C2_Utility.addDots(duplicate(sheetData.data.health.mental.traumas), sheetData.data.health.mental.traumas.max);

        return sheetData;
    }

      /* -------------------------------------------- */

    /**
     * Organize and classify Items for Character sheets
     * @private
     */

    _prepareItems(actorData) {
        const inventory = {                                                          
            weapon: { label: game.i18n.localize("CONAN.inventoryWeaponsHeader"), items: [] },
            equipment: { label: game.i18n.localize("CONAN.inventoryEquipmentHeader"), items: [] },
            kits: { label: game.i18n.localize("CONAN.inventoryKitsHeader"), items: [] },
            talents: { label: game.i18n.localize("CONAN.inventoryTalentsHeader"), items: [] },
        };                                                                           
                                                                                  
        const backgrounds = {                                                        
            homeland: { label: game.i18n.localize("CONAN.bgHomelandHeader"), bgs: [] },
            archetype: { label: game.i18n.localize("CONAN.bgArchetypeHeader"), bgs: [] },
            caste: { label: game.i18n.localize("CONAN.bgCasteHeader"), bgs: [] },
        };

        let readonlyEquipment = [];

        const attacks = {
            weapon:  { label: 'Compendium Weapon', items: [], type: 'weapon' },
        };

        for (const i of actorData.items) {                                           
            i.img = i.img || CONST.DEFAULT_TOKEN;                                      
                                                                                       
            // Read-Only Equipment                                                     
            if (i.type === 'equipment' || i.type === 'consumable' || i.type === 'kit') {
              readonlyEquipment.push(i);                                               
              actorData.hasEquipment = true;                                           
            }                                                                          
            
            i.canBeEquipped = true;
            i.isEquipped = i?.data?.equipped ?? false;
            // Inventory                                                               
            if (Object.keys(inventory).includes(i.type)) {                             
                i.data.quantity = i.data.quantity || 0;                                  
                i.data.encumbrance = i.data.encumbrance || 0;                            
                // i.totalWeight = formatEncumbrance(approximatedEncumbrance);                          
                i.hasCharges = (i.type === 'consumable') && i.data.charges.max > 0;      
                if (i.type === 'weapon') {                                                   
                    let item;                                                                
                    try {                                                                  
                        item = this.actor.getOwnedItem(i._id);                               
                        i.chatData = item.getChatData({ secrets: this.actor.owner });        
                    } catch (err) {                                                        
                        console.log(`Conan 2D20 System | Character Sheet | Could not load item ${i.name}`)
                    }                                                                      
                    attacks["weapon"].items.push(i);
                }
                inventory[i.type].items.push(i);

                if  (i.type === 'weapon' || i.type === 'equipment') {
                    i.canBeBroken = true;
                } else {
                    i.canBeBroken = false;
                }

            }

            else if (i.type === 'background') {                                        
                inventory[i.type].bgs.push(i);                                         
            }                                                                          
        }

        // Assign and return                                                       
        actorData.inventory = inventory;                                           
        actorData.readonlyEquipment = readonlyEquipment;                           
        actorData.backgrounds = backgrounds;                                       

        const backgroundNames =  new Set(actorData.items
            .filter(item => item.type === 'background')
            .map(item => item.name));
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (!this.options.editable) return;

        html.find('img[data-edit]').click(ev => this._onEditImage(ev));
    }
}

export default ActorSheetConan2d20Character;
