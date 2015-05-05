'use strict';

export default class ChangeType {
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
        return this.added.length || this.modified.length || this.removed.length;
    }

    /**
     * Add new items to added group
     * @param {Object} item
     * @returns {*}
     */
    addAdded(item) {
        this._added.push(item);
        return this;
    }

    /**
     * Add new items to modified group
     * @param {Object} item
     * @returns {*}
     */
    addModified(item) {
        this._modified.push(item);
        return this;
    }

    /**
     * Add new items to removed group
     * @param {Object} item
     * @returns {*}
     */
    addRemoved(item) {
        this._removed.push(item);
        return this;
    }

    /**
     * Returns items of added group
     * @returns {*}
     */
    get added() {
        return this._added;
    }

    /**
     * Returns items of modified group
     * @returns {*}
     */
    get modified() {
        return this._modified;
    }

    /**
     * Returns items of removed group
     * @returns {*}
     */
    get removed() {
        return this._removed;
    }
}
