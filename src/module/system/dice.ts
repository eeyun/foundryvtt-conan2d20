//* eslint-disable-file @typescript-eslint/ban-ts-comment */

// @ts-ignore
export default class CombatDie extends DiceTerm {
  constructor(termData) {
    super(termData);
    // @ts-ignore
    this.faces = 6;
  }

  static DENOMINATION = 'p';

  static values = {
    '1': 1,
    '2': 2,
    '3': 0,
    '4': 0,
    '5':
      "<img width='24' height='24' style='border: none' src='systems/conan2d20/assets/dice/phoenix/phoenix-black.png'/>",
    '6':
      "<img width='24' height='24' style='border: none' src='systems/conan2d20/assets/dice/phoenix/phoenix-black.png'/>",
  };

  /**
   * @return the results as CombatDice values: 0,1,2,phoenix.
   */
  static getResultLabel(result) {
    // Return blank if 0, otherwise just get the value
    return CombatDie.values[result] ? CombatDie.values[result] : '&nbsp';
  }

  /** @override */
  // @ts-ignore
  get total() {
    // @ts-ignore
    if (!this._evaluated) return null;
    // @ts-ignore
    return this.results.reduce((t, r) => {
      // @ts-ignore
      if (!r.active) return t;
      // @ts-ignore
      if (r.count !== undefined) return t + r.count;
      // @ts-ignore
      return t + CombatDie.getValue(r.result);
    }, 0);
  }

  /** @override */
  roll(options) {
    const roll = super.roll(options);
    // @ts-ignore
    roll.effect = roll.result === 5 || roll.result === 6;
    return roll;
  }

  get resultValues() {
    // @ts-ignore
    return this.results.map(result => {
      // @ts-ignore
      return CombatDie.getResultLabel(result.result);
    });
  }

  static getValue(dieSide: number) {
    // 1 if Effect, otherwise take the value
    return typeof CombatDie.values[dieSide] === 'string'
      ? 1
      : CombatDie.values[dieSide];
  }
}
