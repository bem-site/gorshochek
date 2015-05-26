import Changes from './changes/index';

export default class Model {

    constructor() {
        this._changes = new Changes();
        this._pages = [];
    }

    /**
     * Returns new model object
     * @returns {Object}
     */
    getNewModel() {
        return this._newModel;
    }

    /**
     * Sets new model
     * @param {Object} model object
     */
    setNewModel(model) {
        this._newModel = model;
    }

    /**
     * Returns old model object
     * @returns {Object}
     */
    getOldModel() {
        return this._oldModel;
    }

    /**
     * Sets old model object
     * @param {Object} model object
     */
    setOldModel(model) {
        this._oldModel = model;
    }

    /**
     * Returns changes model
     * @returns {*}
     */
    getChanges() {
        return this._changes;
    }

    /**
     * Returns array of pages
     * @returns {Array|*}
     */
    getPages() {
        return this._pages;
    }

    /**
     * Sets array of pages
     * @param {Array} pages array
     * @returns {Model}
     */
    setPages(pages) {
        this._pages = pages;
        return this;
    }
}
