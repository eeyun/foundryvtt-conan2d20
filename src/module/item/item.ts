import Conan2d20Actor from '../actor/actor';

export default class Conan2d20Item extends Item {
    
    prepareData() {
        super.prepareData();
        const item = this.data;
    }

    async postItem(event)
    {
        const template = `systems/conan2d20/templates/chat/${this.data.type}-card.html`;
        if (!this.actor) return;
        // @ts-ignore
        const { token } = this.actor;
        const nearestItem =  event ? event.currentTarget.closest('.item') : {};
        const contextualData = nearestItem.dataset || {};
        const templateData = {
            actor: this.actor,
            tokenId: token ? `${token.scene._id}.${token.id}` : null,
            item: this.data,
            data : this.getChatData(undefined, contextualData),
        };

        const chatData : any = {
            // @ts-ignore
            user: game.user._id,
            speaker: {
                actor: this.actor._id,
                token: this.actor.token,
                alias: this.actor.name,
            },
            // @ts-ignore
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        };

        chatData.content = await renderTemplate(template, templateData);

        return ChatMessage.create(chatData, { displaySheet: false }).then(msg => {
            msg.setFlag("conan2d20", "itemData", this.data)
        });
    }

    getChatData(htmlOptions?, postOptions?: any) {
        const itemType = this.data.type;
        const data = this[`_${itemType}ChatData`](postOptions);
        if (data) {
            data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);
            return data;
        }
    }

      /* -------------------------------------------- */

    _actionChatData() {
        if (this.data.type !== 'action') {
          throw new Error('tried to create an action chat data for a non-action item');
        }

        const data : any = duplicate(this.data.data);
        const ad = this.actor.data.data;

        let associatedWeapon = null;
        if (data.weapon.value) associatedWeapon = this.actor.getOwnedItem(data.weapon.value);

        const props = [
          CONFIG.CONAN.actionTypes[data.actionType],
          CONFIG.CONAN.actionCounts[data.actionCount],
          CONFIG.CONAN.actionCategories[data.actionCategory],
          associatedWeapon ? associatedWeapon.name : null,
        ];

        data.properties = props.filter((p) => p);

        return data;
    }


    _armorChatData() {
        if (this.data.type !== 'armor') {
          throw new Error('tried to create an armor chat data for a non-armor item');
        }
        
        const localize = game.i18n.localize.bind(game.i18n);
        const data : any = duplicate(this.data.data);
        const qualities = [];
        if ((data.qualities.value || []).length !== 0) {
            for (let i = 0; i < data.qualities.value.length; i+= 1) {
                const qualitiesObject = {
                    label: CONFIG.armorQualities[data.qualities.value[i]] || (data.qualities.value[i].charAt(0).toUpperCase() + data.qualities.value[i].slice(1)),
                    description: CONFIG.qualitiesDescriptions[data.qualities.value[i]] || '',
                };
                qualities.push(qualitiesObject);
            }
        }
        const properties = [
            `${localize(CONFIG.CONAN.armorTypes[data.armorType])}`,
            `${data.soak || 0} ${localize('CONAN.armorSoakLabel')}`,
            data.equipped ? localize('CONAN.armorEquippedLabel') : null,
        ];
        if((data.coverage.value || []).length !== 0) {
            for (let i = 0; i < data.coverage.value.length; i+= 1 ) {
                properties.push(`${data.coverage.value[i]} ${localize('CONAN.coverageLabel')}`)
            }
        }
        data.properties = properties.filter((p) => p !== null);
        data.qualities = qualities.filter((p) => !!p);
        return data;
    }

    _kitChatData() {
        if (this.data.type !== 'kit') {
          throw new Error('tried to create a kit chat data for a non-kit item');
        }

        const localize = game.i18n.localize.bind(game.i18n);
        const data : any = duplicate(this.data.data);
        data.kitTypeString = CONFIG.kitTypes[data.kitType];
        data.properties = [data.kitTypeString, `${data.uses.value}/${data.uses.max} ${localize('CONAN.kitUsesLabel')}`];
        data.hasCharges = data.uses.value >= 0;
        return data;
    }

    _talentChatData() {
        if (this.data.type !== 'talent') {
          throw new Error('tried to create a talent chat data for a non-talent item');
        }

        const data : any = duplicate(this.data.data);
        const ad = this.actor.data.data;
        const details = [];

        const props = [
            `Rank ${data.rank.value || 0}`,
            CONFIG.CONAN.skills[data.skill],
            data.actionType ? CONFIG.CONAN.actionTypes[data.actionType] : null,
        ];

        data.properties = props.filter((p) => p);

        if (data.prerequisites) {
            const prereqs = {
                label: 'CONAN.talentRequiresLabel',
                detail: data.prerequisites 
            }
            details.push(prereqs);
        }

        const qualities = [];
        if ((data.qualities || []).length !== 0) {
          for (let i = 0; i < data.qualities.value.length; i++) {
            const qualitiesObject = {
              label: CONFIG.CONAN.talentQualities[data.qualities.value[i]] || (data.qualities.value[i].charAt(0).toUpperCase() + data.qualities.value[i].slice(1)),
              description: CONFIG.CONAN.qualitiesDescriptions[data.qualities.value[i]] || '',
            };
            qualities.push(qualitiesObject);
          }
        }
        data.itemDetails = details.filter((p) => p !== null);
        data.qualities = qualities.filter((p) => p);
        return data;
  }

 

    _weaponChatData() {
        const data : any = duplicate(this.data.data);
        const qualities = [];
        const properties = [];
        const  details = [];

        if (this.data.type !== 'weapon') {
          throw new Error('tried to create a weapon chat data for a non-weapon item');
        }

        if ((data.qualities.value || []).length !== 0) {
            let  qualitiesObject;
            for (let i = 0; i < data.qualities.value.length; i+= 1) {
                if (data.qualities.value[i].value) {
                    qualitiesObject = { label: `${data.qualities.value[i].label} ${(data.qualities.value[i].value)}` || (data.qualities.value[i].label.charAt(0).toUpperCase() + data.qualities.value[i].label.slice(1)),
                    description: CONFIG.CONAN.qualitiesDescriptions[data.qualities.value[i].label.replace(' ','').toLowerCase()] || '',
                    };
                } else {
                    qualitiesObject = { label: CONFIG.CONAN.weaponQualities[data.qualities.value[i].label] || (data.qualities.value[i].label.charAt(0).toUpperCase() + data.qualities.value[i].label.slice(1)),
                    description: CONFIG.CONAN.qualitiesDescriptions[data.qualities.value[i].label.replace(' ','').toLowerCase()] || '',
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

        data.properties = properties.filter((p) => !!p);
        data.itemDetails = details.filter((p) => p !== null);
        data.qualities = qualities.filter((p) => !!p);

        return data;
    }


    _npcattackChatData() {
        const data : any = duplicate(this.data.data);
        const qualities = [];
        const details = [];

        if (this.data.type !== 'npcattack') {
          throw new Error('tried to create an NPC Attack chat data for an incorrect item');
        }

        if ((data.qualities.value || []).length !== 0) {
            let  qualitiesObject;
            for (let i = 0; i < data.qualities.value.length; i+= 1) {
                if (data.qualities.value[i].value) {
                    qualitiesObject = { label: `${data.qualities.value[i].label} ${(data.qualities.value[i].value)}` || (data.qualities.value[i].label.charAt(0).toUpperCase() + data.qualities.value[i].label.slice(1)),
                    description: CONFIG.CONAN.qualitiesDescriptions[data.qualities.value[i].label.replace(' ','').toLowerCase()] || '',
                    };
                } else {
                    qualitiesObject = { label: CONFIG.CONAN.weaponQualities[data.qualities.value[i].label] || (data.qualities.value[i].label.charAt(0).toUpperCase() + data.qualities.value[i].label.slice(1)),
                    description: CONFIG.CONAN.qualitiesDescriptions[data.qualities.value[i].label.replace(' ','').toLowerCase()] || '',
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
        };
        details.push(attackRange);

        data.itemDetails = details.filter((p) => p !== null);
        data.qualities = qualities.filter((p) => !!p);

        return data;
    }

    _npcactionChatData() {
        if (this.data.type !== 'npcaction') {
          throw new Error('tried to create an npcaction chat data for a non-npcaction item');
        }

        const data : any = duplicate(this.data.data);
        const ad = this.actor.data.data;

        const props = [
          CONFIG.CONAN.npcActionTypes[data.actionType],
        ];

        data.properties = props.filter((p) => p);

        return data;
    }
}

