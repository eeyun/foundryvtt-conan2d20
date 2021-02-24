import ConanChat from './chat';
import {CONFIG} from '../../scripts/config';
import Conan2d20Actor from '../actor/actor';

export default class Conan2d20Dice {
  /**
   * Reference:
   * @param {number} diceQty          Number of d20 to roll
   * @param {number} tn               The Skill + Attribute to roll under
   * @param {number} focus            The Focus value to roll under for extra successes
   * @param {number} autoSuccess      How many successed to add
   * @param {boolean} trained         Is the skill trained, adds 19 to generate complications if not
   * @param {number} difficulty       Difficulty level of the skill check
   * @param {any} cardData            Data for rendering a chat message on completed roll
   */
  static async calculateSkillRoll(
    diceQty: number,
    tn: number,
    focus = 0,
    trained = false,
    difficulty = 0,
    autoSuccess?: number,
    cardData?: any,
    fixedrolls?: any
  ) {
    const rollErr = {
      diceQty:
        'Conan 2D20 | Error in Skill Check, D20 Quantity is not a Number.',
      tn: 'Conan 2D20 | Error in Skill Check, Target Number is not a Number.',
      focus: 'Conan 2D20 | Error in Skill Check, Focus is not a Number.',
      auto:
        'Conan 2D20 | Error in Skill Check, Automatic Successes is not a Number.',
      train: 'Conan 2D20 | Error in Skill Check, Trained is not a Boolean.',
    };
    if (Number.isNaN(diceQty)) {
      throw rollErr.diceQty;
    }
    if (Number.isNaN(tn)) {
      throw rollErr.tn;
    }
    if (Number.isNaN(focus)) {
      throw rollErr.focus;
    }
    if (Number.isNaN(autoSuccess)) {
      throw rollErr.auto;
    }
    if (typeof trained !== 'boolean') {
      throw rollErr.train;
    }

    let rollResult = {};
    let successes = 0;
    let crits = 0;
    let momentumGenerated = 0;
    let complications = 0;
    let rolls = [];
    let rollInstance;
    let reroll = false;
    let result;

    if (diceQty === 0) {
      rolls = [];
    } else {
      rollInstance = new Roll(`${diceQty}d20`);
      rolls = rollInstance.roll().terms[0].results;
      if (game.dice3d)
        await Conan2d20Dice.showDiceSoNice(
          rollInstance,
          game.settings.get('core', 'rollMode')
        );
    }

    let i;
    if (autoSuccess !== undefined && autoSuccess > 0) {
      for (i = 0; i < autoSuccess; i += 1) {
        const successRoll = {result: 1};
        rolls.push(successRoll);
      }
    } else if (fixedrolls !== undefined) {
      for (i = 0; i < fixedrolls.length; i += 1) {
        const mergeRoll = {result: fixedrolls[i]};
        rolls.push(mergeRoll);
      }

      reroll = true;
    }

    rolls.forEach(r => {
      if (!trained) {
        if (r.result === 19 || r.result === 20) complications += 1;
      } else if (r.result === 20) {
        complications += 1;
      }
      if (r.result <= focus) {
        crits += 1;
      } else if (r.result <= tn) {
        successes += 1;
      }
    });

    successes += crits * 2;

    if (difficulty > 0) {
      if (successes >= difficulty) {
        momentumGenerated = successes - difficulty;
        result = 'success';
      } else {
        result = 'failure';
      }
    }

    const rollData = {
      tn,
      focus: focus || 0,
      trained,
      reroll,
    };

    rollResult = {
      difficulty,
      successes,
      complications,
      momentumGenerated,
      result,
      rolls,
    };
    ConanChat.renderRollCard(rollResult, rollData, cardData, 'skill');
  }

