import { TraitSelector } from  '../system/trait-selector';

export class ItemSheetConan2d20 extends ItemSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
	    mergeObject(options, {
	        classes: options.classes.concat(['conan2d20', 'item', 'sheet']),
            width:  630,
	        height: 560,
            template: 'systems/conan2d20/templates/items/item-sheet.html',
            resizable: false,
	        tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
        });
	    return options;
    }

	/* -------------------------------------------- */
	
    /**
	* Prepare item sheet data
	* Start with the base item data and extending with additional properties for rendering.
	*/
    getData() {
        const data: any = super.getData();
        const updatedData = this?.actor?.items?.get(this?.entity?.id)?.data
        if(updatedData){
            data.item = updatedData
            data.data = updatedData.data
        }
        data.attributes = CONFIG.CONAN.attributes;

        const { type } = this.item;
        mergeObject(data, {
            type,
            hasSidebar: true,
            sidebarTemplate: () => `systems/conan2d20/templates/items/${type}-sidebar.html`,
            hasDetails: ['weapon', 'equipment', 'talent', 'kit'].includes(type),
            detailsTemplate: () => `systems/conan2d20/templates/items/${type}-details.html`
        });

        data.availability = CONFIG.CONAN.availabilityTypes;

        if (type === 'equipment') {
            data.armorTypes = CONFIG.CONAN.armorTypes;
            data.coverageTypes = CONFIG.CONAN.coverageTypes;
            data.equipmentQualities = CONFIG.CONAN.equipmentQualities;
            data.encumbrance = CONFIG.CONAN.encumbranceTypes;
        } else if (type === 'weapon') {
            data.weaponQualities = CONFIG.CONAN.weaponQualities;
            data.weaponTypes = CONFIG.CONAN.weaponTypes;
            data.weaponSizes = CONFIG.CONAN.weaponSizes;
            data.weaponGroups = CONFIG.CONAN.weaponGroups;
            data.weaponRanges = CONFIG.CONAN.weaponRanges;
            data.weaponReaches = CONFIG.CONAN.weaponReaches;
            data.damageDice = CONFIG.CONAN.damageDice;
            data.weaponDamage = CONFIG.CONAN.weaponDamage;
            data.encumbrance = CONFIG.CONAN.encumbranceTypes;

           // this._prepareQualities(data.data.qualities, CONFIG.CONAN.weaponQualities);
        } else if (type === 'talent') {
            data.talentTypes = CONFIG.CONAN.skills;
            data.talentActionTypes = CONFIG.CONAN.actionTypes;
            data.categories = CONFIG.CONAN.actionCategories;
            data.rankMax = data.data.rank.max;
            data.talentTags = [data.data.rank.value].filter(t => !!t);
        }
        return data;
    }

    onTraitSelector(event) {
        event.preventDefault();
        const a = $(event.currentTarget);
        const options = {
            name: a.parents('label').attr('for'),
            title: a.parent().text().trim(),
            choices: CONFIG.CONAN[a.attr('data-options')]
        };
        new TraitSelector(this.item, options).render(true);
    }

    activateListeners(html) {
        super.activateListeners(html);

        // save checkbox changes
        html.find('input[type="checkbox"]').change(event => this._onSubmit(event));

        // activate trait selector
        html.find('.trait-selector').click(ev => this.onTraitSelector(ev));
    }

    _prepareQualities(qualities, choices) {
        if (qualities.selected) {
            qualities.selected = qualities.value.reduce((obj, t) => {
                obj[t] = choices[t];
                return obj;
            }, {});
        } else {
            qualities.selected = [];
        }
        if (qualities.custom) qualities.selected.custom = qualities.custom;
    }

    _onChangeInput(event) {
        return this._onSubmit(event);                                                
    }
}
