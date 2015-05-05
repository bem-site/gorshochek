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

    getBaseConfig() {
        return this._baseConfig;
    }

    getTaskConfig() {
        return this._taskConfig;
    }

    afterInitialization() {
        this.logger.info('Initialize "${this.name}" task successfully');
    }

    beforeRun(name) {
        this.logger.info('Start to execute "${this.name}" task');
    }

    run() {
        // TODO implement in inheritances
        return Promise.resolve(true);
    }
}