  static async calculateDamageRoll(
    diceQty: Number = 1,
    damageType: any,
    cardData: any,
    fixedrolls?: any
  ) {
    const damageRollInstance = new Roll(`${diceQty}dp`);
    // @ts-ignore
    const damageRolls = damageRollInstance.roll().terms[0].resultValues;
    if (game.dice3d)
      await Conan2d20Dice.showDiceSoNice(
        damageRollInstance,
        game.settings.get('core', 'rollMode')
      );

    let reroll = false;
    let damage: number = damageRollInstance.total;
    let effects: number = damageRollInstance.terms.reduce((total, term) => {
      return (
        total +
        // @ts-ignore
        term.results.reduce((inners, result) => {
          return inners + (result.effect ? 1 : 0);
        }, 0)
      );
    }, 0);
    let hitLocation: any;

    let i;
    if (fixedrolls !== undefined) {
      for (i = 0; i < fixedrolls.length; i += 1) {
        // @ts-ignore
        if (Number.isNumeric(fixedrolls[i]))
          damage += parseInt(fixedrolls[i], 10);
        else if (fixedrolls[i].includes('img')) {
          effects += 1;
          damage += 1;
        }
        damageRolls.push(fixedrolls[i]);
      }
      reroll = true;
    }

    const locationRollInstance = new Roll('1d20');
    // @ts-ignore
    const locationRolls = locationRollInstance.roll().terms[0].results;

    locationRolls.forEach(r => {
      // @ts-ignore
      if (r.result >= 1 && r.result <= 2) {
        hitLocation = CONFIG.coverageTypes.head;
      } else if (r.result >= 3 && r.result <= 5) {
        hitLocation = CONFIG.coverageTypes.rarm;
      } else if (r.result >= 6 && r.result <= 8) {
        hitLocation = CONFIG.coverageTypes.larm;
      } else if (r.result >= 9 && r.result <= 14) {
        hitLocation = CONFIG.coverageTypes.torso;
      } else if (r.result >= 15 && r.result <= 17) {
        hitLocation = CONFIG.coverageTypes.rleg;
      } else {
        hitLocation = CONFIG.coverageTypes.lleg;
      }
    });

    const rollData = {
      reroll,
    };

    const rollResult = {
      damage,
      damageType,
      effects,
      damageRolls,
      hitLocation,
    };

    ConanChat.renderRollCard(rollResult, rollData, cardData, 'damage');
  }

  static async generateDamageRoll(
    rollData: any,
    cardData: any,
    actorData: any
  ) {
    const generatorErr = {
      reload:
        'Conan 2D20 | Error in Damage Roll, you must enter a number of reloads to spend',
      resource:
        'Conan 2D20 | Error in Damage Roll, you must select a Reload to spend',
    };

    if (rollData.reloadItem !== '' && rollData.reloadModifier < 1) {
      throw generatorErr.reload;
    } else if (rollData.reloadModifier > 0 && rollData.reloadItem === '') {
      throw generatorErr.resource;
    }

    let baseDamage;
    if (rollData.optionalBaseDmg > 0) {
      baseDamage = Number(rollData.optionalBaseDmg);
    } else {
      baseDamage = Number(rollData.extra.weapon.data.damage.dice || 1);
    }
    const {attackerType} = rollData;
    const damageType = rollData.extra.weapon.data.damage.type;
    let diceQty =
      baseDamage +
      rollData.talentModifier +
      rollData.reloadModifier +
      rollData.otherModifier;

    if (rollData.momentumModifier > 0) {
      try {
        if (attackerType === 'npc') {
          Conan2d20Actor.spendDoom(rollData.momentumModifier);
        } else {
          Conan2d20Actor.spendMomentum(rollData.momentumModifier);
        }
        diceQty += rollData.momentumModifier;
        if (rollData.reloadModifier > 0) {
          try {
            Conan2d20Actor.spendReload(
              actorData,
              rollData.reloadModifier,
              rollData.reloadItem
            );
            diceQty += rollData.reloadModifier;
            await this.calculateDamageRoll(diceQty, damageType, cardData);
          } catch (e) {
            console.log(e);
            ui.notifications.error(e);
          }
        } else {
          await this.calculateDamageRoll(diceQty, damageType, cardData);
        }
      } catch (e) {
        console.log(e);
        ui.notifications.error(e);
      }
    } else if (rollData.reloadModifier > 0) {
      try {
        Conan2d20Actor.spendReload(
          actorData,
          rollData.reloadModifier,
          rollData.reloadItem
        );
        diceQty += rollData.reloadModifier;
        await this.calculateDamageRoll(diceQty, damageType, cardData);
      } catch (e) {
        console.log(e);
        ui.notifications.error(e);
      }
    } else {
      await this.calculateDamageRoll(diceQty, damageType, cardData);
    }
  }

