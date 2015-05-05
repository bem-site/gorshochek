var _ = require('lodash'),
    path = require('path'),
    fsExtra = require('fs-extra');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'load model files'
};

export default class LoadModelFiles extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run() {
        this.beforeRun(this.name);

        var newModelFilePath = this.getBaseConfig().getModelFilePath(),
            oldModelFilePath = path.join(this.getBaseConfig().getCacheDirPath(), 'model.json'),
            newModel,
            oldModel;

        try {
            newModel = fsExtra.readJSONSync(newModelFilePath);
        } catch (error) {
            let errorMessage = `Can\'t read or parse model file "${newModelFilePath}"`;
            this.logger.error(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }

        try {
            oldModel = fsExtra.readJSONSync(oldModelFilePath);
        } catch (error) {
            this.logger.warn(`Can\'t read or parse model file "${newModelFilePath}". New model will be created`);
            oldModel = [];
        }

        return Promise.resolve({ newModel: newModel, oldModel: oldModel });
    }
}
