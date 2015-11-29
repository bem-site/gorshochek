import os from 'os';
import fs from 'fs';
import path from 'path';
import Q from 'q';
import _ from 'lodash';
import fsExtra from 'fs-extra';
import Logger from 'bem-site-logger';

export default class Base {

    /**
     * Constructor
     * @param {Config} baseConfig common configuration instance
     * @param {Object} taskConfig special task configuration object
     */
    constructor(baseConfig, taskConfig) {
        this._baseConfig = baseConfig;
        this._taskConfig = taskConfig || {};
        this.logger = Logger
            .setOptions(this.getBaseConfig().getLoggerSettings())
            .createLogger(this.constructor.getLoggerName());

        this.afterInitialization();
    }

    /**
     * Returns module for log purposes. Should be override in inherited classes
     * @returns {Object|module}
     * @protected
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Returns name of task. Should be override in inherited classes
     * @returns {String}
     * @protected
     * @static
     */
    static getName() {
        return 'base';
    }

    /**
     * Returns array of task dependencies
     * @returns {Array}
     * @static
     */
    static getDependencies() {
        return [];
    }

    /**
     * Provides fsExtra module
     * @returns {*}
     */
    get fsExtra() {
        return fsExtra;
    }

    /**
     * Returns general configuration object
     * @returns {Config}
     * @protected
     */
    getBaseConfig() {
        return this._baseConfig;
    }

    /**
     * Returns special task configuration module
     * @returns {Object}
     * @protected
     */
    getTaskConfig() {
        return this._taskConfig;
    }

    /**
     * This function is called after task initialization
     * Also you can override it in your own task module
     */
    afterInitialization() {
        this.logger.info(`Initialize "${this.constructor.getName()}" task successfully`);
    }

    /**
     * Prints log message. Also you can override it in your own task module
     */
    beforeRun() {
        if(process.env.NODE_ENV !== 'testing') {
            console.log(os.EOL);
        }
        this.logger
            .info(`${this.constructor.getName().toUpperCase()}`)
            .info(`Start to execute "${this.constructor.getName()}" task`);
    }

    /**
     * Reads file from cache folder
     * @param {String} filePath - path to file (relative to cache folder)
     * @returns {Promise}
     * @protected
     */
    readFileFromCache(filePath, isJSON = false) {
        const basePath = this.getBaseConfig().getCacheFolder();
        const func = isJSON ? fsExtra.readJSON : fs.readFile;
        filePath = path.join(basePath, filePath);

        return Q.nfcall(func, filePath, {encoding: 'utf-8'})
            .catch(error => {
                this.logger
                    .error(`Error occur while loading file ${filePath} from cache`)
                    .error(error.message);
                throw error;
            });
    }

    /**
     * Writes file to cache folder
     * @param {String} filePath - path to file (relative to cache folder)
     * @param {String} content of file
     * @returns {Promise}
     * @protected
     */
    writeFileToCache(filePath, content) {
        const basePath = this.getBaseConfig().getCacheFolder();

        filePath = path.join(basePath, filePath);
        const dirPath = path.dirname(filePath);

        return Q.nfcall(fsExtra.ensureDir, dirPath)
            .then(() => {
                return Q.nfcall(fs.writeFile, filePath, content, {encoding: 'utf-8'});
            })
            .catch(error => {
                this.logger
                    .error(`Error occur while saving file ${filePath} to cache`)
                    .error(error.message);
                throw error;
            });
    }

    /**
     * Processes all pages in model which satisfies to given criteria function
     * @param {Model} model - application model instance
     * @param {Function} criteria - page criteria function
     * @param {Function} processFunc - function which will be applied to each of pages filtered by criteria
     * @param {Number} portionSize - number of portion of pages for parallel operations
     * @returns {Promise}
     */
    processPagesAsync(model, criteria, processFunc, portionSize = 5) {
        const languages = this.getBaseConfig().getLanguages();

        criteria = criteria || _.constant(true);

        return _(criteria)
            .bind(this)
            .thru(f => model.getPagesByCriteria(f, languages))
            .chunk(portionSize)
            .reduce((prev, portion, index) => {
                return prev.then(() => {
                    this.logger.debug('process portion of pages in range %s - %s',
                        index * portionSize, (index + 1) * portionSize);
                    return Q.allSettled(portion.map(page => {
                        return processFunc.call(this, model, page, languages);
                    }));
                });
            }, Q());
    }

    /**
     * Performs task logic
     * @returns {*|Promise.<Boolean>}
     */
    run() {
        // TODO implement in inheritances
        return Q(true);
    }
}
