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

    getChatData(htmlOptions?) {
        const itemType = this.data.type;
        const data = this[`_${itemType}ChatData`]();
        if (data) {
            data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);
            return data;
        }
        return;
    }
}

