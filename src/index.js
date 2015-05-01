var vow = require('vow'),
    inherit = require('inherit'),
    Logger = require('bem-site-logger'),
    Config = require('./config');

module.exports = inherit({
    _config: undefined,
    _logger: undefined,
    _tasks: undefined,

    /**
     * Initialize core builder module
     * @returns {exports}
     */
    init: function () {
        this._config = new Config('./');
        this._logger = Logger.setOptions(this._config.getLoggerSettings()).createLogger(module);

        if (!this._config.getTasks().length) {
            this._tasks = [];
        }

        this._tasks = this._config.getTasks().map(function (task) {
            return new task[0](this._config, task[1]);
        }, this);

        return this;
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
        return this._tasks.reduce(function (prev, task) {
            return prev.then(task.run.bind(task));
        }, vow.resolve())
            .then(this._onSuccess.bind(this))
            .fail(this._onError.bind(this));
    }
});
