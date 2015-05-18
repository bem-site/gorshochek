var fs = require('fs'),
    path = require('path'),
    https = require('https'),
    _ = require('lodash');

import Base from './base';
import People from '../model/people';

const META = {
    module: _.pick(module, 'filename'),
    name: 'load people data'
};

export default class LoadPeople extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    _onError(error, reject) {
        let errorMessage = 'Error occur while loading people.json file';
        this.logger.error(errorMessage);
        this.logger.error(error ? error.message : 'Error');
        return reject(new Error(errorMessage));
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
        var destinationPath = path.join(this.getBaseConfig().getCacheDirPath(), People.getFileName());

        this.logger.debug('load people.json file:');
        this.logger.debug(`from: ==> ${this.getTaskConfig().url}`);
        this.logger.debug(`to: ==> ${destinationPath}`);

        return new Promise((resolve, reject) => {
            https.get(this.getTaskConfig().url, response => {
                if (!response || response.statusCode !== 200) {
                    return this._onError(null, reject);
                }

                response
                    .pipe(fs.createWriteStream(destinationPath))
                    .on('finish', () => {
                        this.logger.debug('people.json was successfully downloaded and saved to local filesystem');
                        resolve(model);
                    });
            }).on('error', error => this._onError(error, reject));
        });
    }
}
