class CharacterData {
    data: any;

    _items: any;

    constructor(data: any, _items?: any) {
        this.data = data;
        this._items = _items;
    }

    get maxExp() {
        return this.data.resources.xp.max;
    }

    get exp() {
        return this.data.resources.xp.value;
    }

    get items() {
        return this._items || [];
    }

    get attributes() {
        return this.data.attributes;
    }
}

export default CharacterData;
