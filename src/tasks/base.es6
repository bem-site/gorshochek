var Logger = require('bem-site-logger');

export default class Base {
    constructor(baseConfig, taskConfig, meta) {
        this._baseConfig = baseConfig;
        this._taskConfig = taskConfig;
        this.name = meta.name;
        this.setLogger(meta.module);
        this.afterInitialization();
    }

    /**
     * Creates task logger
     * @param {Module} m - task module
     * @returns {*}
     */
    setLogger(m) {
        this.logger = Logger.setOptions(this.getBaseConfig().getLoggerSettings()).createLogger(m);
    }

    /**
     * Returns general configuration object
     * @returns {Object}
     */
    getBaseConfig() {
        return this._baseConfig;
    }

    /**
     * Returns special task configuration module
     * @returns {Object}
     */
    getTaskConfig() {
        return this._taskConfig;
    }

    /**
     * This function is called after task initialization
     * Also you can override it in your own task module
     */
    afterInitialization() {
        this.logger.info(`Initialize "${this.name}" task successfully`);
    }

    /**
     * Prints log message. Also you can override it in your own task module
     * @param {String} name - task name
     */
    beforeRun(name) {
        console.log('\n');
        this.logger.info(`${this.name.toUpperCase()}`)
        this.logger.info(`Start to execute "${this.name}" task`);
    }

    /**
     * Performs task logic
     * @returns {*|Promise.<boolean>}
     */
    run() {
        // TODO implement in inheritances
        return Promise.resolve(true);
    }
}
