import ActorSheetConan2d20 from './base';

class ActorSheetConan2d20NPC extends ActorSheetConan2d20 {
    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            classes: options.classes.concat(["conan2d20", "actor", "npc-sheet"]),
            width: 450,
            heigth: 680,
            scrollY: [
                'sheet-sidebar'
            ]
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

        // Update expertise fields labels
        if (sheetData.data.skills !== undefined) {
            for (let [s, skl] of Object.entries(sheetData.data.skills as Record<any, any>)) {
                skl.label = CONFIG.CONAN.expertiseFields[s];
            }
        }

        /* if (sheetData.flags.conan2d20_updatednpcsheet === undefined) sheetData.flags.conan2d20_updatednpcsheet = {};
        if (sheetData.flags.conan2d20_updatednpcsheet.editNPC === undefined) sheetData.flags.conan2d20_updatednpcsheet.editNPC = { value: false };
        if (sheetData.flags.conan2d20_updatednpcsheet.allSaveDetail === undefined) sheetData.flags.conan2d20_updatednpcsheet.allSaveDetail = { value: '' };

        sheetData.npcMinionActive = this.npcIsMinion()?' active':'';
        sheetData.npcToughenedActive = this.npcIsToughened()?' active':'';
        sheetData.npcNemesiActive = this.npcIsNemesis()?' active':'';
        */ 

        sheetData.skills = CONFIG.CONAN.expertiseFields;
        console.log(sheetData);
        return sheetData;
    }

    _prepareItems(actorData) {
        const attacks = { 
            npcattack: { label: 'NPC Attack', items: [] }
        };


        // Get Attacks
        for (const i of actorData.items) {
            i.img = i.img || CONST.DEFAULT_TOKEN;

            if (Object.keys(attacks).includes(i.type))
            {
                if (i.type == 'npcattack')
                {
                    let item;                                                                
                    try {
                        item = this.actor.getOwnedItem(i._id);
                        i.chatData = item.getChatData({ secrets: this.actor.owner });
                    }
                    catch (err)
                    {
                        console.log(`Conan 2D20 System | NPC Sheet | Could not load item ${i.name}`)
                    }
                    attacks[i.type].items.push(i);
                }
            };
        }
        actorData.attacks = attacks;
    }

    npcIsNemesis() {
        const actorData = duplicate(this.actor.data);
        const traits = getProperty(actorData.data, 'traits.traits.value') || [];
        for (const trait of traits) {
            if (trait == 'nemesis') return true;
        }
        return false;
    }

    npcIsMinion() {
        const actorData = duplicate(this.actor.data);
        const traits = getProperty(actorData.data, 'traits.traits.value') || [];
        for (const trait of traits) {
            if  (trait == 'minion') return true;
        }
        return false;
    }

    npcIsToughened() {
        const actorData = duplicate(this.actor.data);
        const traits = getProperty(actorData.data, 'traits.traits.value') || [];
        for (const trait of traits) {
            if  (trait == 'toughened') return true;
        }
        return false;
    }
}

export default ActorSheetConan2d20NPC;
