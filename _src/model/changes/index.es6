'use strict';

import ChangeType from './type';

/**
* @exports
* @class Changes
* @desc changes model class
*/
export default class Changes {
    /**
     * @constructor
     */
    constructor() {
        this._pages = new ChangeType('pages');
    }

    /**
     * Returns modified state of changes
     * @returns {Boolean}
     */
    areModified() {
        return this.pages.areModified();
    }

    /**
     * Returns page changes
     * @returns {Array<ChangeType>}
     */
    get pages() {
        return this._pages;
    }
}
