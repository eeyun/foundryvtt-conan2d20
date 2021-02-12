import Conan2d20Actor from '../actor/actor';

export default class Conan2d20Item extends Item {
  prepareData() {
    super.prepareData();
    const item = this.data;
  }

  public async postItem(event) {
    const template = `systems/conan2d20/templates/chat/${this.data.type}-card.html`;
    if (!this.actor) return;
    const {token} = this.actor;
    const nearestItem = event ? event.currentTarget.closest('.item') : {};
    const contextualData = nearestItem.dataset || {};
    const templateData = {
      actor: this.actor,
      tokenId: token ? `${token.scene._id}.${token.id}` : null,
      item: this.data,
      data: this.getChatData(undefined, contextualData),
    };

    const chatData: any = {
      user: game.user._id,
      speaker: {
        actor: this.actor._id,
        token: this.actor.token,
        alias: this.actor.name,
      },
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    };

    chatData.content = await renderTemplate(template, templateData);

    ChatMessage.create(chatData, {displaySheet: false}).then(msg => {
      msg.setFlag('conan2d20', 'itemData', this.data);
    });
  }

  getChatData(htmlOptions?, postOptions?: any) {
    const itemType = this.data.type;
    const data = this[`_${itemType}ChatData`](postOptions);
    if (data) {
      data.description.value = TextEditor.enrichHTML(
        data.description.value,
        htmlOptions
      );
    }
    return data;
  }

  /* -------------------------------------------- */

  _actionChatData() {
    if (this.data.type !== 'action') {
      throw new Error(
        'tried to create an action chat data for a non-action item'
      );
    }

    const data: any = duplicate(this.data.data);

    let associatedWeapon = null;
    if (data.weapon.value)
      associatedWeapon = this.actor.getOwnedItem(data.weapon.value);

    const props = [
      CONFIG.CONAN.actionTypes[data.actionType],
      CONFIG.CONAN.actionCounts[data.actionCount],
      CONFIG.CONAN.actionCategories[data.actionCategory],
      associatedWeapon ? associatedWeapon.name : null,
    ];

    data.properties = props.filter(p => p);

    return data;
  }

