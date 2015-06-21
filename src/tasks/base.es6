import os from 'os';
import fs from 'fs';
import path from 'path';
import Logger from 'bem-site-logger';

export default class Base {
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
     */
    static getName() {
        return 'base';
    }

    /**
     * Returns array of task dependencies
     * @returns {Array}
     */
    static getDependencies() {
        return [];
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
        this.logger.info(`Initialize "${this.constructor.getName()}" task successfully`);
    }

    /**
     * Prints log message. Also you can override it in your own task module
     * @param {String} name - task name
     */
    beforeRun() {
        if (process.env.NODE_ENV !== 'testing') {
            console.log(os.EOL);
        }
        this.logger.info(`${this.constructor.getName().toUpperCase()}`);
        this.logger.info(`Start to execute "${this.constructor.getName()}" task`);
    }

    /**
     * Reads file from cache folder
     * @param {String} filePath - path to file (relative to cache folder)
     * @returns {Promise}
     */
    readFileFromCache(filePath){
        var o = { encoding: 'utf-8' },
            basePath = this.getBaseConfig().getCacheFolder();

        return new Promise((resolve, reject) => {
            fs.readFile(path.join(basePath, filePath), o, (error, content) => {
                if (error) {
                    this.logger.error(`Error occur while loading file ${filePath} from cache`);
                    this.logger.error(error.message);
                    reject(error);
                } else {
                    resolve(content);
                }
            });
        });
    }

    /**
     * Writes file to cache folder
     * @param {String} filePath - path to file (relative to cache folder)
     * @param {String} content of file
     * @returns {Promise}
     */
    writeFileToCache(filePath, content){
        var o = { encoding: 'utf-8' },
            basePath = this.getBaseConfig().getCacheFolder();

        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(basePath, filePath), content, o, (error) => {
                if(error) {
                    this.logger.error(`Error occur while saving file ${filePath} to cache`);
                    this.logger.error(error.message);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
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
