export class CombatDie extends Die {

    static values = {
        1: 1,
        2: 2,
        3: 0,
        4: 0,
        5: "Effect",
        6: "Effect"
    };

    constructor(options) {
        super(6, options);
    }

    /**
     * @return the results as CombatDice values: 0,1,2,Effect.
     */
    getResultValues() {
        var resultValues = []
        resultValues = this.results;

        resultValues.forEach(r => {
            r = CombatDie.getValue(r);
        });

        return resultValues;
    }

    static getValue(dieSide: number) {
        return CombatDie.values[dieSide];
    }

    // reroll() { };

}