  _enchantmentChatData() {
    if (this.data.type !== 'enchantment') {
      throw new Error('tried to create a spell chat data for a non-spell item');
    }

    const data: any = duplicate(this.data.data);
    const effects = data.effects.value;
    const properties = [];
    const details = [];

    const qualities = [];
    if ((effects || []).length !== 0) {
      let effectsObject;
      for (let i = 0; i < effects.length; i += 1) {
        if (effects[i].value) {
          effectsObject = {
            label:
              `${effects[i].label} ${effects[i].value}` ||
              effects[i].label.charAt(0).toUpperCase() +
                effects[i].label.slice(1),
            description:
              CONFIG.CONAN.qualitiesDescriptions[
                effects[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        } else {
          effectsObject = {
            label:
              CONFIG.CONAN.weaponQualities[effects[i].label] ||
              effects[i].label.charAt(0).toUpperCase() +
                effects[i].label.slice(1),
            description:
              CONFIG.CONAN.qualitiesDescriptions[
                effects[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        }
        qualities.push(effectsObject);
      }
    }
    const enchantmentType = {
      label: 'CONAN.enchantmentTypeLabel',
      detail: CONFIG.CONAN.enchantmentTypes[data.enchantmentType],
    };
    details.push(enchantmentType);
    if (enchantmentType.detail === 'Exploding Powder') {
      const enchantmentDamage = {
        label: 'CONAN.enchantmentDamageLabel',
        detail: CONFIG.CONAN.damageDice[data.damage.dice],
      };
      const enchantmentItem = {
        label: 'CONAN.enchantmentItemLabel',
        detail:
          CONFIG.CONAN.enchantmentExplodingItems[data.traits.explodingItem],
      };
      const enchantmentStrength = {
        label: 'CONAN.enchantmentStrengthLabel',
        detail: CONFIG.CONAN.enchantmentStrengths[data.traits.strength],
      };
      details.push(enchantmentItem);
      details.push(enchantmentDamage);
      details.push(enchantmentStrength);
    } else if (enchantmentType.detail === 'Blinding Powder') {
      const enchantmentDamage = {
        label: 'CONAN.enchantmentDamageLabel',
        detail: CONFIG.CONAN.damageDice[data.damage.dice],
      };
      const enchantmentStrength = {
        label: 'CONAN.enchantmentStrengthLabel',
        detail: CONFIG.CONAN.enchantmentBlindingStrengths[data.traits.strength],
      };
      details.push(enchantmentStrength);
      details.push(enchantmentDamage);
    } else if (enchantmentType.detail === 'Burning Liquid') {
      const enchantmentDamage = {
        label: 'CONAN.enchantmentDamageLabel',
        detail: CONFIG.CONAN.damageDice[data.damage.dice],
      };
      const enchantmentStrength = {
        label: 'CONAN.enchantmentVolatilityLabel',
        detail: CONFIG.CONAN.enchantmentVolatilities[data.traits.volatility],
      };
      details.push(enchantmentDamage);
      details.push(enchantmentStrength);
    } else if (enchantmentType.detail === 'Reinforced Fabric') {
      const enchantmentIngredients = {
        label: 'CONAN.enchantmentIngredientsLabel',
        detail: CONFIG.CONAN.enchantmentIngredients[data.traits.ingredients],
      };
      const localize = game.i18n.localize.bind(game.i18n);
      if ((data.damage.hitLocation || []).length !== 0) {
        for (let i = 0; i < data.damage.hitLocation.value.length; i += 1) {
          properties.push(
            `${data.damage.hitLocation.value[i]} ${localize(
              'CONAN.coverageLabel'
            )}`
          );
        }
      }
      data.properties = properties.filter(p => p !== null);
      details.push(enchantmentIngredients);
    } else if (enchantmentType.detail === 'Upas-Glass') {
      const enchantmentCover = {
        label: 'CONAN.enchantmentCoverLabel',
        detail: CONFIG.CONAN.damageDice[data.damage.dice],
      };
      const enchantmentSize = {
        label: 'CONAN.upasGlassSizeLabel',
        detail: CONFIG.CONAN.upasGlassSizes[data.traits.size],
      };
      details.push(enchantmentSize);
      details.push(enchantmentCover);
    } else if (enchantmentType.detail === 'Talisman') {
      const talismanHindrance = {
        label: 'CONAN.enchantmentHindranceLabel',
        detail: data.traits.hindrance,
      };
      const talismanType = {
        label: 'CONAN.enchantmentTalismanLabel',
        detail: CONFIG.CONAN.enchantmentTalismanTypes[data.traits.talismanType],
      };
      details.push(talismanHindrance);
      details.push(talismanType);
    } else {
      const enchantmentUse = {
        label: 'CONAN.lotusPollenUseLabel',
        detail: CONFIG.CONAN.lotusPollenUses[data.traits.lotusPollenUse],
      };
      const enchantmentColor = {
        label: 'CONAN.lotusPollenColorLabel',
        detail: CONFIG.CONAN.lotusPollenColors[data.traits.lotusPollenColor],
      };
      const enchantmentForm = {
        label: 'CONAN.lotusPollenFormLabel',
        detail: CONFIG.CONAN.lotusPollenForms[data.traits.lotusPollenForm],
      };
      details.push(enchantmentUse);
      details.push(enchantmentColor);
      details.push(enchantmentForm);
    }

    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);

    return data;
  }

  _spellChatData() {
    if (this.data.type !== 'spell') {
      throw new Error('tried to create a spell chat data for a non-spell item');
    }

    const data: any = duplicate(this.data.data);
    const details = [];

    if (data.difficulty.includes) {
      const difficultyIncludes = {
        label: 'CONAN.difficultyIncludesLabel',
        detail: data.difficulty.includes,
      };
      details.push(difficultyIncludes);
    }

    if (data.duration) {
      const duration = {
        label: 'CONAN.spellDurationLabel',
        detail: data.duration,
      };
      details.push(duration);
    }

    if (data.cost) {
      const cost = {
        label: 'CONAN.spellCostLabel',
        detail: data.cost,
      };
      details.push(cost);
    }

    if (data.notes) {
      const notes = {
        label: 'CONAN.spellNotesHeader',
        detail: data.notes,
      };
      details.push(notes);
    }

    data.itemDetails = details.filter(p => p !== null);

    return data;
  }

  _armorChatData() {
    if (this.data.type !== 'armor') {
      throw new Error(
        'tried to create an armor chat data for a non-armor item'
      );
    }

    const localize = game.i18n.localize.bind(game.i18n);
    const data: any = duplicate(this.data.data);
    const qualities = [];
    if ((data.qualities.value || []).length !== 0) {
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        const qualitiesObject = {
          label:
            CONFIG.armorQualities[data.qualities.value[i]] ||
            data.qualities.value[i].charAt(0).toUpperCase() +
              data.qualities.value[i].slice(1),
          description:
            CONFIG.qualitiesDescriptions[data.qualities.value[i]] || '',
        };
        qualities.push(qualitiesObject);
      }
    }
    const properties = [
      `${localize(CONFIG.CONAN.armorTypes[data.armorType])}`,
      `${data.soak || 0} ${localize('CONAN.armorSoakLabel')}`,
      data.equipped ? localize('CONAN.armorEquippedLabel') : null,
    ];
    if ((data.coverage.value || []).length !== 0) {
      for (let i = 0; i < data.coverage.value.length; i += 1) {
        properties.push(
          `${data.coverage.value[i]} ${localize('CONAN.coverageLabel')}`
        );
      }
    }
    data.properties = properties.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);
    return data;
  }

  _kitChatData() {
    if (this.data.type !== 'kit') {
      throw new Error('tried to create a kit chat data for a non-kit item');
    }

    const localize = game.i18n.localize.bind(game.i18n);
    const data: any = duplicate(this.data.data);
    data.kitTypeString = CONFIG.kitTypes[data.kitType];
    data.properties = [
      data.kitTypeString,
      `${data.uses.value}/${data.uses.max} ${localize('CONAN.kitUsesLabel')}`,
    ];
    data.hasCharges = data.uses.value >= 0;
    return data;
  }

  _transportationChatData() {
    if (this.data.type !== 'transportation') {
      throw new Error(
        'tried to create a transportation chat data for a non-transpo item'
      );
    }

    const details = [];
    const localize = game.i18n.localize.bind(game.i18n);
    const data: any = duplicate(this.data.data);

    if (data.category) {
      const category = {
        label: 'CONAN.transpoCategoryLabel',
        detail: CONFIG.CONAN.transpoCategories[data.category],
      };
      details.push(category);
    }
    if (data.transpoType) {
      let ttype;
      if (data.category === 'mounts') {
        ttype = {
          label: 'CONAN.transpoTypeLabel',
          detail: CONFIG.CONAN.transpoMountTypes[data.transpoType],
        };
      } else if (data.category === 'carts') {
        ttype = {
          label: 'CONAN.transpoTypeLabel',
          detail: CONFIG.CONAN.transpoCartTypes[data.transpoType],
        };
      } else {
        ttype = {
          label: 'CONAN.transpoTypeLabel',
          detail: CONFIG.CONAN.transpoBoatTypes[data.transpoType],
        };
      }
      details.push(ttype);
    }
    if (data.passengers.capacity) {
      const capacity = {
        label: 'CONAN.transpoPassengerCapLabel',
        detail: String(data.passengers.capacity),
      };
      details.push(capacity);
    }
    if (data.capabilities !== '') {
      const capabilities = {
        label: 'CONAN.transpoCapabilitiesLabel',
        detail: CONFIG.CONAN.transpoCapabilities[data.capabilities],
      };
      details.push(capabilities);
    }
    if (data.animals !== '') {
      const animals = {
        label: 'CONAN.transpoAnimalsLabel',
        detail: CONFIG.CONAN.transpoAnimals[data.animals],
      };
      details.push(animals);
    }

    data.itemDetails = details.filter(p => p !== null);

    return data;
  }

  _talentChatData() {
    if (this.data.type !== 'talent') {
      throw new Error(
        'tried to create a talent chat data for a non-talent item'
      );
    }

    const data: any = duplicate(this.data.data);
    const details = [];

    const props = [
      `Rank ${data.rank.value || 0}`,
      CONFIG.CONAN.skills[data.skill],
      data.actionType ? CONFIG.CONAN.actionTypes[data.actionType] : null,
    ];

    data.properties = props.filter(p => p);

    if (data.prerequisites) {
      const prereqs = {
        label: 'CONAN.talentRequiresLabel',
        detail: data.prerequisites,
      };
      details.push(prereqs);
    }

    const qualities = [];
    if ((data.qualities || []).length !== 0) {
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        const qualitiesObject = {
          label:
            CONFIG.CONAN.talentQualities[data.qualities.value[i]] ||
            data.qualities.value[i].charAt(0).toUpperCase() +
              data.qualities.value[i].slice(1),
          description:
            CONFIG.CONAN.qualitiesDescriptions[data.qualities.value[i]] || '',
        };
        qualities.push(qualitiesObject);
      }
    }
    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => p);
    return data;
  }

  _weaponChatData() {
    const data: any = duplicate(this.data.data);
    const qualities = [];
    const properties = [];
    const details = [];

    if (this.data.type !== 'weapon') {
      throw new Error(
        'tried to create a weapon chat data for a non-weapon item'
      );
    }

    if ((data.qualities.value || []).length !== 0) {
      let qualitiesObject;
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        if (data.qualities.value[i].value) {
          qualitiesObject = {
            label:
              `${data.qualities.value[i].label} ${data.qualities.value[i].value}` ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.CONAN.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        } else {
          qualitiesObject = {
            label:
              CONFIG.CONAN.weaponQualities[data.qualities.value[i].label] ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.CONAN.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        }
        qualities.push(qualitiesObject);
      }
    }

    const weaponGroup = {
      label: 'CONAN.groupLabel',
      detail: CONFIG.CONAN.weaponGroups[data.group],
    };
    details.push(weaponGroup);

    const weaponDamage = {
      label: 'CONAN.baseDamageLabel',
      detail: CONFIG.CONAN.damageDice[data.damage.dice],
    };
    details.push(weaponDamage);

    let weaponRange: any;
    if (data.weaponType === 'ranged') {
      weaponRange = {
        label: 'CONAN.rangeLabel',
        detail: CONFIG.CONAN.weaponRanges[data.range],
      };
    } else {
      weaponRange = {
        label: 'CONAN.reachLabel',
        detail: CONFIG.CONAN.weaponReaches[data.range],
      };
    }
    details.push(weaponRange);

    if (data.size) {
      properties.push(CONFIG.CONAN.weaponSizes[data.size]);
    }

    data.properties = properties.filter(p => !!p);
    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);

    return data;
  }

  _npcattackChatData() {
    const data: any = duplicate(this.data.data);
    const qualities = [];
    const details = [];

    if (this.data.type !== 'npcattack') {
      throw new Error(
        'tried to create an NPC Attack chat data for an incorrect item'
      );
    }

    if ((data.qualities.value || []).length !== 0) {
      let qualitiesObject;
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        if (data.qualities.value[i].value) {
          qualitiesObject = {
            label:
              `${data.qualities.value[i].label} ${data.qualities.value[i].value}` ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.CONAN.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        } else {
          qualitiesObject = {
            label:
              CONFIG.CONAN.weaponQualities[data.qualities.value[i].label] ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.CONAN.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        }
        qualities.push(qualitiesObject);
      }
    }

    const attackDamage = {
      label: 'CONAN.damageLabel',
      detail: CONFIG.CONAN.damageDice[data.damage.dice],
    };
    details.push(attackDamage);

    let attackRange: any;
    if (data.attackType === 'ranged') {
      attackRange = {
        label: 'CONAN.rangeLabel',
        detail: CONFIG.CONAN.weaponRanges[data.range],
      };
    } else if (data.attackType === 'threaten') {
      attackRange = {
        label: 'CONAN.rangeLabel',
        detail: CONFIG.CONAN.weaponRanges[data.range],
      };
    } else {
      attackRange = {
        label: 'CONAN.reachLabel',
        detail: CONFIG.CONAN.weaponReaches[data.range],
      };
    }
    details.push(attackRange);

    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);

    return data;
  }

  _miscellaneousChatData() {
    if (this.data.type !== 'miscellaneous') {
      throw new Error(
        'tried to create an npcaction chat data for a non-npcaction item'
      );
    }
    const data: any = duplicate(this.data.data);
    return data;
  }

  _npcactionChatData() {
    if (this.data.type !== 'npcaction') {
      throw new Error(
        'tried to create an npcaction chat data for a non-npcaction item'
      );
    }

    const data: any = duplicate(this.data.data);
    const ad = this.actor.data.data;

    const props = [CONFIG.CONAN.npcActionTypes[data.actionType]];

    data.properties = props.filter(p => p);

    return data;
  }

  _displayChatData() {
    const data: any = duplicate(this.data.data);
    const qualities = [];
    const properties = [];
    const details = [];

    if (this.data.type !== 'display') {
      throw new Error(
        'tried to create a display chat data for a non-display item'
      );
    }

    if ((data.qualities.value || []).length !== 0) {
      let qualitiesObject;
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        if (data.qualities.value[i].value) {
          qualitiesObject = {
            label:
              `${data.qualities.value[i].label} ${data.qualities.value[i].value}` ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.CONAN.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        } else {
          qualitiesObject = {
            label:
              CONFIG.CONAN.weaponQualities[data.qualities.value[i].label] ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.CONAN.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        }
        qualities.push(qualitiesObject);
      }
    }

    const displaySkill = {
      label: 'CONAN.displaySkillLabel',
      detail: CONFIG.CONAN.skills[data.skill],
    };
    details.push(displaySkill);

    const displayDamage = {
      label: 'CONAN.baseDamageLabel',
      detail: CONFIG.CONAN.damageDice[data.damage.dice],
    };
    details.push(displayDamage);

    const displayRange = {
      label: 'CONAN.rangeLabel',
      detail: CONFIG.CONAN.weaponRanges[data.range],
    };
    details.push(displayRange);

    data.properties = properties.filter(p => !!p);
    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);

    return data;
  }
}
