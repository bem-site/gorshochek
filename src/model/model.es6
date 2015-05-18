import Changes from './changes/index';
import Meta from './meta';

export default class Model {

    constructor() {
        this._changes = new Changes();
        this._pages = [];
    }

    get newModel() {
        return this._newModel;
    }

    set newModel(model) {
        this._newModel = model;
        return this;
    }

    get oldModel() {
        return this._oldModel;
    }

    set oldModel(model) {
        this._oldModel = model;
        return this;
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
