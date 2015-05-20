var path = require('path'),
    Logger = require('bem-site-logger');

export default class Config {
    constructor(basePath) {
        const CONF = {
            FOLDER: '.builder',
            FILE: 'make.js'
        };

        basePath = basePath || './';
        this.logger = Logger.createLogger(module);
        this.logger.info('start to initialize builder configuration from configuration file');

        var configFilePath = path.resolve(basePath, CONF.FOLDER, CONF.FILE),
            config;

        try {
            config = require(configFilePath);
        } catch (error) {
            let errorMessage = `Configuration file ./${CONF.FOLDER}/${CONF.FILE} not found or invalid.`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        this
            ._setLanguages(config)
            ._setLoggerSettings(config)
            ._setModelFilePath(config)
            ._setDestinationDirPath(config)
            ._setCacheDirPath(config)
            ._setTasks(config);

        this.logger.info('builder configuration has been initialized successfully');
    }

    /**
     * Sets array of given languages
     * @param {Object} config - configuration object
     * @returns {Config}
     * @private
     */
    _setLanguages(config) {
        this.languages = config.languages || ['en'];
        this.logger.debug(`config: languages = ${this.languages}`);
        return this;
    }

    /**
     * Sets logger settings
     * @param {Object} config - configuration object
     * @returns {Config}
     * @private
     */
    _setLoggerSettings(config) {
        this.loggerSettings = config.logger || { level: 'debug' };
        this.logger.debug(`config: logLevel = ${this.loggerSettings.level}`);
        return this;
    }

    /**
     * Sets path to model.json file
     * @param {Object} config - configuration object
     * @returns {Config}
     * @private
     */
    _setModelFilePath(config) {
        this.modelFilePath = config.modelFilePath || './model/model.json';
        this.logger.debug(`config: model file path = ${this.modelFilePath}`);
        return this;
    }

    /**
     * Sets path to destination data folder
     * @param {Object} config - configuration object
     * @returns {Config}
     * @private
     */
    _setDestinationDirPath(config) {
        this.destinationDirPath = config.dataDir || './data';
        this.logger.debug(`config: destination dir path = ${this.destinationDirPath}`);
        return this;
    }

    /**
     * Sets path to cache folder
     * @param {Object} config - configuration object
     * @returns {Config}
     * @private
     */
    _setCacheDirPath(config) {
        this.cacheDirPath = config.cacheDir || './.builder/cache';
        this.logger.debug(`config: cache dir path = ${this.cacheDirPath}`);
        return this;
    }

    /**
     * Sets tasks for execution
     * @param {Object} config - configuration object
     * @returns {Config}
     * @private
     */
    _setTasks(config) {
        this.tasks = config.tasks || [];
        return this;
    }

    /**
     * Returns array with languages
     * @returns {Array}
     */
    getLanguages() {
        return this.languages;
    }

    /**
     * Returns settings for logger
     * @returns {Object}
     */
    getLoggerSettings() {
        return this.loggerSettings;
    }

    /**
     * Returns path to model.json file
     * @returns {String}
     */
    getModelFilePath() {
        return this.modelFilePath;
    }

    /**
     * Returns destination folder path
     * This folder will contain itself all build results
     * @returns {String}
     */
    getDestinationDirPath() {
        return this.destinationDirPath;
    }

    /**
     * Returns path to cache directory
     * @returns {*|String}
     */
    getCacheDirPath() {
        return this.cacheDirPath;
    }

    /**
     * Returns array of tasks
     * @returns {Array}
     */
    getTasks() {
        return this.tasks;
    }
}
