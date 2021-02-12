import Conan2d20Actor from '../actor';
import Conan2d20Item from '../../item/item';
import Conan2d20Dice from '../../system/rolls';
import TraitSelector from '../../system/trait-selector';
import C2Utility from '../../../scripts/utility';

abstract class ActorSheetConan2d20 extends ActorSheet<Conan2d20Actor> {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      scrollY: [
        '.sheet-sidebar',
        '.skills-pane',
        '.character-pane',
        '.talents-pane',
        '.inventory-pane',
        '.actions-pane',
        '.sheet-body',
      ],
    });
  }

  // Add some extra data when rendering sheet to reduce logic in html template
  getData() {
    const sheetData: any = super.getData();

    // Update Attribute labels
    if (sheetData.data.attributes !== undefined) {
      for (const [a, atr] of Object.entries(
        sheetData.data.attributes as Record<any, any>
      )) {
        atr.label = CONFIG.CONAN.attributes[a];
        atr.title = CONFIG.CONAN.attributeTitles[a];
      }
    }

    // Update Skills and Attributes
    sheetData.attributes = CONFIG.CONAN.attributes;
    sheetData.natures = CONFIG.CONAN.naturesTypes;
    sheetData.languages = CONFIG.CONAN.languages;
    sheetData.conditions = CONFIG.CONAN.conditionTypes;

    this._prepareItems(sheetData.actor);
    this.addConditionData(sheetData);

    return sheetData;
  }

  abstract _prepareItems(actor: Conan2d20Actor): void;

  activateListeners(html: any) {
    super.activateListeners(html);

    // Pad field width
    html.find('[data-wpad]').each((i, e) => {
      const text = e.tagName === 'INPUT' ? e.value : e.innerText;
      const w = (text.length * parseInt(e.getAttribute('data-wpad'), 10)) / 2;
      e.setAttribute('style', `flex: 0 0 ${w}px`);
    });

    // Item summaries
    html.find('.item .item-name h4').click(event => {
      this._onItemSummary(event);
    });

    html
      .find('[data-item-id].item .item-image-inventory')
      .click(event => this._onPostItem(event));
    html.find('item-image-inventory').click(event => this._onPostItem(event));

    // Toggle equip
    html.find('.item-toggle-equip').click(ev => {
      const f = $(ev.currentTarget);
      const itemId = f.parents('.item').attr('data-item-id');
      const active = f.hasClass('active');
      this.actor.updateEmbeddedEntity('OwnedItem', {
        _id: itemId,
        'data.equipped': !active,
      });
    });

    html.find('.item-toggle-broken').click(ev => {
      const f = $(ev.currentTarget);
      const itemId = f.parents('.item').attr('data-item-id');
      const active = f.hasClass('active');
      this.actor.updateEmbeddedEntity('OwnedItem', {
        _id: itemId,
        'data.broken': !active,
      });
    });

    html.find('.trait-selector').click(ev => this._onTraitSelector(ev));

    html.find('.item-create').click(ev => this._onItemCreate(ev));

    html.find('.item-edit').click(ev => {
      const itemId = $(ev.currentTarget).parents('.item').attr('data-item-id');
      const Item = CONFIG.Item.entityClass;

      const item = new Item(this.actor.getOwnedItem(itemId).data, {
        actor: this.actor,
      });
      item.sheet.render(true);
    });

    html.find('.add-gold').click(event => {
      const updateActorData = {};
      updateActorData['data.resources.gold.value'] =
        this.actor.data.data.resources.gold.value + 1;
      this.actor.update(updateActorData);
    });

    html.find('.subtract-gold').click(event => {
      const updateActorData = {};
      if (this.actor.data.data.resources.gold.value <= 0) {
        return;
      }
      updateActorData['data.resources.gold.value'] =
        this.actor.data.data.resources.gold.value - 1;
      this.actor.update(updateActorData);
    });

    html.find('.consumable-increase').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getOwnedItem(itemId).data;
      this.actor.updateEmbeddedEntity('OwnedItem', {
        _id: itemId,
        'data.uses.value': Number(item.data.uses.value) + 1,
      });
    });

    html.find('.consumable-decrease').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getOwnedItem(itemId).data;
      if (Number(item.data.uses.value) > 0) {
        this.actor.updateEmbeddedEntity('OwnedItem', {
          _id: itemId,
          'data.uses.value': Number(item.data.uses.value) - 1,
        });
      }
    });
    html.find('.mount-increase-pass').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getOwnedItem(itemId).data;
      this.actor.updateEmbeddedEntity('OwnedItem', {
        _id: itemId,
        'data.passengers.current': Number(item.data.passengers.current) + 1,
      });
    });

    html.find('.mount-decrease-pass').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getOwnedItem(itemId).data;
      if (Number(item.data.passengers.current) > 0) {
        this.actor.updateEmbeddedEntity('OwnedItem', {
          _id: itemId,
          'data.passengers.current': Number(item.data.passengers.current) - 1,
        });
      }
    });
    html.find('.item-increase-quantity').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getOwnedItem(itemId).data;
      this.actor.updateEmbeddedEntity('OwnedItem', {
        _id: itemId,
        'data.quantity': Number(item.data.quantity) + 1,
      });
    });

    html.find('.item-decrease-quantity').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getOwnedItem(itemId).data;
      if (Number(item.data.quantity) > 0) {
        this.actor.updateEmbeddedEntity('OwnedItem', {
          _id: itemId,
          'data.quantity': Number(item.data.quantity) - 1,
        });
      }
    });

    html.find('.item-delete').click(ev => this._onItemDelete(ev));

    html.find('.skill-name.rollable').click(async ev => {
      const actorData = duplicate(this.actor);
      const skill = $(ev.currentTarget)
        .parents('.skill-entry-name')
        .attr('data-skill');
      const {dialogData, cardData, rollData} = this.actor.setupSkill(
        skill,
        actorData.type
      );
      await Conan2d20Dice.showSkillRollDialog({
        dialogData,
        cardData,
        rollData,
        actorData,
      });
    });

    html.find('.fa-dice-d20.rollable').click(async ev => {
      const actorData = duplicate(this.actor);
      const skill = $(ev.currentTarget)
        .parents('.skill-entry-tab-roll')
        .attr('data-skill');
      const {dialogData, cardData, rollData} = this.actor.setupSkill(
        skill,
        actorData.type
      );
      await Conan2d20Dice.showSkillRollDialog({
        dialogData,
        cardData,
        rollData,
        actorData,
      });
    });

    html
      .find('.wounds')
      .on('click contextmenu', this._onClickWounded.bind(this));
  }

  _onClickWounded(event) {
    event.preventDefault();
    const field = $(event.currentTarget).parent().attr('data-target');
    const icon = $(event.currentTarget).attr('data-target');

    const actorData = duplicate(this.actor);
    const dot = getProperty(actorData, field);

    if (event.type === 'click') {
      if (dot === 'healed') {
        setProperty(actorData, field, 'treated');
        setProperty(actorData, icon, 'fas fa-star-of-life');
      } else if (dot === 'treated') {
        setProperty(actorData, field, 'wounded');
        setProperty(actorData, icon, 'fas fa-skull');
      } else {
        setProperty(actorData, field, 'wounded');
        setProperty(actorData, icon, 'fas fa-skull');
      }
    } else if (event.type === 'contextmenu') {
      if (dot === 'wounded') {
        setProperty(actorData, field, 'treated');
        setProperty(actorData, icon, 'fas fa-star-of-life');
      } else if (dot === 'treated') {
        setProperty(actorData, field, 'healed');
        setProperty(actorData, icon, 'far fa-circle');
      } else {
        setProperty(actorData, field, 'healed');
        setProperty(actorData, icon, 'far fa-circle');
      }
    }
    this.actor.update(actorData);
  }

  addConditionData(data) {
    data.conditions = duplicate(game.conan2d20.config.statusEffects);

    for (const condition of data.conditions) {
      const existing = this.actor.data.effects.find(
        e => e.flags.core.statusId === condition.id
      );
      if (existing) {
        condition.value = existing.flags.conan2d20.value;
        condition.existing = true;
      } else {
        condition.value = 0;
      }

      if (condition.flags.conan2d20.value == null) {
        condition.boolean = true;
      }
    }
  }

  _onTraitSelector(event) {
    event.preventDefault();
    const a = $(event.currentTarget);
    const options = {
      name: a.parents('li').attr('for'),
      title: a.parent().parent().siblings('h4').text().trim(),
      choices: CONFIG.CONAN[a.attr('data-options')],
      has_values: a.attr('data-has-values') === 'true',
      allow_empty_values: a.attr('data-allow-empty-values') === 'true',
      has_exceptions: a.attr('data-has-exceptions') === 'true',
    };
    new TraitSelector(this.actor, options).render(true);
  }

  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const data = duplicate(header.dataset);
    if (data.type === 'talent') {
      data.name = `New ${data.talentType.capitalize()} ${data.type.capitalize()}`;
      mergeObject(data, {'data.talentType': data.talentType});
    } else if (data.type === 'action') {
      data.name = `New ${data.actionType.capitalize()}`;
      mergeObject(data, {'data.actionType': data.actionType});
    } else if (data.type === 'npcaction') {
      if (data.actionType === 'doom') {
        data.name = `New ${game.i18n.localize('CONAN.doomSpendHeader')}`;
      } else if (data.actionType === 'abilities') {
        data.name = `New ${game.i18n
          .localize('CONAN.specialAbilityHeader')
          .capitalize()}`;
      }
      mergeObject(data, {'data.actionType': data.actionType});
    } else if (data.type === 'npcattack') {
      data.name = `New ${game.i18n
        .localize('CONAN.attackHeader')
        .capitalize()}`;
      mergeObject(data, {'data.actionType': data.actionType});
    } else {
      data.name = `New ${data.type.capitalize()}`;
    }
    this.actor.createEmbeddedEntity('OwnedItem', data);
  }

  _onItemDelete(event) {
    const li = $(event.currentTarget).parents('.item');
    const itemId = li.attr('data-item-id');
    const item = new Item(this.actor.getOwnedItem(itemId).data, {
      actor: this.actor,
    });

    renderTemplate(
      'systems/conan2d20/templates/actors/delete-item-dialog.html',
      {name: item.name}
    ).then(html => {
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

  _onPostItem(event) {
    event.preventDefault();

    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.getOwnedItem(itemId);
    // @ts-ignore
    item.postItem(event);
  }

  _onItemSummary(event) {
    event.preventDefault();
    const localize = game.i18n.localize.bind(game.i18n);
    const li = $(event.currentTarget).parent().parent();
    const itemId = li.attr('data-item-id');
    const actionIndex = li.attr('data-action-index');
    let item: Conan2d20Item;

    try {
      // @ts-ignore
      item = this.actor.getOwnedItem(itemId);
      if (!item.type) return;
    } catch (err) {
      return;
    }

    // Toggle summary
    if (li.hasClass('expanded')) {
      const summary = li.children('.item-summary');
      summary.slideUp(200, () => summary.remove());
    } else {
      let div;
      const chatData = item.getChatData({secrets: this.actor.owner});
      if (!actionIndex) {
        div = $(
          `<div class="item-summary"><div class="item-description">${chatData.description.value}</div></div>`
        );
      } else {
        const flavor = C2Utility.getAttackDescription(item.data).description;
        div = $(
          `<div class="item-summary"><div class="item-description">${localize(
            flavor
          )}</div></div>`
        );
      }
      const details = $('<div class="item-details"></div>');
      const props = $('<div class="item-properties tags"></div>');

      if (chatData.itemDetails) {
        chatData.itemDetails.forEach(p => {
          const concat = `<div class="chat-item-detail"><b>${localize(
            p.label
          )}:</b> ${localize(p.detail)} </div>`;
          details.append(concat);
        });
        div.append(details);
      }
      div.append('</br>');
      if (chatData.properties) {
        chatData.properties
          .filter(p => typeof p === 'string')
          .forEach(p => {
            props.append(
              `<span class="tag tag_secondary">${localize(p)}</span>`
            );
          });
      }
      div.append(props);
      // append qualities (only style the tags if they contain description data)
      if (chatData.qualities && chatData.qualities.length) {
        chatData.qualities.forEach(p => {
          if (p.description) {
            props.append(
              `<span class="tag" title="${localize(p.description)}">${localize(
                p.label
              )}</span>`
            );
          } else {
            props.append(
              `<span class="tag tag_alt">${localize(p.label)}</span>`
            );
          }
        });
      }

      const buttons = $('<div class="item-buttons"></div>');
      switch (item.data.type) {
        case 'action':
          if (chatData.weapon.value) {
            if (chatData.weapon.value) {
              buttons.append(
                `<button class="tag weapon_damage" data-action="weaponDamage">${localize(
                  'CONAN.damageRollLabel'
                )}</button>`
              );
            }
          }
          break;
        case 'weapon':
          buttons.append(
            `<button class="tag weapon_damage execute-attack" data-action="weaponAttack">${localize(
              'CONAN.attackRollLabel'
            )}</button>`
          );
          buttons.append(
            `<button class="tag weapon_damage execute-damage" data-action="weaponDamage">${localize(
              'CONAN.damageRollLabel'
            )}</button>`
          );
          break;
        case 'display':
          buttons.append(
            `<button class="tag weapon_damage execute-attack" data-action="weaponAttack">${localize(
              'CONAN.attackRollLabel'
            )}</button>`
          );
          buttons.append(
            `<button class="tag display_damage execute-damage" data-action="weaponDamage">${localize(
              'CONAN.damageRollLabel'
            )}</button>`
          );
          break;
        case 'kit':
          if (chatData.hasCharges)
            buttons.append(
              `<span class="tag"><button class="consume" data-action="consume">${localize(
                'CONAN.kitUseLabel'
              )} ${item.name}</button></span>`
            );
          break;
        case 'npcattack':
          buttons.append(
            `<button class="tag npc_damage execute-attack" data-action="npcDamage">${localize(
              'CONAN.damageRollLabel'
            )}</button>`
          );
          break;
        default:
          break;
      }

      div.append(buttons);

      buttons.find('button').click(ev => {
        ev.preventDefault();
        ev.stopPropagation();

        // which function gets called depends on the type of button stored in the dataset attribute action
        switch (ev.target.dataset.action) {
          case 'toggleHands': {
            if (item.data.type === 'weapon') {
              item.data.data.hands.value = !item.data.data.hands.value;
              this.actor.updateEmbeddedEntity('OwnedItem', item.data);
              this._render();
            }
            break;
          }
          case 'weaponDamage': {
            this._executeDamage(ev, itemId);
            break;
          }
          case 'weaponAttack': {
            this._executeAttack(ev, itemId);
            break;
          }
          case 'npcDamage': {
            ev.preventDefault();
            ev.stopPropagation();
            const actorData = duplicate(this.actor);
            const weapon = duplicate(this.actor.getOwnedItem(itemId));
            const {dialogData, cardData, rollData} = this.actor.setupWeapon(
              weapon
            );
            Conan2d20Dice.showDamageRollDialog({
              dialogData,
              cardData,
              rollData,
              actorData,
            });
            break;
          }
          default:
            break;
        }
      });

      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass('expanded');
  }

  _executeAttack(ev, itemId) {
    ev.preventDefault();
    ev.stopPropagation();
    const actorData = duplicate(this.actor);
    const weapon = duplicate(this.actor.getOwnedItem(itemId));

    let weaponSkill;
    if (weapon.data.weaponType === 'melee') {
      weaponSkill = 'mel';
    } else if (weapon.data.weaponType === 'ranged') {
      weaponSkill = 'ran';
    } else if (weapon.type === 'display') {
      weaponSkill = weapon.data.skill;
    }

    const {dialogData, cardData, rollData} = this.actor.setupSkill(
      weaponSkill,
      actorData.type
    );

    Conan2d20Dice.showSkillRollDialog({
      dialogData,
      cardData,
      rollData,
      actorData,
    });
  }

  _executeDamage(ev, itemId) {
    ev.preventDefault();
    ev.stopPropagation();
    const actorData = duplicate(this.actor);
    const weapon = duplicate(this.actor.getOwnedItem(itemId));
    const reloadIds = this.actor.data.items
      .filter(i => i.data.kitType === 'reload')
      .map(i => ({id: i._id, name: i.name} || []));
    const {dialogData, cardData, rollData} = this.actor.setupWeapon(
      weapon,
      reloadIds
    );
    Conan2d20Dice.showDamageRollDialog({
      dialogData,
      cardData,
      rollData,
      actorData,
    });
  }

  /* eslint-disable-next-line consistent-return */
  _onDrop(ev) {
    const dropData = JSON.parse(ev.dataTransfer.getData('text/plain'));
    if (dropData.type === 'item-drag') {
      return this.actor.createEmbeddedEntity('OwnedItem', dropData.payload);
    }
    return super._onDrop(ev);
  }
}

export default ActorSheetConan2d20;
