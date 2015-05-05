var _ = require('lodash'),
    path = require('path'),
    fsExtra = require('fs-extra');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'save model file'
};

export default class SaveModelFile extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        var newModelFilePath = this.getBaseConfig().getModelFilePath(),
            oldModelFilePath = path.join(this.getBaseConfig().getCacheDirPath(), 'model.json');

        this.logger.debug('Copy new model file:');
        this.logger.debug(`==> from ${newModelFilePath}`);
        this.logger.debug(`==> to ${oldModelFilePath}`);

        fsExtra.copySync(newModelFilePath, oldModelFilePath);
        return Promise.resolve(model);
    }
}