  static async generateSkillRoll(
    baseDice = 2,
    rollData: any,
    cardData: any,
    actorData: any
  ) {
    // TODO: Wire in momentum expenditure check
    const generatorErr = {
      resource:
        'Conan 2D20 | Error in Skill Check, you must select a resource spend',
      res_count:
        'Conan 2D20 | Error in Skill Check, you must enter a number of resources to spend',
      bonus_count: 'Selection would be greater than 3 Bonus Dice. Not allowed.',
    };
    if (rollData.diceModifier > 0 && rollData.diceModifierType === '') {
      throw generatorErr.resource;
    } else if (
      rollData.diceModifierType !== '' &&
      rollData.diceModifier === 0
    ) {
      throw generatorErr.res_count;
    }
    if (baseDice + rollData.diceModifier > 5) {
      throw generatorErr.bonus_count;
    } else if (rollData.diceModifier + rollData.successModifier > 3) {
      throw generatorErr.bonus_count;
    }

    let trained = false;
    let diceQty;
    let doomSpend;

    if (actorData.type === 'npc') {
      const expertise = actorData.data.attributes[rollData.npcAttributes].value;
      const tn = rollData.skill.value + expertise;
      diceQty = baseDice;
      if (rollData.successModifier > 0) {
        doomSpend = rollData.diceModifier + rollData.successModifier * 3;
      }
      if (rollData.diceModifier > 0 || doomSpend > 0) {
        try {
          Conan2d20Actor.spendDoom(doomSpend);
          diceQty += rollData.diceModifier;
          await this.calculateSkillRoll(
            diceQty,
            tn,
            rollData.skill.value,
            trained,
            rollData.difficulty,
            rollData.successModifier,
            cardData,
            undefined
          );
        } catch (e) {
          console.log(e);
          ui.notifications.error(e);
        }
      } else {
        try {
          await this.calculateSkillRoll(
            diceQty,
            tn,
            rollData.skill.value,
            trained,
            rollData.difficulty,
            rollData.successModifier,
            cardData,
            undefined
          );
        } catch (e) {
          console.log(e);
          ui.notifications.error(e);
        }
      }
    } else {
      if (rollData.skill.trained > 0) {
        trained = true;
      }
      diceQty = baseDice;
      if (rollData.diceModifier > 0) {
        try {
          if (rollData.diceModifierType === 'momentum') {
            Conan2d20Actor.spendMomentum(rollData.diceModifier);
            diceQty += rollData.diceModifier;
          } else if (rollData.diceModifierType === 'doom') {
            Conan2d20Actor.addDoom(rollData.diceModifier);
            diceQty += rollData.diceModifier;
          }
          if (rollData.successModifier > 0) {
            try {
              Conan2d20Actor.spendFortune(actorData, rollData.successModifier);
              await this.showFortuneSpendDialog(
                diceQty,
                rollData.skill.tn.value,
                rollData.skill.focus.value,
                trained,
                rollData.difficulty,
                rollData.successModifier,
                cardData
              );
            } catch (e) {
              console.log(e);
              ui.notifications.error(e);
            }
          } else {
            await this.calculateSkillRoll(
              diceQty,
              rollData.skill.tn.value,
              rollData.skill.focus.value,
              trained,
              rollData.difficulty,
              rollData.successModifier,
              cardData,
              undefined
            );
          }
        } catch (e) {
          console.log(e);
          ui.notifications.error(e);
        }
      } else if (rollData.successModifier > 0) {
        try {
          Conan2d20Actor.spendFortune(actorData, rollData.successModifier);
          await this.showFortuneSpendDialog(
            diceQty,
            rollData.skill.tn.value,
            rollData.skill.focus.value,
            trained,
            rollData.difficulty,
            rollData.successModifier,
            cardData
          );
        } catch (e) {
          console.log(e);
          ui.notifications.error(e);
        }
      } else {
        await this.calculateSkillRoll(
          diceQty,
          rollData.skill.tn.value,
          rollData.skill.focus.value,
          trained,
          rollData.difficulty,
          rollData.successModifier,
          cardData,
          undefined
        );
      }
    }
  }

  static async showFortuneSpendDialog(
    diceQty: number,
    tn: number,
    focus = 0,
    trained = false,
    difficulty = 0,
    autoSuccess = 0,
    cardData: any
  ) {
    let dialogData;
    const template =
      'systems/conan2d20/templates/apps/fortune-roll-dialogue.html';
    return renderTemplate(template, dialogData).then(html => {
      new Dialog({
        content: html,
        title: game.i18n.localize('CONAN.rollRemainingLabel'),
        buttons: {
          yes: {
            label: game.i18n.localize('CONAN.rollYesLabel'),
            callback: () =>
              this.calculateSkillRoll(
                diceQty,
                tn,
                focus,
                trained,
                difficulty,
                autoSuccess,
                cardData,
                undefined
              ),
          },
          no: {
            label: game.i18n.localize('CONAN.rollNoLabel'),
            callback: () =>
              this.calculateSkillRoll(
                0,
                tn,
                focus,
                trained,
                difficulty,
                autoSuccess,
                cardData,
                undefined
              ),
          },
        },
        default: 'yes',
      }).render(true);
    });
  }

