import path from 'path';
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
     * Performs task
     * @returns {Promise}
     * @public
     */
    run(model) {
        this.beforeRun();

        [this.getBaseConfig().getCacheFolder(), this.getBaseConfig().getDataFolder()]
            .forEach(item => {
                this.logger.debug(`Ensure that directory "${item}" exists. Otherwise it will be created`);
                this.fsExtra.ensureDirSync(item);
            });

        const newModelFilePath = this.getBaseConfig().getModelFilePath();
        const oldModelFilePath = path.join(this.getBaseConfig().getCacheFolder(), 'model.json');

        try {
            model.setNewModel(this.fsExtra.readJSONSync(newModelFilePath));
        } catch (error) {
            const errorMessage = `Can\'t read or parse model file "${newModelFilePath}"`;
            this.logger.error(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }

        try {
            model.setOldModel(this.fsExtra.readJSONSync(oldModelFilePath));
        } catch (error) {
            this.logger.warn(`Can\'t read or parse model file "${newModelFilePath}". New model will be created instead`);
            model.setOldModel([]);
        }

        model.merge();

        ['added', 'modified', 'removed'].forEach(type => {
            model.getChanges().pages[type].forEach(item => {
                this.logger.debug(`Page with url: ${item.url} was ${type}`);
            });
        });

        this.logger
            .info('Models were merged successfully')
            .debug('Copy new model file:')
            .debug(`==> from ${newModelFilePath}`)
            .debug(`==> to ${oldModelFilePath}`);

        this.fsExtra.copySync(newModelFilePath, oldModelFilePath);

        model.normalize(this.getBaseConfig().getLanguages());
        return Promise.resolve(model);
    }
}
