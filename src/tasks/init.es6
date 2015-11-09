import path from 'path';
import _ from 'lodash';
import vow from 'vow';
import vowNode from 'vow-node';
import fsExtra from 'fs-extra';
import Base from './base';

/**
 * @exports
 * @class LibrariesBase
 * @extends Base
 * @desc Initialization task
 */
export default class Init extends Base {

    /**
     * Returns logger module
     * @returns {module|Object|*}
     * @static
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Returns name of task
     * @returns {String}
     * @static
     */
    static getName() {
        return 'init';
    }

    /**
     * Creates folder for given path if it does not exists yet
     * @param {String} folder path to folder which should be created
     * @returns {Init}
     * @private
     */
    _createFolder(folder) {
        this.logger.debug(`Ensure that directory "${folder}" exists. Otherwise it will be created`);
        this.fsExtra.ensureDirSync(folder);
        return this;
    }

    /**
     * Loads new model from configured mode path
     * @returns {*|Promise.<T>}
     * @private
     */
    _loadNewModel() {
        return _.chain(this.getBaseConfig().getModelFilePath())
            .thru(vowNode.promisify(fsExtra.readJSON).bind(fsExtra))
            .value()
            .catch(error => {
                this.logger.error(`Can\'t read or parse model file ${this.getBaseConfig().getModelFilePath()}`);
                throw error;
            });
    }

    /**
     * Loads old model from cache
     * @returns {*|Promise.<T>}
     * @private
     */
    _loadOldModel() {
        return _.chain('model.json')
            .thru(path.join.bind(this, this.getBaseConfig().getCacheFolder()))
            .thru(filePath => this.readFileFromCache(filePath, true))
            .value()
            .catch(error => {
                if(error.code !== 'ENOENT') {
                    throw error;
                }
                this.logger.warn(`Can\'t read or parse model file. New model will be created instead`);
                return [];
            });
    }

    /**
     * Prints changes for all types to log
     * @param {Model} model - application model
     * @private
     */
    _logModelChanges(model) {
        ['added', 'modified', 'removed'].forEach(type => {
            model.getChanges().pages[type].forEach(item => {
                this.logger.debug(`Page with url: ${item.url} was ${type}`);
            });
        });
    }

    /**
     * Copies new model file into cache folder and replace old model file
     * @returns {Promise}
     * @private
     */
    _replaceModelFileInCache() {
        const newModelFilePath = this.getBaseConfig().getModelFilePath();
        const oldModelFilePath = path.join(this.getBaseConfig().getCacheFolder(), 'model.json');

        this.logger
            .info('Models were merged successfully')
            .debug('Copy new model file:')
            .debug(`==> from ${newModelFilePath}`)
            .debug(`==> to ${oldModelFilePath}`);

        return vowNode.promisify(fsExtra.copy).call(fsExtra, newModelFilePath, oldModelFilePath);
    }

    /**
     * Performs task
     * @returns {Promise}
     * @public
     */
    run(model) {
        this.beforeRun();

        this
            ._createFolder(this.getBaseConfig().getCacheFolder())
            ._createFolder(this.getBaseConfig().getDataFolder());

        return vow
            .all([
                this._loadOldModel(),
                this._loadNewModel()
            ])
            .spread((oldModel, newModel) => {
                model.setOldModel(oldModel);
                model.setNewModel(newModel);
            })
            .then(model.merge.bind(model))
            .then(this._logModelChanges.bind(this))
            .then(this._replaceModelFileInCache.bind(this))
            .then(model.normalize.bind(model, this.getBaseConfig().getLanguages()));
    }
}
