'use strict';

var inherit = require('inherit'),
    ChangeType = require('./type');

module.exports = inherit({
    _docs: undefined,
    _pages: undefined,
    _libraries: undefined,

    __constructor: function () {
        this._docs = new ChangeType('docs');
        this._pages = new ChangeType('pages');
        this._libraries = new ChangeType('libraries');
    },

    /**
     * Returns modified state of changes
     * @returns {*|Boolean}
     */
    areModified: function () {
        return this.docs.areModified() || this.pages.areModified() || this.libraries.areModified();
    },

    /**
     * Returns documentation changes
     * @returns {Array<ChangeType>}
     */
    get docs() {
        return this._docs;
    },

    /**
     * Returns page changes
     * @returns {Array<ChangeType>}
     */
    get pages() {
        return this._pages;
    },

    /**
     * Returns library changes
     * @returns {Array<ChangeType>}
     */
    get libraries() {
        return this._libraries;
    }
});
