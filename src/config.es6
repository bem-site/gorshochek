var path = require('path'),
    Logger = require('bem-site-logger');

export default class Config {
    constructor(logLevel) {
        var loggerSettings = { level: logLevel };

        this.logger = Logger.setOptions(loggerSettings).createLogger(module);

        this
            .setLanguages(this.defaults.languages)
            .setLogLevel(logLevel)
            .setModelFilePath(this.defaults.modelFilePath)
            .setDataFolder(this.defaults.dataFolder)
            .setCacheFolder(this.defaults.cacheFolder);

        this.logger.info('builder configuration has been initialized successfully');
    }

    get defaults() {
        return {
            languages: ['en'],
            modelFilePath: './model/model.json',
            dataFolder: './data',
            cacheFolder: './.builder/cache'
        };
    }

    /**
     * Sets array of given languages
     * @param {Array} languages - array of languages
     * @returns {Config}
     * @private
     */
    setLanguages(languages = this.defaults.languages) {
        this._languages = languages;
        this.logger.debug(`config: languages = ${this._languages}`);
        return this;
    }

    /**
     * Sets logger verbosity level
     * @param {String} logLevel - logger verbosity level
     * @returns {Config}
     * @private
     */
    setLogLevel(logLevel = 'debug') {
        this._loggerSettings = { level: logLevel };
        this.logger.debug(`config: logLevel = ${this._loggerSettings.level}`);
        return this;
    }

    /**
     * Sets path to model.json file
     * @param {String} modelFilePath - model file path
     * @returns {Config}
     * @private
     */
    setModelFilePath(modelFilePath = this.defaults.modelFilePath) {
        this._modelFilePath = modelFilePath;
        this.logger.debug(`config: model file path = ${this._modelFilePath}`);
        return this;
    }

    /**
     * Sets path to destination data folder
     * @param {String} dataFolder - path to destination data folder
     * @returns {Config}
     * @private
     */
    setDataFolder(dataFolder = this.defaults.dataFolder) {
        this._dataFolder = dataFolder;
        this.logger.debug(`config: destination dir path = ${this._dataFolder}`);
        return this;
    }

    /**
     * Sets path to cache folder
     * @param {String} cacheFolder - path to cache folder
     * @returns {Config}
     * @private
     */
    setCacheFolder(cacheFolder = this.defaults.cacheFolder) {
        this._cacheFolder = cacheFolder;
        this.logger.debug(`config: cache dir path = ${this._cacheFolder}`);
        return this;
    }

    /**
     * Returns array with languages
     * @returns {Array}
     */
    getLanguages() {
        return this._languages;
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
     * @returns {*|String}
     */
    getCacheFolder() {
        return this._cacheFolder;
    }
}
