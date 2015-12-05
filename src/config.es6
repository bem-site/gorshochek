const Logger = require('bem-site-logger');

export default class Config {

    /**
     * Constructor function
     * @param {String} logLevel - log verbosity level
     */
    constructor(logLevel) {
        const loggerSettings = {level: logLevel};

        this.logger = Logger.setOptions(loggerSettings).createLogger(module);

        this
            .setLogLevel(logLevel)
            .setModelFilePath(this.constructor.defaults.modelFilePath)
            .setDataFolder(this.constructor.defaults.dataFolder)
            .setCacheFolder(this.constructor.defaults.cacheFolder);

        this.logger.info('builder configuration has been initialized successfully');
    }

    /**
     * Returns default configuration object
     * @returns {{languages: String[], modelFilePath: String, dataFolder: String, cacheFolder: String}}
     */
    static get defaults() {
        return {
            modelFilePath: './model/model.json',
            dataFolder: './data',
            cacheFolder: './.builder/cache'
        };
    }

    /**
     * Sets logger verbosity level
     * @param {String} logLevel - logger verbosity level
     * @returns {Config}
     */
    setLogLevel(logLevel = 'debug') {
        this._loggerSettings = {level: logLevel};
        this.logger.debug(`config: logLevel = ${this._loggerSettings.level}`);
        return this;
    }

    /**
     * Sets path to model.json file
     * @param {String} modelFilePath - model file path
     * @returns {Config}
     */
    setModelFilePath(modelFilePath = this.constructor.defaults.modelFilePath) {
        this._modelFilePath = modelFilePath;
        this.logger.debug(`config: model file path = ${this._modelFilePath}`);
        return this;
    }

    /**
     * Sets path to destination data folder
     * @param {String} dataFolder - path to destination data folder
     * @returns {Config}
     */
    setDataFolder(dataFolder = this.constructor.defaults.dataFolder) {
        this._dataFolder = dataFolder;
        this.logger.debug(`config: destination dir path = ${this._dataFolder}`);
        return this;
    }

    /**
     * Sets path to cache folder
     * @param {String} cacheFolder - path to cache folder
     * @returns {Config}
     */
    setCacheFolder(cacheFolder = this.constructor.defaults.cacheFolder) {
        this._cacheFolder = cacheFolder;
        this.logger.debug(`config: cache dir path = ${this._cacheFolder}`);
        return this;
    }

    /**
     * Returns settings for logger
     * @returns {Object}
     */
    getLoggerSettings() {
        return this._loggerSettings;
    }

    /**
     * Returns path to model.json file
     * @returns {String}
     */
    getModelFilePath() {
        return this._modelFilePath;
    }

    /**
     * Returns destination data folder path
     * This folder will contain itself all build results
     * @returns {String}
     */
    getDataFolder() {
        return this._dataFolder;
    }

    /**
     * Returns path to cache directory
     * @returns {String}
     */
    getCacheFolder() {
        return this._cacheFolder;
    }
}
