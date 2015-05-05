var inherit = require('inherit'),
    Changes = require('./changes');

module.exports = inherit({

    _changes: undefined,

    _commonPages: undefined,

    __constructor: function () {
        this._changes = new Changes();
        this._commonPages = [];
    },

    getChanges: function () {
        return this._changes;
    },

    getCommonPages: function () {
        return this._commonPages;
    },

    setCommonPages: function (pages) {
        this._commonPages = pages;
        return this;
    }
});
