import Conan2d20Actor from '../actor';
import Conan2d20Item from '../../item/item';
import { TraitSelector } from '../../system/trait-selector';

abstract class ActorSheetConan2d20 extends ActorSheet<Conan2d20Actor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            scrollY: [
                '.skills-pane',
                '.character-pane',
                '.talents-pane',
                '.inventory-pane'
            ]
        });
    }

    // Return the type of the current actor
    get actorType() {
        return this.actor.data.type;
    }

    // Add some extra data when rendering sheet to reduce logic in html template
    getData() {
        const sheetData : any = super.getData();

        // Update Attribute Scores
        console.log(sheetData.data);
        if (sheetData.data.attributes !== undefined) {
            for ( let [a, atr] of Object.entries(sheetData.data.attributes as Record<any, any>)) {
                atr.label = CONFIG.CONAN.attributes[a];
            }
        }

        // Update skill labels
        if (sheetData.data.skills !== undefined) {
            for (let [s, skl] of Object.entries(sheetData.data.skills as Record<any, any>)) {
                skl.attribute = sheetData.data.attributes[skl.attribute].label.substring(0, 3);
                skl.label = CONFIG.CONAN.skills[s];
            }
        }

        // Update traits
        sheetData.attributes = CONFIG.CONAN.attributes;
        sheetData.skills = CONFIG.CONAN.skills;

        this._prepareItems(sheetData.actor);

        this._prepareBackgrounds(sheetData.actor);

        return sheetData;
    }

    abstract _prepareItems(actor: Conan2d20Actor): void;

    _prepareBackgrounds(background: any) {
        if ( background.archetype == undefined ) return;

        const map = {
            homeland: CONFIG.CONAN.backgroundHomeland,
            caste: CONFIG.CONAN.backgroundCaste,
            archetype: CONFIG.CONAN.backgroundArchetype,
        };
        
        for (const [t, choices] of Object.entries(map)) {
            const bground = background[t] || { value: [], selected: []}; 

            if (Array.isArray(bground)) {
                (bground as any).selected = {};
                for (const entry of bground) {
                    if (typeof entry === 'object') {
                        if ('exceptions' in entry && entry.exceptions != "") {
                            (bground as any).selected[entry.type] = `${choices[entry.type]} (${entry.value}) [${entry.exceptions}]`;
                        } else {
                            let text = `${choices[entry.type]}`;
                            if (entry.value !== "")
                                text = `${text} (${entry.value})`;
                                (bground as any).selected[entry.type] = text;
                        }
                    } else {
                        (bground as any).selected[entry] = choices[entry] || `${entry}`;
                    }
                }
            } else if (bground.value) {
                bground.selected = bground.value.reduce((obj: any, t: any) => {
                    obj[t] = choices[t];
                    return obj
                }, {});
            }

            if (bground.custom) bground.selected.custom = bground.custom;
        }
    }

    activateListeners(html: any) {
        super.activateListeners(html);

        // Pad field width
        html.find('[data-wpad]').each((i, e) => {
            const text = e.tagName === 'INPUT' ? e.value : e.innerText;
            const w = text.length * parseInt(e.getAttribute('data-wpad')) / 2;
            e.setAttribute('style', `flex: 0 0 ${w}px`);
        });

         // TODO: Add expandable item summaries
         // html.find('.item .item-name h4').click((event) => {
         //    this._onItemSummary(event);
         // });
        
        
        // Toggle equip
        html.find('.item-toggle-equip').click((ev) => {
          const f = $(ev.currentTarget);
          const itemId = f.parents('.item').attr('data-item-id');
          const active = f.hasClass('active');
          this.actor.updateEmbeddedEntity('OwnedItem', { _id: itemId, 'data.equipped.value': !active });
    
        });

        // Trait Selector
        html.find('.trait-selector').click((ev) => this._onTraitSelector(ev));

        html.find('.item-create').click((ev) => this._onItemCreate(ev));

        html.find('.item-edit').click((ev) => {
            const itemId = $(ev.currentTarget).parents('.item').attr('data-item-id');
            const Item = CONFIG.Item.entityClass;

            const item = new Item(this.actor.getOwnedItem(itemId).data, { actor: this.actor });
            item.sheet.render(true)
        });

        // Delete Inventory Item
        html.find('.item-delete').click((ev) => this._onItemDelete(ev));
    }

    _onTraitSelector(event) {
        event.preventDefault();
        const a = $(event.currentTarget);
        const options = {
          name: a.parents('li').attr('for'),
          title: a.parent().text().trim(),
          choices: CONFIG.CONAN[a.attr('data-options')],
          has_values: (a.attr('data-has-values') === 'true'),
          allow_empty_values: (a.attr('data-allow-empty-values') === 'true'),
          has_exceptions: (a.attr('data-has-exceptions') === 'true'),
        };
        new TraitSelector(this.actor, options).render(true);
    }

    _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const data = duplicate(header.dataset);
    
        data.name = `New ${data.type.capitalize()}`;
        // this.actor.createOwnedItem(data, {renderSheet: true});
        this.actor.createEmbeddedEntity('OwnedItem', data);
    }

    _onItemDelete(event) {
        const li = $(event.currentTarget).parents('.item');
        const itemId = li.attr('data-item-id');
        const item = new Item(this.actor.getOwnedItem(itemId).data, { actor: this.actor });

        console.log(itemId);
        console.log(item);

        renderTemplate('systems/conan2d20/templates/actors/delete-item-dialog.html', {name: item.name}).then((html) => {
            new Dialog({
                title: 'Confirm Deletion',
                content: html,
                buttons: { 
                    Yes: {
                        icon: '<i class="fa fa-check"></i>',
                        label: 'Yes',
                        callback: async () => {
                            await this.actor.deleteOwnedItem(itemId);
                            li.slideUp(200, () => this.render(false));
                        },
                    },
                    Cancel: {
                        icon: '<i class="fa fa-times"></i>',
                        label: 'Cancel',
                    },
                },
                default: 'Yes',
            }).render(true);
        });
    }

}

export default ActorSheetConan2d20;
