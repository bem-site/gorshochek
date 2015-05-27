var _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'save data file'
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

        var dataFilePath = path.join(this.getBaseConfig().getDataFolder(), 'data.json');

        this.logger.debug('Save data file:');
        this.logger.debug(`==> to ${dataFilePath}`);

        return new Promise((resolve, reject) => {
            fs.writeFile(dataFilePath, JSON.stringify(model.getPages()), (error) => {
                if (error) {
                    this.logger.error('Error occur while saving data.json file');
                    this.logger.error(error.message);
                    return reject(error);
                }
                this.logger.info('Data file has been successfully saved to local filesystem');
                return resolve(model);
            });
        });
    }
}
