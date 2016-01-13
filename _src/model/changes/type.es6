'use strict';

/**
* @exports
* @class ChangeType
* @desc change type model
*/
export default class ChangeType {
    /**
     * @constructor
     * @param {String} type - type of change
     */
    constructor(type) {
        this._type = type;
        this._added = [];
        this._modified = [];
        this._removed = [];
    }

    /**
     * Verify if data of given type were modified
     * @returns {Boolean}
     */
    areModified() {
        return !!(this.added.length || this.modified.length || this.removed.length);
    }

    /**
     * Add new items to added group
     * @param {Object} item
     * @returns {ChangeType}
     */
    addAdded(item) {
        this._added.push(item);
        return this;
    }

    /**
     * Add new items to modified group
     * @param {Object} item
     * @returns {ChangeType}
     */
    addModified(item) {
        this._modified.push(item);
        return this;
    }

    /**
     * Add new items to removed group
     * @param {Object} item
     * @returns {ChangeType}
     */
    addRemoved(item) {
        this._removed.push(item);
        return this;
    }

    /**
     * Returns items of added group
     * @returns {Object[]}
     */
    get added() {
        return this._added;
    }

    /**
     * Returns items of modified group
     * @returns {Object[]}
     */
    get modified() {
        return this._modified;
    }

    /**
     * Returns items of removed group
     * @returns {Object[]}
     */
    get removed() {
        return this._removed;
    }
}
