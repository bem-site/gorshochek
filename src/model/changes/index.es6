'use strict';

import ChangeType from './type.es6';

export default class Changes {
    constructor() {
        this._docs = new ChangeType('docs');
        this._pages = new ChangeType('pages');
        this._libraries = new ChangeType('libraries');
    }

    /**
     * Returns modified state of changes
     * @returns {*|Boolean}
     */
    areModified() {
        return this.docs.areModified() || this.pages.areModified() || this.libraries.areModified();
    }

    /**
     * Returns documentation changes
     * @returns {Array<ChangeType>}
     */
    get docs() {
        return this._docs;
    }

    /**
     * Returns page changes
     * @returns {Array<ChangeType>}
     */
    get pages() {
        return this._pages;
    }

    /**
     * Returns library changes
     * @returns {Array<ChangeType>}
     */
    get libraries() {
        return this._libraries;
    }
}
