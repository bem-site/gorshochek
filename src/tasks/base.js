var inherit = require('inherit'),
    Logger = require('bem-site-logger');

module.exports = inherit({

    logger: undefined,

    _baseConfig: undefined,
    _taskConfig: undefined,

    __constructor: function (baseConfig, taskConfig) {
        this._baseConfig = baseConfig;
        this._taskConfig = taskConfig;

        // TODO implement in inheritances
    },

    getBaseConfig: function () {
        return this._baseConfig;
    },

    getTaskConfig: function () {
        return this._taskConfig;
    },

    /**
     * Creates task logger
     * @param {Module} m - task module
     * @returns {*}
     */
    createLogger: function (m) {
        return Logger.setOptions(this.getBaseConfig().getLoggerSettings()).createLogger(m);
    },

    getName: function () {
        return 'base';
    },

    run: function () {
        // TODO implement in inheritances
    }
});
