import Changes from './changes/index';
import Meta from './meta';

export default class Model {

    constructor() {
        this._changes = new Changes();
        this._pages = [];
    }

    getChanges() {
        return this._changes;
    }

    getPages() {
        return this._pages;
    }

    setPages(pages) {
        this._pages = pages;
        return this;
    }
}
