import TraitSelector from '../system/trait-selector';

export default class ItemSheetConan2d20 extends ItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    mergeObject(options, {
      classes: options.classes.concat(['conan2d20', 'item', 'sheet']),
      width: 630,
      height: 500,
      template: 'systems/conan2d20/templates/items/item-sheet.html',
      resizable: false,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
    return options;
  }

  /**
   * Override header buttons to add custom ones.
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Add "Post to chat" button
    buttons = [
      {
        label: 'Post',
        class: 'post',
        icon: 'fas fa-comment',
        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        onclick: ev => this.item.postItem(ev),
      },
    ].concat(buttons);
    return buttons;
  }

  /* -------------------------------------------- */

  /**
   * Prepare item sheet data
   * Start with the base item data and extending with additional properties for rendering.
   */
  getData() {
    const data: any = super.getData();
    const updatedData = this?.actor?.items?.get(this?.entity?.id)?.data;
    if (updatedData) {
      data.item = updatedData;
      data.data = updatedData.data;
    }
    data.attributes = CONFIG.CONAN.attributes;

    const {type} = this.item;
    mergeObject(data, {
      type,
      hasSidebar: true,
      sidebarTemplate: () =>
        `systems/conan2d20/templates/items/${type}-sidebar.html`,
      hasDetails: [
        'weapon',
        'armor',
        'talent',
        'kit',
        'action',
        'display',
        'enchantment',
        'npcattack',
        'npcaction',
        'transportation',
      ].includes(type),
      detailsTemplate: () =>
        `systems/conan2d20/templates/items/${type}-details.html`,
    });

    data.availability = CONFIG.CONAN.availabilityTypes;

    if (type === 'armor') {
      data.armorTypes = CONFIG.CONAN.armorTypes;
      data.coverageTypes = CONFIG.CONAN.coverageTypes;
      data.armorQualities = CONFIG.CONAN.armorQualities;
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

      this._prepareQualities(CONFIG.CONAN.weaponQualities);
    } else if (type === 'npcattack') {
      data.hasSidebar = false;
      data.attackTypes = CONFIG.CONAN.npcAttackTypes;
      data.weaponQualities = CONFIG.CONAN.weaponQualities;
      data.weaponRanges = CONFIG.CONAN.weaponRanges;
      data.weaponReaches = CONFIG.CONAN.weaponReaches;
      data.damageDice = CONFIG.CONAN.damageDice;
      data.weaponDamage = CONFIG.CONAN.weaponDamage;
      data.damageTypes = CONFIG.CONAN.damageTypes;

      this._prepareQualities(CONFIG.CONAN.weaponQualities);
    } else if (type === 'talent') {
      data.talentSkills = CONFIG.CONAN.skills;
      data.talentTypes = CONFIG.CONAN.talentTypes;
      data.talentActionTypes = CONFIG.CONAN.actionTypes;
      data.categories = CONFIG.CONAN.actionCategories;
      data.rankMax = data.data.rank.max;

      data.talentTags = [data.data.rank.value].filter(t => !!t);
    } else if (type === 'transportation') {
      data.categories = CONFIG.CONAN.transpoCategories;
      data.capabilities = CONFIG.CONAN.transpoCapabilities;
      data.animals = CONFIG.CONAN.transpoAnimals;
      data.mountType = CONFIG.CONAN.transpoMountTypes;
      data.cartType = CONFIG.CONAN.transpoCartTypes;
      data.boatType = CONFIG.CONAN.transpoBoatTypes;
    } else if (type === 'display') {
      data.displaySkills = CONFIG.CONAN.skills;
      data.displayRanges = CONFIG.CONAN.weaponRanges;
      data.displayQualities = CONFIG.CONAN.weaponQualities;
      const displayDice = mergeObject(
        CONFIG.CONAN.damageDice,
        CONFIG.CONAN.displayDamageDice
      );
      data.damageDice = displayDice;

      this._prepareQualities(CONFIG.CONAN.weaponQualities);
    } else if (type === 'action') {
      const actorWeapons = [];
      if (this.actor) {
        for (const i of this.actor.data.items) {
          if (i.type === 'weapon') actorWeapons.push(i);
        }
      }

      // TODO add function to get action img
      // const actionType = data.data.actionType.value || 'action';
      // data.item.img = this._getActionImg(actionType);
      data.weapons = actorWeapons;
      data.actionCounts = CONFIG.CONAN.actionCounts;
      data.actionTypes = CONFIG.CONAN.actionTypes;
      data.actionCategories = CONFIG.CONAN.actionCategories;
      // TODO generate action tags
      // data.actionTags = [data.data.qualities.value].filter(t => !!t);
    } else if (type === 'enchantment') {
      data.hasSidebar = false;
      data.enchantmentTypes = CONFIG.CONAN.enchantmentTypes;
      data.enchantmentStrengths = CONFIG.CONAN.enchantmentStrengths;
      data.blindingStrengths = CONFIG.CONAN.enchantmentBlindingStrengths;
      data.enchantmentEffects = CONFIG.CONAN.weaponQualities;
      data.explodingItems = CONFIG.CONAN.enchantmentExplodingItems;
      data.volatilities = CONFIG.CONAN.enchantmentVolatilities;
      data.difficulty = CONFIG.CONAN.availabilityTypes;
      data.damageDice = CONFIG.CONAN.damageDice;
      data.ingredient = CONFIG.CONAN.enchantmentIngredients;
      data.hitLocations = CONFIG.CONAN.coverageTypes;
      data.upasGlassSizes = CONFIG.CONAN.upasGlassSizes;
      data.talismanTypes = CONFIG.CONAN.enchantmentTalismanTypes;
      data.lotusPollenColors = CONFIG.CONAN.lotusPollenColors;
      data.lotusPollenForms = CONFIG.CONAN.lotusPollenForms;
      data.lotusPollenUses = CONFIG.CONAN.lotusPollenUses;
    } else if (type === 'spell') {
      data.difficulty = CONFIG.CONAN.availabilityTypes;
      data.hasSidebar = false;
    } else if (type === 'npcaction') {
      data.hasSidebar = false;
      data.actionTypes = CONFIG.CONAN.npcActionTypes;
    } else if (type === 'kit') {
      data.kitSkills = CONFIG.CONAN.skills;
      data.kitTypes = CONFIG.CONAN.kitTypes;
      data.uses = CONFIG.CONAN.kitUses;
      data.encumbrance = CONFIG.CONAN.encumbranceTypes;
    }
    return data;
  }

  onTraitSelector(event) {
    event.preventDefault();
    const a = $(event.currentTarget);
    const options = {
      name: a.parents('label').attr('for'),
      title: a.parent().text().trim(),
      choices: CONFIG.CONAN[a.attr('data-options')],
      has_values: a.attr('data-has-values') === 'true',
      allow_empty_values: a.attr('data-allow-empty-values') === 'true',
    };
    new TraitSelector(this.item, options).render(true);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // save checkbox changes
    html.find('input[type="checkbox"]').change(event => this._onSubmit(event));

    // activate trait selector
    html.find('.trait-selector').click(ev => this.onTraitSelector(ev));

    // add row to spell momentum spends
    html.find('.spend-row-add').click(ev => this.insertSpendRow(ev));

    // add row to spell alternate effects
    html.find('.alt-row-add').click(ev => this.insertAltRow(ev));

    // delete row from spell alternate effects
    html.find('.alt-row-delete').click(ev => this.deleteAltRow(ev));

    // delete row from spell momentum spends
    html.find('.spend-row-delete').click(ev => this.deleteSpendRow(ev));
  }

  _prepareQualities(traits) {
    if (traits === undefined) return;

    for (const [t, choices] of Object.entries(traits)) {
      const trait = traits[t] || {value: [], selected: []};

      if (Array.isArray(trait)) {
        // @ts-ignore
        (trait as any).selected = {};
        for (const entry of trait) {
          if (typeof entry === 'object') {
            let text = `${choices[entry.type]}`;
            if (entry.value !== '') text = `${text} (${entry.value})`;
            (trait as any).selected[entry.type] = text;
          } else {
            (trait as any).selected[entry] = choices[entry] || `${entry}`;
          }
        }
      } else if (trait.value) {
        trait.selected = trait.value.reduce((obj, b) => {
          obj[b] = choices[b];
          return obj;
        }, {});
      }

      if (trait.custom) trait.selected.custom = trait.custom;
    }
  }

  _onChangeInput(event) {
    return this._onSubmit(event);
  }

  insertSpendRow(_event) {
    try {
      const table = document.getElementById('spellSpends') as HTMLTableElement;
      const itemId = this.item.data._id;
      const index = table.rows.length - 1;
      const key = `data.effects.momentum.${[index + 1]}`;
      this.item.update(
        {_id: itemId, [key]: {type: '', difficulty: '', effect: ''}},
        null
      );
    } catch (e) {
      alert(e);
    }
  }

  insertAltRow(_event) {
    try {
      const table = document.getElementById('altEffects') as HTMLTableElement;
      const itemId = this.item.data._id;
      const index = table.rows.length - 1;
      const key = `data.effects.alternative.${[index + 1]}`;
      this.item.update(
        {_id: itemId, [key]: {type: '', difficulty: '', effect: ''}},
        null
      );
    } catch (e) {
      alert(e);
    }
  }

  deleteAltRow(_event) {
    try {
      const table = document.getElementById('altEffects') as HTMLTableElement;
      const toDelete = table.rows.length - 1;
      const key = `data.effects.alternative.-=${[toDelete]}`;
      this.item.update({[key]: null}, null);
    } catch (e) {
      alert(e);
    }
  }

  deleteSpendRow(_event) {
    try {
      const table = document.getElementById('spellSpends') as HTMLTableElement;
      const toDelete = table.rows.length - 1;
      const key = `data.effects.momentum.-=${[toDelete]}`;
      this.item.update({[key]: null}, null);
    } catch (e) {
      alert(e);
    }
  }
}