  static async showDamageRollDialog({
    dialogData,
    rollData,
    cardData,
    actorData,
  }) {
    return renderTemplate(
      'systems/conan2d20/templates/apps/damage-roll-dialogue.html',
      dialogData
    ).then(html => {
      new Dialog(
        {
          content: html,
          title: dialogData.title,
          buttons: {
            roll: {
              label: game.i18n.localize('CONAN.rollDamageLabel'),
              callback: async template => {
                rollData.optionalBaseDmg = Number(
                  // @ts-ignore
                  template.find('[name="baseDamage"]').val() || 0
                );
                rollData.attackType = Number(
                  // @ts-ignore
                  template.find('[name="attackType"]').val() || 0
                );
                rollData.momentumModifier = Number(
                  // @ts-ignore
                  template.find('[name="momentumModifier"]').val() || 0
                );
                rollData.reloadModifier = Number(
                  // @ts-ignore
                  template.find('[name="reloadModifier"]').val() || 0
                );
                rollData.reloadItem =
                  // @ts-ignore
                  template.find('[name="reloadItem"]').val() || '';
                rollData.talentModifier = Number(
                  // @ts-ignore
                  template.find('[name="talentModifier"]').val() || 0
                );
                rollData.otherModifier = Number(
                  // @ts-ignore
                  template.find('[name="otherModifier"]').val() || 0
                );
                rollData.attackerType = dialogData.modifiers.attacker;
                try {
                  await Conan2d20Dice.generateDamageRoll(
                    rollData,
                    cardData,
                    actorData
                  );
                } catch (e) {
                  console.log(e);
                  ui.notifications.error(e);
                }
              },
            },
          },
        },
        {classes: ['roll-dialog']}
      ).render(true);
    });
  }

  static async showSkillRollDialog({
    dialogData,
    rollData,
    cardData,
    actorData,
  }) {
    return renderTemplate(
      'systems/conan2d20/templates/apps/skill-roll-dialogue.html',
      dialogData
    ).then(html => {
      new Dialog(
        {
          content: html,
          title: dialogData.title,
          buttons: {
            roll: {
              label: game.i18n.localize('CONAN.rollSkillLabel'),
              callback: async template => {
                rollData.difficulty = Number(
                  // @ts-ignore
                  template.find('[name="difficulty"]').val() || 0
                );
                rollData.diceModifierType =
                  // @ts-ignore
                  template.find('[name="diceModifierType').val() || '';
                rollData.diceModifier = Number(
                  // @ts-ignore
                  template.find('[name="diceModifier"]').val() || 0
                );
                rollData.successModifier = Number(
                  // @ts-ignore
                  template.find('[name="successModifier"]').val() || 0
                );
                rollData.npcAttributes =
                  // @ts-ignore
                  template.find('[name="npcAttributes"]').val() || '';
                try {
                  let baseDice = 2;
                  if (dialogData.modifiers.actorType === 'npc') {
                    if (actorData.data.isMinion) {
                      baseDice = 1;
                    }
                  }
                  await Conan2d20Dice.generateSkillRoll(
                    baseDice,
                    rollData,
                    cardData,
                    actorData
                  );
                } catch (e) {
                  console.log(e);
                  ui.notifications.error(e);
                }
              },
            },
          },
        },
        {classes: ['roll-dialog']}
      ).render(true);
    });
  }

  static async spendRollMomentum(generated: number, spendAmount: number) {
    const generatorErr = {
      momentum: 'Selection would spend more momentum than you generated.',
    };
    if (generated - spendAmount < 0) {
      throw generatorErr.momentum;
    }
    const bankAmount = generated - spendAmount;
    Conan2d20Actor.addMomentum(bankAmount);
  }

  static async showRollMomentumSpendDialog(generated: number) {
    let dialogData;
    let spendAmount;
    const templt =
      'systems/conan2d20/templates/apps/roll-momentum-spend-dialog.html';
    return renderTemplate(templt, dialogData).then(html => {
      new Dialog({
        content: html,
        title: game.i18n.localize('CONAN.rollMomentumSpendTitle'),
        buttons: {
          spend: {
            label: game.i18n.localize('CONAN.rollMomentumSpendAssert'),
            callback: async template => {
              /* eslint no-param-reassign: "error" */
              spendAmount = Number(
                // @ts-ignore
                template.find('[name="momentumspend"]').val() || 0
              );

              try {
                await this.spendRollMomentum(generated, spendAmount);
              } catch (e) {
                console.log(e);
                ui.notifications.error(e);
              }
            },
          },
        },
      }).render(true);
    });
  }

