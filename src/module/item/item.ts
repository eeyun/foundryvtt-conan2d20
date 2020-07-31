import Conan2d20Actor from '../actor/actor';

export default class Conan2d20Item extends Item {
    
    prepareData() {
        super.prepareData();
        const item = this.data;
    }

    async roll(event) {
        const template = `systems/conan2d20/templates/chat/${this.data.type}-card.html`;
        const { token } = this.actor;
        const templateData = {
            actor: this.actor,
            tokenId: token ? `${token.scene._id}.${token.id}` : null,
            item: this.data,
            data: this.getChatData(),
        };

        const chatData : any = {
            user: game.user._id,
	        speaker: {
	            actor: this.actor._id,
	            token: this.actor.token,
	            alias: this.actor.name,
	        },
	        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
	    };

        const rollMode = game.settings.get('core', 'rollMode');
        if (['gmroll', 'blindroll'].includes(rollMode)) chatData.whisper = ChatMessage.getWhisperRecipients('GM').map(u => u._id);
        if (rollMode === 'blindroll') chatData.blind = true;

        chatData.content = await renderTemplate(template, templateData);

        return ChatMessage.create(chatData, { displaySheet: false});
    }

    postItem()
    {
        let chatData = {
            name : this.data.name,
            data : this.getChatData(),
            img : this.data.img
        }
        renderTemplate("systems/conan2d20/templates/chat/post-item.html", chatData).then(html => {
            ChatMessage.create({content : html}).then(msg => {
                msg.setFlag("conan2d20", "itemData", this.data)
            })
        })
    }

    getChatData(htmlOptions?) {
        const itemType = this.data.type;
        const data = this[`_${itemType}ChatData`]();
        if (data) {
            data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);
            return data;
        }
    }

      /* -------------------------------------------- */

    _armorChatData() {
        const localize = game.i18n.localize.bind(game.i18n);
        const data : any = duplicate(this.data.data);
        const qualities = [];
        if ((data.qualities.value || []).length !== 0) {
            for (let i = 0; i < data.qualities.value.length; i+= 1) {
                const qualitiesObject = {
                    label: CONFIG.CONAN.armorQualities[data.qualities.value[i]] || (data.qualities.value[i].charAt(0).toUpperCase() + data.qualities.value[i].slice(1)),
                    description: CONFIG.CONAN.qualitiesDescriptions[data.qualities.value[i]] || '',
                };
                qualities.push(qualitiesObject);
            }
        }
        const properties = [
            CONFIG.CONAN.armorTypes[data.armorType.value],
            `${data.soak || 0} ${localize('CONAN.armorSoakLabel')}`,
            data.equipped.value ? localize('CONAN.armorEquippedLabel') : null,
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
        const localize = game.i18n.localize.bind(game.i18n);
        const data : any = duplicate(this.data.data);
        data.kitTypeString = CONFIG.CONAN.kitTypes[data.kitType.value];
        data.properties = [data.kitTypeString, `${data.uses.value}/${data.uses.max} ${localize('CONAN.kitUsesLabel')}`];
        data.hasCharges = data.uses.value >= 0;
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
            detail: CONFIG.CONAN.weaponGroups[data.group.value],
        };
        details.push(weaponGroup);

        const weaponDamage = {
            label: 'CONAN.baseDamageLabel',
            detail: CONFIG.CONAN.damageDice[data.damage.dice],
        };
        details.push(weaponDamage);
        
        let weaponRange: any;
        if (data.weaponType.value === 'ranged') {
            weaponRange = {
                label: 'CONAN.rangeLabel',
                detail: CONFIG.CONAN.weaponRanges[data.range.value],
            };
        } else {
            weaponRange = {
                label: 'CONAN.reachLabel',
                detail: CONFIG.CONAN.weaponReaches[data.range.value],
            };
        }
        details.push(weaponRange);

        if (data.group.value) {
            data.critSpecialization = {
                label: CONFIG.CONAN.weaponGroups[data.group.value],
                description: CONFIG.CONAN.weaponDescriptions[data.group.value],
            };
        }

        if (data.size.value) {
            properties.push(CONFIG.CONAN.weaponSizes[data.size.value]);
        }

        data.properties = properties.filter((p) => !!p);
        data.itemDetails = details.filter((p) => p !== null);
        data.qualities = qualities.filter((p) => !!p);

        return data;
    }
}

