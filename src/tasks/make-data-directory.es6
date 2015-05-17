var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'make data directory'
};

export default class MakeDataDirectory extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run() {
        this.beforeRun(this.name);

        /*
         * Нужно убедиться что директория ./data
         * (или другая сконфигурированная целевая директория для расположения конечных файлов)
         * существует. Если она не существует, то нужно ее создать.
         */
        var dir = this.getBaseConfig().getDestinationDirPath();
        this.logger.debug(`Ensure that directory "${dir}" exists. Otherwise it will be created`);

        return new Promise((resolve, reject) => {
            fs.mkdir(dir, error => {
                if(!error || (error && error.code === 'EEXIST')){
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    }
}