  /**
   * Activate event listeners using the chat log html.
   * @param html {HTML}  Chat log html
   */
  static async chatListeners(html: any) {
    // Custom entity clicks
    html.on('click', '.reroll', ev => {
      const button = $(ev.currentTarget);
      // @ts-ignore
      const messageId = button.parents('.message').attr('data-message-id');
      const message = game.messages.get(messageId);

      const rolls = [];
      $(message.data.content)
        .children('.roll')
        .each(function () {
          rolls.push($(this).text().trim());
        });
    });
    html.on('click', '.roll-list-entry', ev => {
      const target = $(ev.currentTarget);
      const messageId = target.parents('.message').attr('data-message-id');
      const message = game.messages.get(messageId);

      if (message.data.speaker.actor || game.user.isGM) {
        const actor = game.actors.get(message.data.speaker.actor);
        // @ts-ignore
        if (
          actor.permission === CONST.ENTITY_PERMISSIONS.OWNER &&
          actor.data.type === 'character'
        ) {
          if (message.data.flags.data.rollData.reroll === false) {
            // @ts-ignore
            target.toggleClass('selected');

            const newHtml = target
              .parents()
              .children('.message-content')
              .html();
            message.update({content: newHtml});
          }
        }
      }
    });
    html.on('click', '.chat-execute-attack', ev => {
      const target = $(ev.currentTarget);
      const messageId = target.parents('.message').attr('data-message-id');
      const message = game.messages.get(messageId);
      const actor = game.actors.get(message.data.speaker.actor);
      const actorData = actor.data;
      const weapon = duplicate(
        actor.getOwnedItem(message.data.flags.conan2d20.itemData._id)
      );

      let weaponSkill;
      if (weapon.data.weaponType === 'melee') {
        weaponSkill = 'mel';
      } else if (weapon.data.weaponType === 'ranged') {
        weaponSkill = 'ran';
      } else if (weapon.type === 'display') {
        weaponSkill = weapon.data.skill;
      }

      // @ts-ignore
      const {dialogData, cardData, rollData} = actor.setupSkill(
        weaponSkill,
        actor.data.type
      );

      try {
        Conan2d20Dice.showSkillRollDialog({
          dialogData,
          cardData,
          rollData,
          actorData,
        });
      } catch (error) {
        ui.notifications.error(error);
        console.log(error);
      }
    });
    html.on('click', '.chat-execute-damage', ev => {
      const target = $(ev.currentTarget);
      const messageId = target.parents('.message').attr('data-message-id');
      const message = game.messages.get(messageId);
      const actor = game.actors.get(message.data.speaker.actor);
      const actorData = actor.data;
      const weapon = duplicate(
        actor.getOwnedItem(message.data.flags.conan2d20.itemData._id)
      );
      const reloadIds = actor.data.items
        .filter(i => i.data.kitType === 'reload')
        .map(i => ({id: i._id, name: i.name} || []));
      // @ts-ignore
      const {dialogData, cardData, rollData} = actor.setupWeapon(
        weapon,
        reloadIds
      );
      Conan2d20Dice.showDamageRollDialog({
        dialogData,
        cardData,
        rollData,
        actorData,
      });
    });
  }

  /**
   * Add support for the Dice So Nice module
   * @param {Object} roll
   * @param {String} rollMode
   */
  static async showDiceSoNice(roll, rollMode) {
    if (
      game.modules.get('dice-so-nice') &&
      game.modules.get('dice-so-nice').active
    ) {
      let whisper = null;
      let blind = false;
      switch (rollMode) {
        case 'blindroll': {
          blind = true;
          break;
        }
        case 'gmroll': {
          const gmList = game.users.filter(user => user.isGM);
          const gmIDList = [];
          gmList.forEach(gm => gmIDList.push(gm.data._id));
          whisper = gmIDList;
          break;
        }
        case 'roll': {
          const userList = game.users.filter(user => user.active);
          const userIDList = [];
          userList.forEach(user => userIDList.push(user.data._id));
          whisper = userIDList;
          break;
        }
        default: {
          break;
        }
      }
      await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
    }
  }
}
