import Changes from './changes/index';
import Meta from './meta';

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

    initMeta(authors, translators, tags) {
        this._meta = new Meta(authors, translators, tags);
        return this;
    }

    getMeta() {
        return this._meta;
    }
}
