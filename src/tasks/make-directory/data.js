var inherit = require('inherit'),
    Base = require('./base');

module.exports = inherit(Base, {

    /**
     * Returns name of current task
     * @returns {string} - name of task
     */
    getName: function () {
        return 'make data directory';
    },

    getFolderPath: function () {
        return this.getBaseConfig().getDestinationDirPath();
    }
});
