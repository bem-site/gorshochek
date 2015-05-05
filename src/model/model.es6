import Changes from './changes/index';

export default class Model {

    constructor() {
        this._changes = new Changes();
        this._commonPages = [];
    }

    getChanges() {
        return this._changes;
    }

    getCommonPages() {
        return this._commonPages;
    }

    setCommonPages(pages) {
        this._commonPages = pages;
        return this;
    }
}
