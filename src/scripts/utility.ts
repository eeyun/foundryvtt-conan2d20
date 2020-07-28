export class C2_Utility {
    static addDots(data, woundMax = 0, valueAttribute = "value")
    {
        data.dots = [];
        for (let i = 0; i < woundMax; i++){
            data.dots.push({
                wounded : i + 1 <= getProperty(data, valueAttribute)
            })
        }

        if (getProperty(data, "max"))
        {
            for (let i = 0; i < woundMax; i++)
            {
                data.dots[i].locked = i +1 > getProperty(data, "max")
            }
        }

        if (data.treated)
        {
            for (let i = 0; i < data.treated; i++)
            {
                data.dots[i].treated = true
            }
        }

        return data
    }

    static calculateArmor(armorItems)
    {
        const armor = {
            head: {
                soak: [],
                qualities: []
            },
            torso: {
                soak: [],
                qualities: []
            },
            larm: {
                soak: [],
                qualities: []
            },
            rarm:  {
                soak: [],
                qualities: []
            },
            lleg: {
                soak: [],
                qualities: []
            },
            rleg: {
                soak: [],
                qualities: []
            },
        }

        const qualityEffects = [];
        armorItems.forEach(armorPiece => {
            if (armorPiece.isEquipped.value && armorPiece.data.broken.value !== true) {
                for (let i = 0; i < armorPiece.data.coverage.value.length; i++) {
                    if (armorPiece.data.coverage.value[i] === "head") {
                        armor.head.soak.push(armorPiece.data.soak) ;
                        if (armorPiece.data.qualities.value.length > 0 ) {
                            armor.head.qualities.push(...armorPiece.data.qualities.value);
                        };
                    } else if (armorPiece.data.coverage.value[i] === "torso") {
                        armor.torso.soak.push(armorPiece.data.soak);
                        if (armorPiece.data.qualities.value.length > 0 ) {
                            armor.torso.qualities.push(...armorPiece.data.qualities.value);
                        };
                    } else if (armorPiece.data.coverage.value[i] === "larm") {
                        armor.larm.soak.push(armorPiece.data.soak);
                        if (armorPiece.data.qualities.value.length > 0 ) {
                            armor.larm.qualities.push(...armorPiece.data.qualities.value);
                        };
                    } else if (armorPiece.data.coverage.value[i] === "rarm") {
                        armor.rarm.soak.push(armorPiece.data.soak);
                        if (armorPiece.data.qualities.value.length > 0 ) {
                            armor.rarm.qualities.push(...armorPiece.data.qualities.value);
                        };
                    } else if (armorPiece.data.coverage.value[i] === "lleg") {
                        armor.lleg.soak.push(armorPiece.data.soak);
                        if (armorPiece.data.qualities.value.length > 0 ) {
                            armor.lleg.qualities.push(...armorPiece.data.qualities.value);
                        };
                    } else if (armorPiece.data.coverage.value[i] === "rleg") {
                        armor.rleg.soak.push(armorPiece.data.soak);
                        if (armorPiece.data.qualities.value.length > 0 ) {
                            armor.rleg.qualities.push(...armorPiece.data.qualities.value);
                        };
                    };
                }
            }
        });

        const locationCount = {
            heavy: 0,
            vheavy: 0,
            noisy: 0
        };
        
        for (const entry in armor) {
            armor[entry].soak.sort((a, b) => a - b);
            const uniq = [...new Set(armor[entry].qualities)];
            armor[entry].qualities = uniq;
            const innerCount = armor[entry].soak.length;
            if (innerCount > 1 && armor[entry].qualities.includes('heavy')) {
                for (let i = 0; i < armor[entry].qualities.length; i += 1) {
                    if (armor[entry].qualities[i] === 'heavy') {
                        armor[entry].qualities[i] = 'vheavy';
                    };
                };
            } else if (innerCount > 1 && armor[entry].qualities.length === 0) {
                armor[entry].qualities.push('heavy');
            } 

            for (let i =  0; i < armor[entry].qualities.length; i += 1) {
                if (armor[entry].qualities[i] === 'heavy') {
                    locationCount.heavy += 1;
                } else if (armor[entry].qualities[i] === 'vheavy') {
                    locationCount.vheavy += 1;
                } else if (armor[entry].qualities[i] === 'noisy') {
                    locationCount.noisy += 1;
                };
            };
        };
        
        Object.assign(armor, {qualityCount: locationCount});
        return armor
    }
}
