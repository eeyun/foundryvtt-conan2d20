import { TraitSelector } from  '../system/trait-selector';

export class ItemSheetConan2d20 extends ItemSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
	    options.width = 630;
	    options.height = 560;
	    options.classes = options.classes.concat(['conan2d20', 'item']);
	    options.template = 'systems/conan2d20/templates/items/item-sheet.html';
	    options.tabs = [{
	      navSelector: ".tabs",
	      contentSelector: ".sheet-body",
	      initial: "description"
	    }];
	    options.resizable = false;
	    return options;
    }
	  /* -------------------------------------------- */
	
	  /**
	   * Prepare item sheet data
	   * Start with the base item data and extending with additional properties for rendering.
	   */
	
	
    getData() {
        var _this$item$data, _this$item$data$data, _this$item$data$data$;	
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
            hasDetails: ['weapon', 'equipment', 'talent', 'kit'],
            detailsTemplate: () => `systems/conan2d20/templates/items/${type}-details.html`
        });

        data.availability = CONFIG.CONAN.availabilityTypes;
        data.encumbrance = CONFIG.CONAN.encumbranceTypes;

        if (type === 'equipment') {
            data.armorTypes = CONFIG.CONAN.armorTypes;
            data.coverageTypes = CONFIG.CONAN.coverageTypes;
            data.equipmentQualities = CONFIG.CONAN.equipmentQualities;
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
        html.find('.trait-selector').click(ev => this.onTraitSelector(ev));
    }
}
