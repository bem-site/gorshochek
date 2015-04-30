var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    inherit = require('inherit'),
    Logger = require('bem-site-logger');

module.exports = inherit({

    _CONF: {
        FOLDER: 'builder',
        FILE: 'make.js'
    },

    _logger: undefined,

    _languages: undefined,
    _loggerSettings: undefined,
    _modelFilePath: undefined,
    _destinationDirPath: undefined,
    _tasks: undefined,

    __constructor: function (basePath) {
        this._logger = Logger.createLogger(module);

        this._logger.info('start to initialize builder configuration from configuration file');

        var configFilePath = path.join(basePath, this._CONF.FOLDER, this._CONF.FILE),
            doesConfigurationFileExists = fs.existsSync(configFilePath),
            errorMessage,
            config;

        if (!doesConfigurationFileExists) {
            errorMessage = util.format(
                'Configuration file ./%s/%s not found.', this._CONF.FOLDER, this._CONF.FILE);
            this._logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            config = require(configFilePath);
        } catch (error) {
            errorMessage = util.format(
                'Configuration file ./%s/%s can not be loaded.', this._CONF.FOLDER, this._CONF.FILE);
            this._logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        this
            ._setLanguages(config)
            ._setLoggerSettings(config)
            ._setModelFilePath(config)
            ._setDestinationDirPath(config)
            ._setTasks(config);

        this._logger.info('builder configuration has been initialized successfully');
    },

    _setLanguages: function (config) {
        this._languages = config.languages || ['en'];
        this._logger.debug('config: languages = %s', this._languages);
        return this;
    },

    _setLoggerSettings: function (config) {
        this._loggerSettings = config.logger || { level: 'debug' };
        this._logger.debug('config: logLevel = %s', this._loggerSettings.level);
        return this;
    },

    _setModelFilePath: function (config) {
        this._modelFilePath = config.modelFilePath || './model/model.json';
        this._logger.debug('config: model file path = %s', this._modelFilePath);
        return this;
    },

    _setDestinationDirPath: function (config) {
        this._destinationDirPath = config.destDir || './data';
        this._logger.debug('config: destination dir path = %s', this._destinationDirPath);
        return this;
    },

    _setTasks: function (config) {
        this._tasks = config.tasks || [];
        return this;
    },

    getLanguages: function () {
        return this;
    },

    getLoggerSettings: function () {
        return this._loggerSettings;
    },

    getModelFilePath: function () {
        return this._modelFilePath;
    },

    getDestinationDirPath: function () {
        return this._destinationDirPath;
    },

    getTasks: function () {
        return this._tasks;
    }
});
