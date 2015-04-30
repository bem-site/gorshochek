var vow = require('vow'),
    inherit = require('inherit'),
    Logger = require('bem-site-logger'),
    Config = require('./config');

module.exports = inherit({
    _config: undefined,
    _logger: undefined,

    init: function () {
        this._config = new Config('./');
        this._logger = Logger.setOptions(this._config.getLoggerSettings()).createLogger(module);

        this._config.getTasks().forEach(function (task) {
            task[0].init(this._config, task[1]);
        }, this);
    },

    /**
     * Success callback function
     * @param {Object} result - build data result object
     * @returns {Promise}
     * @private
     */
    _onSuccess: function (result) {
        this._logger.info('-- BUILD HAS BEEN FINISHED SUCCESSFULLY --');
        return result;
    },

    /**
     * Error callback function
     * @param {Error} error - error object
     * @private
     */
    _onError: function (error) {
        this._logger.error(error.message);
        this._logger.error('-- BUILD HAS BEEN FAILED --');
        throw error;
    },

    /**
     * Run all tasks in queue by async chain
     * @returns {Promise}
     */
    run: function () {
        this._logger.info('-- START BUILD DATA --');
        return this._config.getTasks().reduce(function (prev, task) {
            return prev.then(task[0].run);
        }, vow.resolve())
            .then(this._onSuccess.bind(this))
            .fail(this._onError.bind(this));
    }
});
