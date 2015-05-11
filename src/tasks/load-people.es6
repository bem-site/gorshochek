var fs = require('fs'),
    path = require('path'),
    request = require('request'),
    fsExtra = require('fs-extra'),
    _ = require('lodash');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'load people data'
};

export default class LoadPeople extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        /**
         * Необходимо загрузить json файл c данными по людям с удаленного источника и сохранить
         * локально на файловую систему в папку cache
         */
        var destinationPath = path.join(this.getBaseConfig().getCacheDirPath(), 'people.json');

        this.logger.debug('load people.json file:');
        this.logger.debug(`from: ==> ${this.getTaskConfig().url}`);
        this.logger.debug(`to: ==> ${destinationPath}`);

        return new Promise((resolve, reject) => {
            request({ url: this.getTaskConfig().url, json: true }, (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    let errorMessage = 'Error occur while loading people.json file';
                    this.logger.error(errorMessage);
                    this.logger.error(error ? error.message : 'Error');
                    return reject(new Error(errorMessage));
                }
                fsExtra.writeJSONSync(destinationPath, body);
                this.logger.debug('people.json file was loaded successfully and saved to cache');

                model.initPeople(body);
                return resolve(model);
            });
        });
    }
}
