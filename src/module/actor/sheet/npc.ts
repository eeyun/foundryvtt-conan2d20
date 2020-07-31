import ActorSheetConan2d20 from './base';

class ActorSheetConan2d20NPC extends ActorSheetConan2d20 {
    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            classes: options.classes.concat(["conan2d20", "actor", "npc-sheet"]),
            width: 450,
            heigth: 680,
        });
        return options;
    }

    get template() {
        const path = 'systems/conan2d20/templates/actors/';
        if (this.actor.getFlag('conan2d20', 'editNPC.value')) return `{path}npc-sheet.html`;
        return `${path}npc-sheet.html`;
    }

    getData() {
        const sheetData = super.getData();
        sheetData.flags = sheetData.actor.flags;
        /*if (sheetData.flags.conan2d20_updatednpcsheet === undefined) sheetData.flags.conan2d20_updatednpcsheet = {};
        if (sheetData.flags.conan2d20_updatednpcsheet.editNPC === undefined) sheetData.flags.conan2d20_updatednpcsheet.editNPC = { value: false };
        if (sheetData.flags.conan2d20_updatednpcsheet.allSaveDetail === undefined) sheetData.flags.conan2d20_updatednpcsheet.allSaveDetail = { value: '' };

        sheetData.npcEliteActive = this.npcIsElite()?' active':'';
        sheetData.npcMinionActive = this.npcIsMinion()?' active':'';
        
        return sheetData; */
        console.log(sheetData);
    }

    _prepareItems(actorData) {
        const attacks = {
            melee: { label: 'NPC Melee Attack', items: [], type: 'melee' },
            ranged: { label: 'NPC Ranged Attack', items: [], type: 'melee' },
            weapon: { label: 'Compendium Weapon', items: [], type: 'weapon' },
        };
        for (const i of actorData.items) {
            i.img = i.img || CONST.DEFAULT_TOKEN;


            if (i.type == 'melee') {
                const weaponType = (i.data.weaponType || {}).value || 'melee';
                attacks[weaponType].items.push(i);
            };
        }

        actorData.attacks = attacks;
    }


    npcIsElite() {
        const actorData = duplicate(this.actor.data);
        let traits = getProperty(actorData.data, 'traits.traits.value') || [];
        for (const trait of traits) {
            if (trait == 'elite') return true;
        }
        return false;
    }

    npcIsMinion() {
        const actorData = duplicate(this.actor.data);
        let traits = getProperty(actorData.data, 'traits.traits.value') || [];
        for (const trait of traits) {
            if  (trait == 'minion') return true;
        }
        return false;
    }
}

export default ActorSheetConan2d20NPC;
