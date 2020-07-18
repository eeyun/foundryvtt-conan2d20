import Conan2d20Actor from '../actor';
import Conan2d20Item from '../../item/item';
import {Conan2d20Dice} from '../../system/rolls';
import { TraitSelector } from '../../system/trait-selector';

abstract class ActorSheetConan2d20 extends ActorSheet<Conan2d20Actor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            scrollY: [
                '.sheet-sidebar',
                '.skills-pane',
                '.character-pane',
                '.talents-pane',
                '.inventory-pane',
                '.actions-pane'
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

        // Update Skills and Attributes
        sheetData.attributes = CONFIG.CONAN.attributes;
        sheetData.skills = CONFIG.CONAN.skills;
        sheetData.natures = CONFIG.CONAN.naturesTypes;
        sheetData.languages = CONFIG.CONAN.languages;

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
        
        
        // Toggle equip
        html.find('.item-toggle-equip').click((ev) => {
          const f = $(ev.currentTarget);
          const itemId = f.parents('.item').attr('data-item-id');
          const active = f.hasClass('active');
          this.actor.updateEmbeddedEntity('OwnedItem', { _id: itemId, 'data.equipped.value': !active });
        });

        html.find('.item-toggle-broken').click((ev) => {
            const f = $(ev.currentTarget);
            const itemId = f.parents('.item').attr('data-item-id');
            const active = f.hasClass('active');
            this.actor.updateEmbeddedEntity('OwnedItem', { _id: itemId, 'data.broken.value': !active });
          });
      
        html.find('.trait-selector').click((ev) => this._onTraitSelector(ev));

        html.find('.item-create').click((ev) => this._onItemCreate(ev));

        html.find('.item-edit').click((ev) => {
            const itemId = $(ev.currentTarget).parents('.item').attr('data-item-id');
            const Item = CONFIG.Item.entityClass;

            const item = new Item(this.actor.getOwnedItem(itemId).data, { actor: this.actor });
            item.sheet.render(true)
        });

        html.find('.item-increase-quantity').click((event) => {
            const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
            const item = this.actor.getOwnedItem(itemId).data;
            this.actor.updateEmbeddedEntity('OwnedItem', { _id: itemId, 'data.quantity': Number(item.data.quantity) + 1 });
        });

        html.find('.item-decrease-quantity').click((event) => {
            const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
            const item = this.actor.getOwnedItem(itemId).data;
            if (Number(item.data.quantity) > 0) {
                this.actor.updateEmbeddedEntity('OwnedItem', { _id: itemId, 'data.quantity': Number(item.data.quantity) - 1 });
            }
        });
  
        html.find('.item-delete').click((ev) => this._onItemDelete(ev));

        html.find('.wounds').click(ev => {
            let actorData = duplicate(this.actor)
            let index = Number($(ev.currentTarget).attr("data-index"));
            let target = $(ev.currentTarget).parents(".dots-row").attr("data-target")
        
            let value = getProperty(actorData, target)
            if (value == index + 1)
              setProperty(actorData, target, index)
            else 
              setProperty(actorData, target, index + 1)

            let woundElement = $(ev.currentTarget).parents(".health");
            if(woundElement.length)
            {
                if (getProperty(actorData, target) <= 0)
                setProperty(actorData, target, 1)
            }
            this.actor.update(actorData);
        });

        html.find(".skill-name.rollable").click(async ev => {
            let actorData = duplicate(this.actor)
            let skill = $(ev.currentTarget).parents(".skill").attr("data-skill")
            let {dialogData, cardData, rollData} = this.actor.setupSkill(skill)
            await Conan2d20Dice.showSkillRollDialog({dialogData, cardData, rollData, actorData})
        });

        html.find('.attacks-list [data-action-index]').on('click', '.action-name', (event) => {
            $(event.currentTarget).parents('.expandable').toggleClass('expanded');
        });

        html.find('.attacks-list .execute-attack').click(async ev => {
            ev.preventDefault();
            ev.stopPropagation();
            let actorData = duplicate(this.actor).data
            const attackIndex = $(ev.currentTarget).parents('[data-action-index]').attr('data-action-index');
            const itemId = this.actor.data.data.actions[Number(attackIndex)]?.attack.id;
            // @ts-ignore
            let weapon = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId, true));
            let {dialogData, cardData, rollData} = this.actor.setupWeapon(weapon);
            await Conan2d20Dice.showDamageRollDialog({dialogData, cardData, rollData, actorData})
        });
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

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @private
     */
    _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const data = duplicate(header.dataset);

        if (data.type === 'talent') {
        	data.name = `New ${data.featTalent.capitalize()} ${data.type.capitalize()}`;
        	mergeObject(data, { 'data.talentType.value': data.talentType });
        } else if (data.type === 'action') {
        	data.name = `New ${data.actionType.capitalize()}`;
        	mergeObject(data, { 'data.actionType.value': data.actionType });
        } else {
        	data.name = `New ${data.type.capitalize()}`;
        }
        // this.actor.createOwnedItem(data, {renderSheet: true});
        this.actor.createEmbeddedEntity('OwnedItem', data);
    }


    _onItemDelete(event) {
        const li = $(event.currentTarget).parents('.item');
        const itemId = li.attr('data-item-id');
        const item = new Item(this.actor.getOwnedItem(itemId).data, { actor: this.actor });

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

    /**
   * Thank you to PF2 for this code. Saved us so much time.
   * Handle clicking of stat levels. The max level is by default 4.
   * The max level can be set in the hidden input field with a data-max attribute. Eg: data-max="3"
   * @private
   */
  _onClickStatLevel(event) {
    event.preventDefault();
    const field = $(event.currentTarget).siblings('input[type="hidden"]');
    const max = (field.data('max')==undefined) ? 5 : field.data('max');

    // Get the current level and the array of levels
    const level = parseFloat(field.val()+'');
    let newLevel;

    // Toggle next level - forward on click, backwards on right
    if (event.type === 'click') {
      newLevel = Math.clamped( (level + 1) , 0, max );
    } else if (event.type === 'contextmenu') {
      newLevel = Math.clamped( (level - 1) , 0, max );
    }
    // Update the field value and save the form

    field.val(newLevel);
    this._onSubmit(event);
  }

}

export default ActorSheetConan2d20;
