export class InventoryWeight {
  combinedEnc: number;

  encumberedAt: number;

  limit: number;

  constructor(combinedEnc: number, encumberedAt: number, limit: number) {
    this.combinedEnc = combinedEnc;
    this.encumberedAt = encumberedAt;
    this.limit = limit;
  }

  get encumberedPercentage(): number {
    const totalTimes10 = this.combinedEnc * 10;
    const limitTimes10 = this.limit * 10;
    return Math.floor((totalTimes10 / limitTimes10) * 100);
  }

  get limitPercentage(): number {
    const totalTimes10 = this.combinedEnc * 10;
    const limitTimes10 = this.limit * 10;
    return Math.floor((totalTimes10 / limitTimes10) * 100);
  }

  get limitPercentageMax(): number {
    if (this.limitPercentage > 100) {
      return 100;
    }
    return this.limitPercentage;
  }

  get isEncumbered(): boolean {
    return this.combinedEnc > this.encumberedAt;
  }

  get encumbranceFactor() {
    const pct = this.encumberedPercentage;
    const encObject = {
      carried: '',
      fatigue: '',
    };

    if (pct < 60 && pct >= 40) {
      encObject.carried = `${game.i18n.localize(
        'CONAN.encumbranceCarriedRatingLabel'
      )}: x2`;
      encObject.fatigue = `${game.i18n.localize(
        'CONAN.encumbranceRatingFatigueLabel'
      )}: +1`;
      return encObject;
    }
    if (pct < 80 && pct >= 60) {
      encObject.carried = `${game.i18n.localize(
        'CONAN.encumbranceCarriedRatingLabel'
      )}: x3`;
      encObject.fatigue = `${game.i18n.localize(
        'CONAN.encumbranceRatingFatigueLabel'
      )}: +2`;
      return encObject;
    }
    if (pct < 100 && pct >= 80) {
      encObject.carried = `${game.i18n.localize(
        'CONAN.encumbranceCarriedRatingLabel'
      )}: x4`;
      encObject.fatigue = `${game.i18n.localize(
        'CONAN.encumbranceRatingFatigueLabel'
      )}: +3`;
      return encObject;
    }
    if (pct < 120 && pct >= 100) {
      encObject.carried = `${game.i18n.localize(
        'CONAN.encumbranceCarriedRatingLabel'
      )}: x5`;
      encObject.fatigue = `${game.i18n.localize(
        'CONAN.encumbranceRatingFatigueLabel'
      )}: +4`;
      return encObject;
    }
    if (pct < 140 && pct >= 120) {
      encObject.carried = `${game.i18n.localize(
        'CONAN.encumbranceCarriedRatingLabel'
      )}: x6`;
      encObject.fatigue = `${game.i18n.localize(
        'CONAN.encumbranceRatingFatigueLabel'
      )}: +5`;
      return encObject;
    }
    if (pct < 160 && pct >= 140) {
      encObject.carried = `${game.i18n.localize(
        'CONAN.encumbranceCarriedRatingLabel'
      )}: x7`;
      encObject.fatigue = `${game.i18n.localize(
        'CONAN.encumbranceRatingFatigueLabel'
      )}: +6`;
      return encObject;
    }
    if (pct >= 160) {
      encObject.carried = `${game.i18n.localize(
        'CONAN.encumbranceCarriedRatingLabel'
      )}: x8`;
      encObject.fatigue = `${game.i18n.localize(
        'CONAN.encumbranceRatingFatigueLabel'
      )}: +7`;
      return encObject;
    }
    encObject.carried = `${game.i18n.localize(
      'CONAN.encumbranceCarriedRatingLabel'
    )}: ${game.i18n.localize('CONAN.encumbranceRatingLessLabel')}`;
    encObject.fatigue = `${game.i18n.localize(
      'CONAN.encumbranceRatingFatigueLabel'
    )}: -`;
    return encObject;
  }

  get isOverLimit(): boolean {
    return this.combinedEnc > this.limit;
  }

  get enc(): number {
    return this.combinedEnc;
  }
}
export function combinedEncumbrance(actorInventory, actorBrawn) {
  let totalEnc = 0;
  for (const itemType in actorInventory) {
    if (actorInventory !== undefined) {
      if (actorInventory[itemType].label !== 'Consumables') {
        for (let x = 0; x < actorInventory[itemType].items.length; x += 1) {
          if (actorInventory[itemType].label == 'Transportation') {
            if (
              Number(
                actorInventory[itemType].items[x].data.passengers.current
              ) >
              Number(actorInventory[itemType].items[x].data.passengers.capacity)
            ) {
              const extraEnc =
                (Number(
                  actorInventory[itemType].items[x].data.passengers.current
                ) -
                  Number(
                    actorInventory[itemType].items[x].data.passengers.capacity
                  )) *
                10;
              totalEnc += extraEnc;
            }
          }
          if (!actorInventory[itemType].items[x].data.equipped) {
            if (
              actorInventory[itemType].items[x].data.encumbrance === '1each'
            ) {
              totalEnc +=
                Number(actorInventory[itemType].items[x].data.quantity) *
                Number(
                  actorInventory[itemType].items[x].data.coverage.value.length
                );
            } else {
              totalEnc +=
                Number(actorInventory[itemType].items[x].data.encumbrance) *
                Number(actorInventory[itemType].items[x].data.quantity);
            }
          }
        }
      }
    }
  }
  return totalEnc;
}

/**
 * @param combinedBulk
 * @param actorSize
 */
export function calculateEncumbrance(
  actorInventory,
  actorBrawn
): InventoryWeight {
  const combinedEnc = Math.floor(
    this.combinedEncumbrance(actorInventory, actorBrawn)
  );
  let encumberedAt;
  let limit;
  let stowage = 0;
  for (const itemType in actorInventory) {
    if (actorInventory[itemType].label == 'Transportation') {
      for (let x = 0; x < actorInventory[itemType].items.length; x += 1) {
        stowage += Number(actorInventory[itemType].items[x].data.stowage);
      }
      encumberedAt = Math.floor(actorBrawn * 2 + stowage);
      limit = Math.floor(actorBrawn * 5 + Number(stowage));
      return new InventoryWeight(combinedEnc, encumberedAt, limit);
    }
    encumberedAt = Math.floor(actorBrawn * 2);
    limit = Math.floor(actorBrawn * 5);
  }

  return new InventoryWeight(combinedEnc, encumberedAt, limit);
}
