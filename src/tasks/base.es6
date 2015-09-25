import os from 'os';
import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';
import vowNode from 'vow-node';
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

        return vowNode.invoke(func, filePath, {encoding: 'utf-8'})
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

        return vowNode.invoke(fsExtra.ensureDir, dirPath)
            .then(() => {
                return vowNode.invoke(fs.writeFile, filePath, content, {encoding: 'utf-8'});
            })
            .catch(error => {
                this.logger
                    .error(`Error occur while saving file ${filePath} to cache`)
                    .error(error.message);
                throw error;
            });
    }

    /**
     * Returns criteria function base on page object and language
     * This method shouldn't be called directly
     * It should be override in child classes of DocsBase class
     * @param {Object} page - page model object
     * @param {String} lang - language
     * @returns {Object|Boolean}
     * @protected
     */
    getCriteria(page, lang) {
        return false;
    }

    /**
     * Process single page for all page language version
     * This method shouldn't be called directly
     * It should be override in child classes of Base class
     * @param {Model} model - data model
     * @param {Object} page - page model object
     * @param {Array} languages - array of languages
     * @returns {*|Promise.<T>}
     * @protected
     */
    processPage(model, page, languages) {
        return Promise.resolve(page);
    }

    processPages(model, portionSize = 5) {
        const languages = this.getBaseConfig().getLanguages();
        const filteredPages = model.getPagesByCriteria(this.getCriteria, languages);
        const portions = _.chunk(filteredPages, portionSize);

        return portions.reduce((prev, portion, index) => {
            prev = prev.then(() => {
                this.logger.debug('process portion of pages in range %s - %s',
                    index * portionSize, (index + 1) * portionSize);
                return vow.allResolved(portion.map((page) => {
                    return this.processPage(model, page, languages);
                }));
            });
            return prev;
        }, vow.resolve());
    }

    /**
     * Performs task logic
     * @returns {*|Promise.<Boolean>}
     */
    run() {
        // TODO implement in inheritances
        return Promise.resolve(true);
    }
}
