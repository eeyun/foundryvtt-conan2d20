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

    static calculateArmor(armorItems, shieldItems = undefined)
    {
        let shields;
        if (shieldItems === undefined) {
            shields = [];
        } else {
            shields = shieldItems;
        };
        const armor = {
            head: {
                soak: [0],
                qualities: []
            },
            torso: {
                soak: [0],
                qualities: []
            },
            larm: {
                soak: [0],
                qualities: []
            },
            rarm:  {
                soak: [0],
                qualities: []
            },
            lleg: {
                soak: [0],
                qualities: []
            },
            rleg: {
                soak: [0],
                qualities: []
            },
            shield: {
                soak: [0],
            }
        }
        
        for (let x = 0; x < shields.length; x += 1) {
            if (shields[x].isEquipped.value && shields[x].data.broken.value !== true) {
                for (let i = 0; i < shields[x].data.qualities.value.length; i += 1) {
                    if (shields[x].data.qualities.value[i].type === 'shieldx') {
                        armor.shield.soak.push(shields[x].data.qualities.value[i].value);
                    }
                }
            }
        };
        for (let x = 0; x < armorItems.length; x += 1) {
            if (armorItems[x].isEquipped.value && armorItems[x].data.broken.value !== true) {
                for (let i = 0; i < armorItems[x].data.coverage.value.length; i += 1) {
                    if (armorItems[x].data.coverage.value[i] === "head") {
                        armor.head.soak.push(armorItems[x].data.soak);
                        if (armorItems[x].data.qualities.value.length > 0 ) {
                            armor.head.qualities.push(...armorItems[x].data.qualities.value);
                        };
                    } else if (armorItems[x].data.coverage.value[i] === "torso") {
                        armor.torso.soak.push(armorItems[x].data.soak);
                        if (armorItems[x].data.qualities.value.length > 0 ) {
                            armor.torso.qualities.push(...armorItems[x].data.qualities.value);
                        };
                    } else if (armorItems[x].data.coverage.value[i] === "larm") {
                        armor.larm.soak.push(armorItems[x].data.soak);
                        if (armorItems[x].data.qualities.value.length > 0 ) {
                            armor.larm.qualities.push(...armorItems[x].data.qualities.value);
                        };
                    } else if (armorItems[x].data.coverage.value[i] === "rarm") {
                        armor.rarm.soak.push(armorItems[x].data.soak);
                        if (armorItems[x].data.qualities.value.length > 0 ) {
                            armor.rarm.qualities.push(...armorItems[x].data.qualities.value);
                        };
                    } else if (armorItems[x].data.coverage.value[i] === "lleg") {
                        armor.lleg.soak.push(armorItems[x].data.soak);
                        if (armorItems[x].data.qualities.value.length > 0 ) {
                            armor.lleg.qualities.push(...armorItems[x].data.qualities.value);
                        };
                    } else if (armorItems[x].data.coverage.value[i] === "rleg") {
                        armor.rleg.soak.push(armorItems[x].data.soak);
                        if (armorItems[x].data.qualities.value.length > 0 ) {
                            armor.rleg.qualities.push(...armorItems[x].data.qualities.value);
                        };
                    };
                }
            }
        };

        const locationCount = {
            heavy: 0,
            vheavy: 0,
            noisy: 0
        };
        
        for (const entry in armor) {
            armor[entry].soak.sort((a, b) => a - b);
            armor[entry].soak.reverse();
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
