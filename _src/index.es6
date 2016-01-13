import Q from 'q';
import Logger from 'bem-site-logger';

import Config from './config';
import Model from './model/model';

export default class Builder {

    /**
     * Initialize core builder module
     * @returns {Builder}
     */
    static init(logLevel) {
        return new Builder(logLevel);
    }

    /**
     * Constructor function
     * @param {String} logLevel - log verbosity level
     */
    constructor(logLevel) {
        this._config = new Config(logLevel);
        this.logger = Logger
            .setOptions(this.getConfig().getLoggerSettings())
            .createLogger(module);
        this._tasks = [];
    }

    /**
     * Returns tool configuration
     * @returns {*}
     */
    getConfig() {
        return this._config;
    }

    /**
     * Returns array of task that should be performed
     * @returns {Array}
     */
    getTasks() {
        return this._tasks;
    }

    /**
     * Overrides path to cache folder
     * @param {String} cacheFolder - path to cache folder
     * @returns {Builder}
     */
    setCacheFolder(cacheFolder) {
        this.getConfig().setCacheFolder(cacheFolder);
        return this;
    }

    /**
     * Overrides path to destination data folder
     * @param {String} dataFolder - path to data folder
     * @returns {Builder}
     */
    setDataFolder(dataFolder) {
        this.getConfig().setDataFolder(dataFolder);
        return this;
    }

    /**
     * Overrides path to model file
     * @param {String} modelFilePath - path to model file
     * @returns {Builder}
     */
    setModelFilePath(modelFilePath) {
        this.getConfig().setModelFilePath(modelFilePath);
        return this;
    }

    /**
     * Adds task to execution stack
     * @param {Base} Task - inheritance of Base task class
     * @param {Object} taskOptions - special task options
     * @returns {Builder}
     */
    addTask(Task, taskOptions = {}) {
        const dependencies = Task.getDependencies();
        const taskNames = this.getTasks().map((task) => {
            return task.constructor.name;
        });

        if(dependencies.length) {
            dependencies.forEach((dependency) => {
                if(taskNames.indexOf(dependency.name) === -1) {
                    throw new Error(`Task "${Task['name']}" requires "${dependency.name}" to be executed before it!`);
                }
            });
        }

        this.getTasks().push(new Task(this.getConfig(), taskOptions));
        return this;
    }

    /**
     * Run all tasks in queue by async chain
     * @returns {Promise}
     */
    run() {
        this.logger.info('-- START BUILD DATA --');
        return this.getTasks().reduce((prev, task) => {
            return prev.then(function(model) {
                task.beforeRun();
                return task.run(model);
            }.bind(task));
        }, Q(new Model()))
            .then(result => {
                this.logger.info('-- BUILD HAS BEEN FINISHED SUCCESSFULLY --');
                return result;
            })
            .catch(error => {
                this.logger
                    .error(error.message)
                    .error('-- BUILD HAS BEEN FAILED --');
                throw error;
            });
    }
}
